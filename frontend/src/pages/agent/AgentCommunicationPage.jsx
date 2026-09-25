import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { addCommunicationRequest, adminTicketsRequest } from '../../services/api/ticket.api';

const formatStatusLabel = (status = '') => status.replace('_', ' ');

const statusBadgeClass = (status) => {
  const variants = {
    open: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100',
    in_progress: 'border-amber-300/40 bg-amber-300/15 text-amber-100',
    resolved: 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100',
    closed: 'border-slate-300/30 bg-slate-300/10 text-slate-200'
  };

  return variants[status] || variants.closed;
};

const AgentCommunicationPage = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [communication, setCommunication] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const communicationCountRef = useRef({});

  const loadTickets = useCallback(async ({ silent = false } = {}) => {
    try {
      const result = await adminTicketsRequest();
      const assignedTickets = (result.data || []).filter(
        (ticket) => String(ticket.assignedTo?._id || '') === String(currentUserId || '')
      );

      const nextCountMap = assignedTickets.reduce((map, ticket) => {
        map[ticket._id] = (ticket.comments || []).length;
        return map;
      }, {});

      if (silent && selectedTicketId) {
        const previousCount = communicationCountRef.current[selectedTicketId] || 0;
        const selected = assignedTickets.find((ticket) => ticket._id === selectedTicketId);
        const latestCommunication = selected?.comments?.[selected.comments.length - 1];
        const latestCommunicationBy = String(latestCommunication?.commentedBy?._id || latestCommunication?.commentedBy?.id || '');

        if ((selected?.comments || []).length > previousCount && latestCommunicationBy !== String(currentUserId || '')) {
          setMessage('New user message received. Conversation refreshed.');
        }
      }

      setTickets(assignedTickets);
      communicationCountRef.current = nextCountMap;

      if (!selectedTicketId && assignedTickets.length > 0) {
        setSelectedTicketId(assignedTickets[0]._id);
      }
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load communication inbox');
    }
  }, [currentUserId, selectedTicketId]);

  useEffect(() => {
    if (currentUserId) {
      loadTickets();
    }
  }, [currentUserId, loadTickets]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      loadTickets({ silent: true });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentUserId, loadTickets]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const handleSendCommunication = async (event) => {
    event.preventDefault();

    if (!selectedTicketId || !communication.trim()) {
      return;
    }

    setError('');
    setMessage('');
    setIsSending(true);

    try {
      await addCommunicationRequest({ ticketId: selectedTicketId, communication: communication.trim() });
      setCommunication('');
      setMessage('Communication sent successfully');
      await loadTickets();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to send communication');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950 p-5 text-slate-100 shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6">
          <p className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
            Communication Inbox
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white md:text-3xl">User Communication</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Collaborate with ticket creators and post progress updates in one thread.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{message}</p>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-slate-400">Select Ticket</label>
            <select
              value={selectedTicketId}
              onChange={(event) => setSelectedTicketId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="">Choose ticket</option>
              {tickets.map((ticket) => (
                <option key={ticket._id} value={ticket._id}>
                  {ticket.title}
                </option>
              ))}
            </select>

            <div className="mt-4 space-y-2">
              {tickets.map((ticket) => {
                const isSelected = ticket._id === selectedTicketId;
                return (
                  <button
                    key={ticket._id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket._id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-emerald-300/40 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-white">{ticket.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{ticket.createdBy?.name || 'Unknown user'}</p>
                  </button>
                );
              })}
              {tickets.length === 0 ? <p className="text-sm text-slate-400">No assigned tickets available.</p> : null}
            </div>
          </aside>

          {selectedTicket ? (
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/85 p-4 md:p-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">{selectedTicket.title}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(selectedTicket.status)}`}
                  >
                    {formatStatusLabel(selectedTicket.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">Raised by {selectedTicket.createdBy?.name || 'Unknown user'}</p>
              </div>

              <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                {(selectedTicket.comments || []).map((item, index) => {
                  const senderId = String(item.commentedBy?._id || item.commentedBy?.id || '');
                  const isOwnMessage = senderId && senderId === String(currentUserId || '');

                  return (
                    <article
                      key={`${item.createdAt}-${index}`}
                      className={`rounded-xl border p-3 ${
                        isOwnMessage
                          ? 'ml-6 border-emerald-300/35 bg-emerald-500/15'
                          : 'mr-6 border-slate-700 bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-100">{item.commentedBy?.name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-200">{item.comment}</p>
                    </article>
                  );
                })}

                {(selectedTicket.comments || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No communications yet. Start the conversation below.</p>
                ) : null}
              </div>

              <form onSubmit={handleSendCommunication} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <label className="block text-xs uppercase tracking-[0.15em] text-slate-400">Reply to User</label>
                <textarea
                  rows={4}
                  value={communication}
                  onChange={(event) => setCommunication(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                  placeholder="Share update, ask clarifying questions, or provide next steps..."
                  required
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
                >
                  {isSending ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
              Pick an assigned ticket to start chatting.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AgentCommunicationPage;
