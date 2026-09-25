import { getGroqClient, getGroqModel } from "./ai-client.service.js";
import userModel from "../models/user.model.js";
import { Ticket } from "../models/ticket.model.js";

const getAgentsInfo = async (agentType) => {
    const baseQuery = { role: 'agent' };
    const filteredQuery = agentType ? { ...baseQuery, agentType } : baseQuery;

    const filteredAgents = await userModel.find(filteredQuery).select('name agentType').lean();
    console.log('[AI ADMIN] filtered agents count:', filteredAgents?.length || 0, 'agentType:', agentType || 'none');

    if (filteredAgents?.length) {
        return filteredAgents.map(agent => `- ${agent.name}: ${agent.agentType || 'general'}`).join('\n');
    }

    const allAgents = await userModel.find(baseQuery).select('name agentType').lean();
    console.log('[AI ADMIN] fallback all agents count:', allAgents?.length || 0);

    if (!allAgents || allAgents.length === 0) return '';

    return allAgents.map(agent => `- ${agent.name}: ${agent.agentType || 'general'}`).join('\n');
};

const assignAgentWithAi = async (ticketData) => {
    console.log('[AI ADMIN] assignAgentWithAi start:', {
        ticketId: ticketData?._id || ticketData?.id || ticketData?.ticketId,
        title: ticketData?.title,
        category: ticketData?.category,
        agentType: ticketData?.agentType
    });

    let groqClient;
    try {
        groqClient = getGroqClient();
    } catch (error) {
        console.error('[AI ADMIN] getGroqClient failed:', error?.message || error);
        return null;
    }

    // Use explicit agentType if provided, otherwise use category as-is
    const agentType = ticketData?.agentType || ticketData?.category;
    const agentsList = await getAgentsInfo(agentType);

    if (!agentsList) {
        console.warn('[AI ADMIN] no agents found, skipping assignment');
        return null;
    }

    console.log('[AI ADMIN] agents list prepared, sending request to AI');

    const messages = [
        {
            role: "system",
            content: "You are an assistant for a customer support ticketing system. Recommend the most suitable support agent for a ticket based on title, description, category and priority. Return only the agent's full name (no extra text)."
        },
        {
            role: "user",
            content: `Ticket:\nTitle: ${ticketData?.title || 'N/A'}\nDescription: ${ticketData?.description || 'N/A'}\nCategory: ${ticketData?.category || 'N/A'}\nPriority: ${ticketData?.priority || 'N/A'}\n\nAvailable agents:\n${agentsList}\n\nRespond with only the full name of the best agent to assign.`
        }
    ];

    let response;
    try {
        response = await groqClient.chat.completions.create({
            model: getGroqModel(),
            messages
        });
    } catch (error) {
        console.error('[AI ADMIN] AI completion failed:', error?.message || error);
        return null;
    }

    console.log('[AI ADMIN] AI completion succeeded');

    const text = response?.choices?.[0]?.message?.content || response?.choices?.[0]?.message || '';
    const raw = String(text).trim();

    // Try to extract a name (first non-empty line)
    const firstLine = raw.split(/\r?\n/).map(l => l.trim()).find(l => l);
    const nameCandidate = firstLine ? firstLine.replace(/^[-–•\s]+/, '').trim() : raw;

    if (!nameCandidate) {
        console.warn('[AI ADMIN] empty agent name returned by AI');
        return null;
    }

    // Find agent by (case-insensitive) exact or partial match on name
    const agent = await userModel.findOne({
        role: 'agent',
        name: { $regex: `^${nameCandidate.replace(/[-/\\^$*+?.()|[\]{}]/g, '')}$`, $options: 'i' }
    }).select('-password').lean();

    // If not exact match, try contains
    let chosen = agent;
    if (!chosen) {
        chosen = await userModel.findOne({ role: 'agent', name: { $regex: nameCandidate, $options: 'i' } }).select('-password').lean();
    }

    const ticketId = ticketData?._id || ticketData?.id || ticketData?.ticketId;

    // If we have an agent and a ticketId, assign the ticket asynchronously (fire-and-forget)
    if (chosen && ticketId) {
        setImmediate(async () => {
            try {
                await Ticket.findByIdAndUpdate(ticketId, { assignedTo: chosen._id }, { new: true });
                console.log(`[AI ADMIN] Assigned ticket ${ticketId} to agent ${chosen._id}`);
            } catch (err) {
                console.error('[AI ADMIN] Failed to assign ticket:', err?.message || err);
            }
        });
    }

    return chosen || null;
};

export { assignAgentWithAi, getAgentsInfo };