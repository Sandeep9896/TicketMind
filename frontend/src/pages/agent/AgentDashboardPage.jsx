import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminTicketsRequest } from '../../services/api/ticket.api';

const getStatusBadgeClass = (status) => {
  const variants = {
    open: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100',
    in_progress: 'border-amber-300/40 bg-amber-300/15 text-amber-100',
    resolved: 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100',
    closed: 'border-slate-300/30 bg-slate-300/10 text-slate-200'
  };

  return variants[status] || variants.closed;
};

const formatStatusLabel = (status) => status.replace('_', ' ');

const AgentDashboardPage = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await adminTicketsRequest();
        const assigned = (result.data || []).filter(
          (ticket) => String(ticket.assignedTo?._id || '') === String(currentUserId || '')
        );
        setTickets(assigned);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load agent dashboard');
      }
    };

    if (currentUserId) {
      loadTickets();
    }
  }, [currentUserId]);

  const stats = useMemo(() => {
    const values = {
      total: tickets.length,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };

    tickets.forEach((ticket) => {
      if (values[ticket.status] !== undefined) {
        values[ticket.status] += 1;
      }
    });

    return values;
  }, [tickets]);

  const statCards = [
    { label: 'Assigned', value: stats.total, accent: 'from-emerald-400/20 to-emerald-500/0 text-emerald-100' },
    { label: 'Open', value: stats.open, accent: 'from-cyan-400/20 to-cyan-500/0 text-cyan-100' },
    {
      label: 'In Progress',
      value: stats.in_progress,
      accent: 'from-amber-300/20 to-amber-500/0 text-amber-100'
    },
    { label: 'Resolved', value: stats.resolved, accent: 'from-teal-400/20 to-teal-500/0 text-teal-100' },
    { label: 'Closed', value: stats.closed, accent: 'from-slate-200/20 to-slate-500/0 text-slate-100' }
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative space-y-5">
        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 md:p-6">
          <p className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
            Agent Workspace
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)] md:text-3xl">Agent Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)] md:text-base">Your assigned workload and live progress overview.</p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((card) => (
            <article
              key={card.label}
              className={`rounded-2xl border border-[var(--tm-border)] bg-gradient-to-br ${card.accent} p-4 shadow-lg`}
            >
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--tm-text-muted)]">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--tm-text)]">{card.value}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--tm-text)]">Recently Assigned Tickets</h2>
            <span className="rounded-full border border-[var(--tm-border)] px-3 py-1 text-xs text-[var(--tm-text-muted)]">
              Showing latest {Math.min(tickets.length, 6)}
            </span>
          </div>

          <div className="space-y-3">
            {tickets.slice(0, 6).map((ticket) => (
              <article key={ticket._id} className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[var(--tm-text)]">{ticket.title}</h3>
                    <p className="mt-1 text-sm text-[var(--tm-text-muted)] line-clamp-2">{ticket.description}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(ticket.status)}`}
                  >
                    {formatStatusLabel(ticket.status)}
                  </span>
                </div>
              </article>
            ))}
            {tickets.length === 0 ? (
              <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-4 text-sm text-[var(--tm-text-muted)]">
                No tickets assigned to you yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgentDashboardPage;
