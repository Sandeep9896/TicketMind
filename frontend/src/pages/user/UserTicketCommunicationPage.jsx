import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addCommunicationRequest, myTicketsRequest } from '../../services/api/ticket.api';
import { pushNotification } from '../../utils/notifications';

const formatStatusLabel = (status = '') => status.replace('_', ' ');

const statusBadgeClass = (status) => {
  const variants = {
    open: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100',
    in_progress: 'border-fuchsia-300/40 bg-fuchsia-400/15 text-fuchsia-100',
    resolved: 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100',
    closed: 'border-slate-300/30 bg-slate-300/10 text-slate-200'
  };

  return variants[status] || variants.closed;
};

const UserTicketCommunicationPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [allTickets, setAllTickets] = useState([]);
  const [communication, setCommunication] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const communicationCountRef = useRef({});

  const loadTickets = useCallback(async ({ silent = false } = {}) => {
    try {
      const result = await myTicketsRequest();
      const tickets = result.data || [];

      const nextCountMap = tickets.reduce((map, item) => {
        map[item._id] = (item.comments || []).length;
        return map;
      }, {});

      if (silent && ticketId) {
        const previousCount = communicationCountRef.current[ticketId] || 0;
        const selected = tickets.find((item) => item._id === ticketId);
        const latestCommunication = selected?.comments?.[selected.comments.length - 1];
        const isAgentMessage =
          String(latestCommunication?.commentedBy?._id || latestCommunication?.commentedBy?.id || '') !==
          String(selected?.createdBy?._id || selected?.createdBy?.id || '');

        if ((selected?.comments || []).length > previousCount && isAgentMessage) {
          setMessage('New agent message received. Thread refreshed.');
          pushNotification({
            title: 'New agent reply',
            message: `An update was added to ${selected?.title || 'your ticket'}`,
            type: 'success'
          });
        }
      }

      setAllTickets(tickets);
      communicationCountRef.current = nextCountMap;
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load ticket');
    }
  }, [ticketId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    let intervalId = null;

    const startInterval = () => {
      // poll less frequently and only when page is visible
      if (intervalId) return;
      intervalId = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
        loadTickets({ silent: true });
      }, 10000); // 10s
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // start immediately if visible
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      startInterval();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') startInterval();
      else stopInterval();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadTickets]);

  const ticket = useMemo(
    () => allTickets.find((item) => item._id === ticketId) || null,
    [allTickets, ticketId]
  );

  const handleSendCommunication = async (event) => {
    event.preventDefault();

    if (!ticketId || !communication.trim()) {
      return;
    }

    setError('');
    setMessage('');
    setIsSending(true);

    try {
      await addCommunicationRequest({ ticketId, communication: communication.trim() });
      setCommunication('');
      setMessage('Message sent to agent successfully');
      pushNotification({
        title: 'Message sent',
        message: `Your update for ${ticket?.title || 'the ticket'} was sent successfully.`,
        type: 'info'
      });
      await loadTickets();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950 p-5 text-slate-100 shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6">
          <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Ticket Updates
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Communication Thread</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            View progress updates from your assigned agent and send messages.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-cyan-300/30 bg-cyan-500/15 px-4 py-3 text-sm text-cyan-100">{message}</p>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-1">
          {ticket ? (
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/85 p-4 md:p-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">{ticket.title}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(ticket.status)}`}
                  >
                    {formatStatusLabel(ticket.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{ticket.description}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">Category</p>
                    <p className="text-sm font-medium text-slate-100">{ticket.category || 'Other'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Assigned Agent</p>
                    <p className="text-sm font-medium text-slate-100">
                      {ticket.assignedTo?.name || 'Not assigned yet'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                {(ticket.comments || []).map((item, index) => {
                  const isAgentMessage = item.commentedBy?._id !== ticket.createdBy?._id;

                  return (
                    <article
                      key={`${item.createdAt}-${index}`}
                      className={`rounded-xl border p-3 ${
                        isAgentMessage
                          ? 'mr-6 border-cyan-300/35 bg-cyan-500/15 '
                          : 'ml-6 border-slate-700 bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-100">
                          {item.commentedBy?.name || 'Unknown User'}
                          {isAgentMessage ? (
                            <span className="ml-2 inline-block rounded-full border border-cyan-300/40 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
                              Agent
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-200">{item.comment}</p>
                    </article>
                  );
                })}

                {(ticket.comments || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No messages yet. Send a message to get started!</p>
                ) : null}
              </div>

              <form onSubmit={handleSendCommunication} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <label className="block text-xs uppercase tracking-[0.15em] text-slate-400">Send Message to Agent</label>
                <textarea
                  rows={4}
                  value={communication}
                  onChange={(event) => setCommunication(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  placeholder="Provide more details, ask for updates, or ask questions..."
                  required
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/user/my-tickets')}
                  className="ml-2 rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--tm-text)] transition hover:bg-[var(--tm-hover)]"
                >
                  Back to My Tickets
                </button>
              </form>
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
              {ticketId ? 'Ticket not found. Go back to My Tickets and choose a valid ticket.' : 'Open communication from My Tickets to view a selected ticket.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserTicketCommunicationPage;
