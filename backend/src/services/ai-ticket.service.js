import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import { getGroqClient, getGroqModel } from './ai-client.service.js';
import * as ticketService from './ticket.service.js';
import { Ticket } from '../models/ticket.model.js';
import { assignAgentWithAi } from './ai-admin.service.js';
import {
  appendConversationMessages,
  getConversationContext,
  getConversationMessages
} from './conversation.service.js';

const categories = ['Hardware', 'Software', 'Network', 'Access', 'Security', 'Account', 'Billing', 'Other'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const mapProviderError = (error) => {
  if (error instanceof ApiError) return error;
  return new ApiError(StatusCodes.BAD_GATEWAY, error?.message || 'AI provider failed');
};

const parseToolArguments = (toolCall) => {
  try {
    return JSON.parse(toolCall?.function?.arguments || '{}');
  } catch {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'AI returned invalid tool arguments');
  }
};

const getTextContent = (message) => {
  const content = message?.content;

  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((item) => item?.text || '').join('').trim();
  if (content?.text) return content.text;

  return '';
};

const normalizeCategory = (value) => (categories.includes(value) ? value : 'Other');
const normalizePriority = (value) => (priorities.includes(value) ? value : 'medium');

const verifyTicketAccess = async ({ ticketId, currentUser }) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
  }

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = ticket.createdBy?.toString() === currentUser?._id?.toString();
  const isAssignedAgent =
    currentUser?.role === 'agent' &&
    ticket.assignedTo &&
    ticket.assignedTo.toString() === currentUser?._id?.toString();

  if (!isAdmin && !isOwner && !isAssignedAgent) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Not allowed to access this ticket conversation');
  }

  return ticket;
};

const createChatCompletion = async (payload) => {
  try {
    const client = getGroqClient();
    return await client.chat.completions.create({
      model: getGroqModel(),
      temperature: 0.2,
      ...payload
    });
  } catch (error) {
    throw mapProviderError(error);
  }
};

const analyzeIssueWithAI = async ({ description, conversation, ticketId }) => {
  const response = await createChatCompletion({
    tools: [
      {
        type: 'function',
        function: {
          name: 'self_resolve',
          description: 'Use when issue can likely be solved with troubleshooting steps.',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: categories },
              priority: { type: 'string', enum: priorities },
              reply: { type: 'string' }
            },
            required: ['category', 'priority', 'reply']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_ticket',
          description: 'Use when the issue requires human support or the user requests escalation.',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: categories },
              priority: { type: 'string', enum: priorities },
              ticketTitle: { type: 'string' },
              ticketDescription: { type: 'string' }
            },
            required: ['category', 'priority', 'ticketTitle', 'ticketDescription']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_ticket',
          description: 'Use when the user adds details to an existing ticket.',
          parameters: {
            type: 'object',
            properties: {
              ticketId: { type: 'string' },
              updateData: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string', enum: priorities },
                  category: { type: 'string', enum: categories },
                  status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] }
                }
              }
            },
            required: ['ticketId', 'updateData']
          }
        }
      }
    ],
    tool_choice: 'auto',
    messages: [
      {
        role: 'system',
        content: `You are TicketMind AI support.

Use self_resolve for first-time issues that can be solved with troubleshooting.
Use create_ticket for failed troubleshooting, escalation requests, hardware damage, data loss, or complex issues.
Use update_ticket only when a ticket already exists and the user adds details.

Return only one tool call. Categories: ${categories.join(', ')}. Priorities: ${priorities.join(', ')}.`
      },
      {
        role: 'user',
        content: `Issue:\n${description}\n\nTicket context:\n${conversation || 'None'}${ticketId ? `\n\nExisting Ticket ID: ${ticketId}` : ''}`
      }
    ]
  });

  const toolCall = response?.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'AI failed to determine action');
  }

  return {
    name: toolCall.function.name,
    args: parseToolArguments(toolCall)
  };
};

const analyzeTicket = async (description) => {
  const response = await createChatCompletion({
    tools: [
      {
        type: 'function',
        function: {
          name: 'analyze_ticket',
          description: 'Analyze a support ticket draft.',
          parameters: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: categories },
              priority: { type: 'string', enum: priorities },
              suggestedTitles: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 3
              },
              suggestedDescriptions: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 3
              }
            },
            required: ['category', 'priority', 'suggestedTitles', 'suggestedDescriptions']
          }
        }
      }
    ],
    tool_choice: { type: 'function', function: { name: 'analyze_ticket' } },
    messages: [
      { role: 'system', content: 'Analyze support ticket drafts and return structured suggestions.' },
      { role: 'user', content: description }
    ]
  });

  const args = parseToolArguments(response?.choices?.[0]?.message?.tool_calls?.[0]);

  return {
    category: normalizeCategory(args.category),
    priority: normalizePriority(args.priority),
    suggestedTitles: Array.isArray(args.suggestedTitles) ? args.suggestedTitles.slice(0, 3) : [],
    suggestedDescriptions: Array.isArray(args.suggestedDescriptions) ? args.suggestedDescriptions.slice(0, 3) : []
  };
};

const suggestDescriptions = async (title) => {
  const response = await createChatCompletion({
    tools: [
      {
        type: 'function',
        function: {
          name: 'suggest_descriptions',
          description: 'Create short support ticket descriptions from a title.',
          parameters: {
            type: 'object',
            properties: {
              descriptions: {
                type: 'array',
                items: { type: 'string' },
                minItems: 2,
                maxItems: 3
              }
            },
            required: ['descriptions']
          }
        }
      }
    ],
    tool_choice: { type: 'function', function: { name: 'suggest_descriptions' } },
    messages: [
      { role: 'system', content: 'Generate 2-3 concise support ticket descriptions from the user title.' },
      { role: 'user', content: title }
    ]
  });

  const args = parseToolArguments(response?.choices?.[0]?.message?.tool_calls?.[0]);

  return {
    descriptions: Array.isArray(args.descriptions) ? args.descriptions.slice(0, 3) : []
  };
};

const generateProfessionalReply = async ({
  ticketTitle,
  description,
  conversation,
  currentUser,
  ticketId
}) => {
  try {
    if (ticketId) {
      await verifyTicketAccess({ ticketId, currentUser });
    }

    const storedConversation = await getConversationContext({
      ticketId,
      userId: currentUser?._id
    });

    const context = [storedConversation, conversation]
      .filter((item) => item?.trim())
      .join('\n\n');

    const { name, args } = await analyzeIssueWithAI({
      description,
      conversation: context,
      ticketId
    });

    if (name === 'self_resolve') {
      if (ticketId) {
        await appendConversationMessages({
          ticketId,
          userId: currentUser?._id,
          messages: [
            { role: 'user', content: description },
            {
              role: 'assistant',
              content: args.reply,
              action: 'self_resolve',
              metadata: {
                askFollowUp: true,
                category: normalizeCategory(args.category),
                priority: normalizePriority(args.priority)
              }
            }
          ]
        });
      }

      return {
        success: true,
        action: 'self_resolve',
        category: normalizeCategory(args.category),
        priority: normalizePriority(args.priority),
        reply: args.reply,
        askFollowUp: true
      };
    }

    if (name === 'create_ticket') {
      const ticket = await ticketService.createTicket({
        title: args.ticketTitle || ticketTitle || 'Support Request',
        description: args.ticketDescription || description,
        priority: normalizePriority(args.priority),
        category: normalizeCategory(args.category),
        createdBy: currentUser?._id,
        conversationContent: description
      });

      assignAgentWithAi(ticket).catch((error) => {
        console.error('[AI ADMIN] assignAgentWithAi failed:', error?.message || error);
      });

      const reply = "I've created a support ticket for your issue.";

      await appendConversationMessages({
        ticketId: ticket._id,
        userId: currentUser?._id,
        messages: [
          {
            role: 'assistant',
            content: reply,
            action: 'ticket_created',
            metadata: {
              ticketId: ticket._id,
              title: ticket.title,
              status: ticket.status,
              priority: ticket.priority,
              category: ticket.category
            }
          }
        ]
      });

      return {
        success: true,
        action: 'ticket_created',
        reply,
        ticket: {
          id: ticket._id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category
        }
      };
    }

    if (name === 'update_ticket') {
      const idToUpdate = args.ticketId || ticketId;

      if (!idToUpdate) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Ticket ID is required to update');
      }

      const ticket = await ticketService.updateTicket({
        ticketId: idToUpdate,
        updateData: args.updateData || {},
        currentUser
      });

      const reply = "I've updated your support ticket.";

      await appendConversationMessages({
        ticketId: idToUpdate,
        userId: ticket.createdBy?._id || ticket.createdBy,
        messages: [
          { role: 'user', content: description },
          {
            role: 'assistant',
            content: reply,
            action: 'ticket_updated',
            metadata: {
              updateData: args.updateData || {},
              status: ticket.status,
              priority: ticket.priority,
              category: ticket.category
            }
          }
        ]
      });

      return {
        success: true,
        action: 'ticket_updated',
        reply,
        ticket: {
          id: ticket._id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
          description: ticket.description
        }
      };
    }

    throw new ApiError(StatusCodes.BAD_GATEWAY, `Invalid AI action: ${name}`);
  } catch (error) {
    throw mapProviderError(error);
  }
};

const getTicketConversation = async ({ ticketId, currentUser }) => {
  const ticket = await verifyTicketAccess({ ticketId, currentUser });

  return {
    ticketId,
    messages: await getConversationMessages({
      ticketId,
      userId: ticket.createdBy
    })
  };
};

const categorizeTicket = async (description) => {
  const result = await analyzeTicket(description);
  return { category: result.category };
};

const detectPriority = async (description) => {
  const result = await analyzeTicket(description);
  return { priority: result.priority };
};

const summarizeTicketConversation = async ({ conversation, description = '' }) => {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'Summarize this support ticket conversation in 3-5 concise bullet points.'
      },
      {
        role: 'user',
        content: `Ticket description:\n${description || 'N/A'}\n\nConversation:\n${conversation}`
      }
    ]
  });

  return {
    summary: getTextContent(response?.choices?.[0]?.message)
  };
};

export {
  analyzeTicket,
  categorizeTicket,
  detectPriority,
  generateProfessionalReply,
  getTicketConversation,
  suggestDescriptions,
  summarizeTicketConversation
};
