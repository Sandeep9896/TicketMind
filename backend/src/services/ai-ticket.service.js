import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { completeChat } from './ai-client.service.js';
import * as ticketService from './ticket.service.js';
import { Ticket } from '../models/ticket.model.js';
import { assignAgentWithAi } from './ai-admin.service.js';
import ChatMessage from '../models/chat-message.model.js';

const categories = ['Hardware', 'Software', 'Network', 'Access', 'Security', 'Account', 'Billing', 'Other'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const mapProviderError = (error) => {
  if (error instanceof ApiError) return error;
  return new ApiError(StatusCodes.BAD_GATEWAY, error?.message || 'AI provider failed');
};

const parseToolArguments = (toolCall) => {
  try {
    const rawArguments = toolCall?.function?.arguments ?? toolCall?.arguments ?? {};
    return typeof rawArguments === 'string' ? JSON.parse(rawArguments) : rawArguments;
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

const appendChatMessage = ({ ticketId, userId, role, content, action = null }) =>
  ChatMessage.create({ ticketId, userId, role, content, action });

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
    return await completeChat(payload);
  } catch (error) {
    throw mapProviderError(error);
  }
};

const analyzeIssueWithAI = async ({ description, conversation, ticketId, forceCreateTicket = false }) => {
  const supportTools = [
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
            reply: { type: 'string', maxLength: 1200 }
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
  ];

  const response = await createChatCompletion({
    maxTokens: Math.max(env.aiMaxOutputTokens, 800),
    tools: forceCreateTicket
      ? supportTools.filter(({ function: { name } }) => name === 'create_ticket')
      : supportTools,
    tool_choice: forceCreateTicket
      ? { type: 'function', function: { name: 'create_ticket' } }
      : 'required',
    parallel_tool_calls: false,
    messages: [
      {
        role: 'system',
        content: `You are TicketMind AI support.

Use self_resolve for first-time issues that can be solved with troubleshooting. Keep its reply concise (no more than 120 words) so the tool arguments remain valid JSON.
Use create_ticket for failed troubleshooting, escalation requests, hardware damage, data loss, or complex issues.
Use update_ticket only when a ticket already exists and the user adds details.
${forceCreateTicket ? 'The user explicitly requested escalation. You must call create_ticket.' : ''}

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
  ticketId,
  forceCreateTicket = false,
}) => {
  try {
    if (ticketId) {
      await verifyTicketAccess({ ticketId, currentUser });
    }

    const storedConversation = ticketId
      ? (await ChatMessage.find({ ticketId })
          .sort({ createdAt: -1 })
          .limit(env.chatHistoryLimit)
          .lean())
          .reverse()
          .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
          .join('\n\n')
      : '';

    const context = [storedConversation, conversation]
      .filter((item) => item?.trim())
      .join('\n\n');
    const boundedContext = context.slice(-env.aiMaxConversationChars);

    if (ticketId) await appendChatMessage({ ticketId, userId: currentUser?._id, role: 'user', content: description });

    const { name, args } = await analyzeIssueWithAI({
      description,
      conversation: boundedContext,
      ticketId,
      forceCreateTicket
    });

    if (name === 'self_resolve') {
      if (ticketId) {
        await appendChatMessage({
          ticketId,
          userId: currentUser?._id,
          role: 'assistant',
          content: args.reply,
          action: 'self_resolve'
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
      });

      assignAgentWithAi(ticket).catch((error) => {
        console.error('[AI ADMIN] assignAgentWithAi failed:', error?.message || error);
      });

      const reply = "I've created a support ticket for your issue.";

      await appendChatMessage({
        ticketId: ticket._id,
        userId: currentUser?._id,
        role: 'user',
        content: description
      });
      await appendChatMessage({
        ticketId: ticket._id,
        userId: currentUser?._id,
        role: 'assistant',
        content: reply,
        action: 'ticket_created'
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

      await appendChatMessage({
        ticketId: idToUpdate,
        userId: currentUser?._id,
        role: 'assistant',
        content: reply,
        action: 'ticket_updated'
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
    messages: await ChatMessage.find({ ticketId }).sort({ createdAt: 1 }).lean()
  };
};

const getChatHistory = async ({ ticketId, userId, currentUser, limit = env.chatHistoryLimit }) => {
  await verifyTicketAccess({ ticketId, currentUser });
  const messages = await ChatMessage.find({ ticketId })
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Math.min(Number(limit) || env.chatHistoryLimit, 100)))
    .lean();

  return messages.reverse();
};

const summarizeTicketChatInBackground = async ({ ticketId }) => {
  try {
    const ticket = await Ticket.findById(ticketId).lean();
    const messages = await ChatMessage.find({ ticketId }).sort({ createdAt: 1 }).lean();
    if (!ticket || messages.length < env.chatSummaryThreshold) return;

    const response = await summarizeTicketConversation({
      conversation: messages
        .slice(-env.aiMaxConversationChars)
        .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
        .join('\n\n'),
      description: `${ticket.title}\n${ticket.description}\n${ticket.aiChatSummary || ''}`
    });

    await Ticket.updateOne({ _id: ticketId }, { $set: { aiChatSummary: response.summary || ticket.aiChatSummary || '' } });
  } catch (error) {
    console.error('[TICKET CHAT SUMMARY] Background update failed:', error?.message || error);
  }
};

const chat = async ({ ticketId, userId, content, currentUser }) => {
  const ticket = await verifyTicketAccess({ ticketId, currentUser });
  const recentMessages = await getChatHistory({ ticketId, userId, currentUser, limit: env.chatHistoryLimit });

  await ChatMessage.create({ ticketId, userId, role: 'user', content });

  const ticketComments = (ticket.comments || [])
    .slice(-10)
    .map((comment) => `Comment: ${comment.comment}`)
    .join('\n');
  const context = [
    {
      role: 'system',
      content: `You are TicketMind, an IT helpdesk assistant for one ticket only.
Use only this ticket's information, summary, comments, and chat messages.
Never use or mention another ticket. Return exactly one tool call.
Use self_resolve for troubleshooting, get_ticket_status for status questions, add_comment when the user asks to record a comment, and update_ticket only for explicit ticket updates.`
    },
    {
      role: 'system',
      content: `CURRENT TICKET:
ID: ${ticket._id}
Title: ${ticket.title}
Description: ${ticket.description}
Category: ${ticket.category}
Priority: ${ticket.priority}
Status: ${ticket.status}
AI CHAT SUMMARY: ${ticket.aiChatSummary || 'No summary yet'}
COMMENTS:
${ticketComments || 'None'}`
    },
    ...recentMessages.map((message) => ({ role: message.role, content: message.content })),
    { role: 'user', content }
  ];

  const response = await createChatCompletion({
    maxTokens: Math.max(env.aiMaxOutputTokens, 800),
    messages: context,
    tools: [
      {
        type: 'function',
        function: {
          name: 'self_resolve',
          description: 'Provide concise troubleshooting guidance. Keep reply under 120 words.',
          parameters: {
            type: 'object',
            properties: { reply: { type: 'string', maxLength: 1200 } },
            required: ['reply']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_ticket_status',
          description: 'Report the current status of this ticket.',
          parameters: { type: 'object', properties: {}, additionalProperties: false }
        }
      },
      {
        type: 'function',
        function: {
          name: 'add_comment',
          description: 'Add a comment to this ticket.',
          parameters: {
            type: 'object',
            properties: { comment: { type: 'string', maxLength: 2000 } },
            required: ['comment']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_ticket',
          description: 'Update this ticket when explicitly requested.',
          parameters: {
            type: 'object',
            properties: { updateData: { type: 'object' } },
            required: ['updateData']
          }
        }
      }
    ],
    tool_choice: 'required',
    parallel_tool_calls: false
  });

  const toolCall = response?.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new ApiError(StatusCodes.BAD_GATEWAY, 'AI failed to determine an action');

  const args = parseToolArguments(toolCall);
  let reply;
  let action = { type: toolCall.function.name, status: 'success' };

  if (toolCall.function.name === 'self_resolve') {
    reply = args.reply;
  } else if (toolCall.function.name === 'get_ticket_status') {
    reply = `Ticket ${ticket._id} is currently ${ticket.status}.`;
    action.resourceId = ticket._id.toString();
  } else if (toolCall.function.name === 'add_comment') {
    const updatedTicket = await ticketService.addCommunication({
      ticketId,
      communication: args.comment,
      currentUser
    });
    reply = `I've added your comment to ticket ${updatedTicket._id}.`;
    action.resourceId = updatedTicket._id.toString();
  } else if (toolCall.function.name === 'update_ticket') {
    const updatedTicket = await ticketService.updateTicket({
      ticketId,
      updateData: args.updateData || {},
      currentUser
    });
    reply = `I've updated ticket ${updatedTicket._id}.`;
    action.resourceId = updatedTicket._id.toString();
  } else {
    throw new ApiError(StatusCodes.BAD_GATEWAY, `Invalid AI action: ${toolCall.function.name}`);
  }

  await ChatMessage.create({ ticketId, userId, role: 'assistant', content: reply, action });
  setImmediate(() => summarizeTicketChatInBackground({ ticketId }));

  return { reply, action };
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
  ,chat, getChatHistory
};
