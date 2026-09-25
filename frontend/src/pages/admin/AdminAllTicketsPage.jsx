import { useEffect, useState } from 'react';
import { adminTicketsRequest } from '../../services/api/ticket.api';

const statusBadgeClass = (status) => {
  if (status === 'open') return 'border-amber-300/40 bg-amber-400/15 text-amber-100';
  if (status === 'in_progress') return 'border-sky-300/40 bg-sky-400/15 text-sky-100';
  if (status === 'resolved') return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100';
  if (status === 'closed') return 'border-slate-300/30 bg-slate-300/10 text-slate-200';
  return 'border-slate-300/30 bg-slate-300/10 text-slate-200';
};

const formatStatusLabel = (status) => status.replace('_', ' ');

const AdminAllTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await adminTicketsRequest();
        setTickets(result.data || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load all tickets');
      }
    };

    loadTickets();
  }, []);

  const visibleTickets = tickets.filter((ticket) => {
    const text = `${ticket.title || ''} ${ticket.description || ''} ${ticket.createdBy?.name || ''} ${ticket.assignedTo?.name || ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 md:p-6">
          <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
            Ticket Inventory
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)] md:text-3xl">All Tickets</h1>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)] md:text-base">
            Complete ticket inventory with owner and assignment visibility.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-4">
          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-[var(--tm-text-muted)]">Search tickets</label>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, description, creator, assignee"
            className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-amber-400"
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}

        <div className="space-y-3">
          {visibleTickets.map((ticket) => (
            <article key={ticket._id} className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--tm-text)]">{ticket.title}</h2>
                  <p className="mt-1 text-sm text-[var(--tm-text-muted)]">{ticket.description}</p>
                  <p className="mt-3 text-xs text-[var(--tm-text-muted)]">
                    Created by: <span className="font-medium text-[var(--tm-text)]">{ticket.createdBy?.name || 'Unknown'}</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--tm-text-muted)]">
                    Assigned to: <span className="font-medium text-[var(--tm-text)]">{ticket.assignedTo?.name || 'Unassigned'}</span>
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                  {formatStatusLabel(ticket.status)}
                </span>
              </div>
            </article>
          ))}
          {visibleTickets.length === 0 ? (
            <p className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-4 text-sm text-[var(--tm-text-muted)]">No tickets found for this search.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AdminAllTicketsPage;
