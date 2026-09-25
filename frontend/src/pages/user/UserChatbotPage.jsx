import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { chatReplyRequest, getTicketConversationRequest } from '../../services/api/ai.api';

const UserChatbotPage = () => {
  const location = useLocation();
  const linkedTicket = location.state?.ticket || null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketTitle, setTicketTitle] = useState(linkedTicket?.title || '');
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (linkedTicket?.title) {
      setTicketTitle(linkedTicket.title);
    }
  }, [linkedTicket]);

  useEffect(() => {
    const loadTicketConversation = async () => {
      // Only load if linked to a specific ticket
      if (!linkedTicket?._id) {
        console.log('[FRONTEND CHAT] No linked ticket, starting fresh conversation');
        return;
      }

      console.log('[FRONTEND CHAT] Loading conversation for ticket:', linkedTicket._id);

      try {
        const result = await getTicketConversationRequest(linkedTicket._id);
        console.log('[FRONTEND CHAT] API Response:', result);

        const history = result?.data?.messages || [];
        console.log('[FRONTEND CHAT] Extracted history:', {
          messageCount: history.length,
          messages: history.map(h => ({ role: h.role, preview: h.content.substring(0, 50) }))
        });

        if (!history.length) {
          console.log('[FRONTEND CHAT] No history found, starting fresh conversation');
          return;
        }

        const mappedMessages = history.map((item) => ({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: item.content,
          action: item.action,
          askFollowUp: Boolean(item?.metadata?.askFollowUp)
        }));

        console.log('[FRONTEND CHAT] Mapped messages:', {
          count: mappedMessages.length,
          messages: mappedMessages.map(m => ({ role: m.role, preview: m.content.substring(0, 50) }))
        });

        setMessages(mappedMessages);
        console.log('[FRONTEND CHAT] Messages state updated');

        const latestAssistantMessage = [...mappedMessages]
          .reverse()
          .find((item) => item.role === 'assistant');
        setAwaitingFollowUp(Boolean(latestAssistantMessage?.askFollowUp));
        console.log('[FRONTEND CHAT] Set awaitingFollowUp to:', Boolean(latestAssistantMessage?.askFollowUp));
      } catch (historyError) {
        console.error('[FRONTEND CHAT] Error loading history:', historyError);
        setError(historyError?.response?.data?.message || 'Failed to load previous conversation');
      }
    };

    loadTicketConversation();
  }, [linkedTicket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildConversationString = () => {
    return messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  };

  const chatbot = async (event) => {
    event.preventDefault();
    setError('');
    
    if (!message.trim()) return;

    console.log('[FRONTEND CHAT] Sending message:', {
      message: message.substring(0, 50),
      ticketId: linkedTicket?._id,
      awaitingFollowUp,
      currentMessageCount: messages.length
    });

    const userMessage = { role: 'user', content: message };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      console.log('[FRONTEND CHAT] Updated messages state:', {
        newCount: updated.length,
        lastMessage: updated[updated.length - 1]
      });
      return updated;
    });
    setMessage('');
    setIsLoading(true);

    try {
      const conversationStr = buildConversationString();
      console.log('[FRONTEND CHAT] Conversation string built:', {
        length: conversationStr.length,
        preview: conversationStr.substring(0, 100)
      });

      const payload = {
        ticketTitle,
        description: message,
        conversation: conversationStr,
        isFollowUp: awaitingFollowUp,
        ticketId: linkedTicket?._id
      };

      console.log('[FRONTEND CHAT] Sending payload to backend:', payload);

      const response = await chatReplyRequest(payload);

      console.log('[FRONTEND CHAT] Full API response:', response);
      
      const replyData = response?.data || {};
      console.log('[FRONTEND CHAT] Reply data:', replyData);
      console.log('[FRONTEND CHAT] askFollowUp value:', replyData.askFollowUp);
      console.log('[FRONTEND CHAT] reply value:', replyData.reply);
      
      let assistantContent = replyData.reply;

      if (!assistantContent) {
        console.error('[FRONTEND CHAT] No reply in response:', replyData);
        assistantContent = replyData.reply || 'Received response from server, but unable to parse reply.';
      }

      if (replyData.action === 'ticket_created' && replyData.ticket?.id) {
        assistantContent = `${replyData.reply}\n\nTicket ID: ${replyData.ticket.id}\nTitle: ${replyData.ticket.title}\nPriority: ${replyData.ticket.priority}\nCategory: ${replyData.ticket.category}`;
      }

      const aiMessage = {
        role: 'assistant',
        content: assistantContent,
        tone: replyData.tone,
        askFollowUp: replyData.askFollowUp || false,
        action: replyData.action
      };
      
      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        console.log('[FRONTEND CHAT] Added AI message, total count:', updated.length);
        return updated;
      });
      
      setAwaitingFollowUp(Boolean(aiMessage.askFollowUp));
      console.log('[FRONTEND CHAT] Message exchange completed successfully');
    } catch (submitError) {
      console.error('[FRONTEND CHAT] Error details:', submitError);
      console.error('[FRONTEND CHAT] Error response:', submitError?.response?.data);
      setError(submitError?.response?.data?.message || submitError?.message || 'Chatbot reply failed');
      setMessages((prev) => {
        const updated = prev.slice(0, -1);
        console.log('[FRONTEND CHAT] Removed failed user message, count:', updated.length);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-white">Support Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">AI-powered help for your support issues</p>
          {linkedTicket ? (
            <p className="mt-2 inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-100">
              Linked Ticket: {linkedTicket.title} ({linkedTicket._id})
            </p>
          ) : null}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Start a conversation</h2>
            <p className="text-slate-400 max-w-md">
              Ask your question and I'll help you troubleshoot your issue. I'll remember the context of our conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.tone && (
                      <p className="text-xs mt-2 opacity-70">Tone: {msg.tone}</p>
                    )}
                  </div>
                </div>
                
                {msg.role === 'assistant' && msg.askFollowUp && (
                  <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100">
                    Reply with what happened after trying the steps, or describe what is still not working.
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl w-full mx-auto px-4 pb-2">
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/50 p-4">
        <form onSubmit={chatbot} className="max-w-4xl mx-auto space-y-3">
          {/* Title Input - only show if no messages */}
          {messages.length === 0 && (
            <div>
              <input
                type="text"
                value={ticketTitle}
                onChange={(event) => setTicketTitle(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400 text-sm"
                placeholder="What's your issue about? (optional)"
              />
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-3">
            <textarea
              rows={1}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && event.ctrlKey) {
                  chatbot(event);
                }
              }}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 outline-none transition focus:border-cyan-400 resize-none max-h-32 text-sm"
              placeholder={awaitingFollowUp ? 'Tell me whether the steps worked or what is still happening...' : 'Type your message... (Ctrl+Enter to send)'}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:cursor-not-allowed px-6 py-2 rounded-lg  text-[var(--tm-text)] font-medium transition text-sm"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserChatbotPage;
