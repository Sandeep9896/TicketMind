import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  clearChatError,
  createTicketFromChatbot,
  loadChatHistory,
  resetChat,
  sendChatMessage
} from '../../redux/slices/chatSlice';

const UserChatbotPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const params = useParams();
  const ticket = state?.ticket;
  const ticketId = params.ticketId || ticket?._id;
  const { messages, isLoading, isSending, error } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(resetChat());
    if (ticketId) dispatch(loadChatHistory(ticketId));
  }, [dispatch, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const submitMessage = (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || isSending) return;
    if (!ticketId) {
      dispatch(createTicketFromChatbot(content))
        .unwrap()
        .then(({ response }) => {
          const createdTicket = response?.ticket;
          if (createdTicket?.id) {
            navigate('/user/my-tickets');
          }
        });
    } else {
      dispatch(sendChatMessage({ ticketId, content }));
    }
    setMessage('');
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/50 p-4">
        <div className="mx-auto max-w-4xl">
          <button type="button" onClick={() => navigate('/user/my-tickets')} className="mb-2 text-sm text-cyan-300">
            ← Back to tickets
          </button>
          <h1 className="text-2xl font-semibold text-white">{ticket?.title || 'Create a ticket with TicketMind'}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {ticketId ? 'This chat is private to this ticket.' : 'Describe your issue and TicketMind will create a ticket for you.'}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto p-4">
        {!ticketId ? (
          <div className="flex h-full items-center justify-center text-center text-slate-400">
            Describe your issue below. TicketMind will create a ticket and save this chat to it.
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-400">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 text-5xl">💬</div>
            <h2 className="mb-2 text-2xl font-semibold text-white">{ticketId ? 'Start a conversation' : 'Create a new ticket'}</h2>
            <p className="max-w-md text-slate-400">
              {ticketId
                ? 'Ask questions about this ticket. TicketMind will remember this discussion.'
                : 'Tell me what is wrong, and I will create a ticket and continue the conversation inside it.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((item, index) => (
              <div key={`${item.createdAt || 'message'}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl rounded-lg px-4 py-3 ${item.role === 'user' ? 'rounded-br-none bg-cyan-600 text-white' : 'rounded-bl-none bg-slate-800 text-slate-100'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
            {isSending ? <div className="text-sm text-slate-400">TicketMind is thinking...</div> : null}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error ? (
        <div className="mx-auto w-full max-w-4xl px-4 pb-2">
          <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            <span>{error}</span>
            <button type="button" onClick={() => dispatch(clearChatError())} className="ml-4">Dismiss</button>
          </div>
        </div>
      ) : null}

      <div className="border-t border-slate-800 bg-slate-900/50 p-4">
        <form onSubmit={submitMessage} className="mx-auto flex max-w-4xl gap-3">
          <textarea
            rows={1}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && event.ctrlKey) submitMessage(event);
            }}
            disabled={isSending}
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-60"
            placeholder="Type your message... (Ctrl+Enter to send)"
          />
          <button type="submit" disabled={isSending || !message.trim()} className="rounded-lg bg-cyan-500 px-6 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
            {isSending ? '...' : ticketId ? 'Send' : 'Create ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserChatbotPage;
