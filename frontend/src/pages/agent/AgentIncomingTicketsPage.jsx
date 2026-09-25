import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminTicketsRequest, updateStatusRequest } from '../../services/api/ticket.api';

const statusOptions = ['open', 'in_progress', 'resolved', 'closed'];

const statusBadgeClass = (status) => {
  const variants = {
    open: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100',
    in_progress: 'border-amber-300/40 bg-amber-300/15 text-amber-100',
    resolved: 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100',
    closed: 'border-slate-300/30 bg-slate-300/10 text-slate-200'
  };

  return variants[status] || variants.closed;
};

const formatStatusLabel = (status) => status.replace('_', ' ');

const AgentIncomingTicketsPage = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [updatingTicketId, setUpdatingTicketId] = useState('');

  const loadTickets = async () => {
    try {
      const result = await adminTicketsRequest();
      const assigned = (result.data || []).filter(
        (ticket) => String(ticket.assignedTo?._id || '') === String(currentUserId || '')
      );
      setTickets(assigned);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load incoming tickets');
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadTickets();
    }
  }, [currentUserId]);

  const incomingTickets = useMemo(
    () => tickets.filter((ticket) => ['open', 'in_progress'].includes(ticket.status)),
    [tickets]
  );

  const handleStatusChange = async (ticketId, status) => {
    setError('');
    setUpdatingTicketId(ticketId);
    try {
      await updateStatusRequest({ ticketId, status });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => (ticket._id === ticketId ? { ...ticket, status } : ticket))
      );
    } catch (updateError) {
      setError(updateError?.response?.data?.message || 'Unable to update status');
    } finally {
      setUpdatingTicketId('');
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 md:p-6">
          <p className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
            Ticket Queue
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)] md:text-3xl">Incoming Tickets</h1>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)] md:text-base">Assigned tickets that need your active attention.</p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}

        <div className="space-y-3">
          {incomingTickets.map((ticket) => (
            <article key={ticket._id} className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-4 md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[var(--tm-text)]">{ticket.title}</h2>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(ticket.status)}`}
                    >
                      {formatStatusLabel(ticket.status)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-[var(--tm-text-muted)]">{ticket.description}</p>

                  <p className="text-xs text-[var(--tm-text-muted)]">
                    Raised by {ticket.createdBy?.name || 'Unknown user'} ({ticket.createdBy?.email || 'no-email'})
                  </p>
                </div>

                <div className="min-w-[200px] space-y-2 rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-3">
                  <p className="text-xs uppercase tracking-[0.15em] text-[var(--tm-text-muted)]">Update Status</p>
                  <select
                    value={ticket.status}
                    onChange={(event) => handleStatusChange(ticket._id, event.target.value)}
                    disabled={updatingTicketId === ticket._id}
                    className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2 text-sm text-[var(--tm-text)] outline-none transition focus:border-emerald-400 disabled:opacity-60"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}

          {incomingTickets.length === 0 ? (
            <p className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-sm text-[var(--tm-text-muted)]">
              No active incoming tickets.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AgentIncomingTicketsPage;
