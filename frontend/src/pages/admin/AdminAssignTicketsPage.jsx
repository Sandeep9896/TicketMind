import { useEffect, useState } from 'react';
import { adminAgentsRequest } from '../../services/api/auth.api';
import { adminTicketsRequest, assignTicketRequest } from '../../services/api/ticket.api';
import { pushNotification } from '../../utils/notifications';

const statusBadgeClass = (status) => {
  if (status === 'open') return 'border-amber-300/40 bg-amber-400/15 text-amber-100';
  if (status === 'in_progress') return 'border-sky-300/40 bg-sky-400/15 text-sky-100';
  if (status === 'resolved') return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100';
  if (status === 'closed') return 'border-slate-300/30 bg-slate-300/10 text-slate-200';
  return 'border-slate-300/30 bg-slate-300/10 text-slate-200';
};

const formatStatusLabel = (status) => status.replace('_', ' ');

const AdminAssignTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [ticketsRes, agentsRes] = await Promise.all([adminTicketsRequest(), adminAgentsRequest()]);
      setTickets(ticketsRes.data || []);
      setAgents(agentsRes.data || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load assignment data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (ticketId) => {
    const agentId = selectedAgents[ticketId];

    if (!agentId) {
      setError('Please select an agent before assigning.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await assignTicketRequest({ ticketId, agentId });
      setMessage('Ticket assigned successfully');
      const agentName = agents.find((agent) => agent.id === agentId)?.name || 'selected agent';
      const ticketTitle = tickets.find((ticket) => ticket._id === ticketId)?.title || 'ticket';
      pushNotification({
        title: 'Ticket assigned',
        message: `${ticketTitle} was assigned to ${agentName}.`,
        type: 'success'
      });
      await loadData();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to assign ticket');
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />

      <div className="relative space-y-6">
        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 md:p-6">
          <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
            Agent Assignment
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)] md:text-3xl">Assign Tickets</h1>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)] md:text-base">
            Route tickets to the right agents based on specialization and current ownership.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-[var(--tm-border)] bg-gradient-to-br from-amber-400/20 to-amber-500/0 p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--tm-text-muted)]">Total Tickets</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--tm-text)]">{tickets.length}</p>
          </article>
          <article className="rounded-2xl border border-[var(--tm-border)] bg-gradient-to-br from-orange-400/20 to-orange-500/0 p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--tm-text-muted)]">Available Agents</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--tm-text)]">{agents.length}</p>
          </article>
          <article className="rounded-2xl border border-[var(--tm-border)] bg-gradient-to-br from-emerald-400/20 to-emerald-500/0 p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--tm-text-muted)]">Unassigned Tickets</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--tm-text)]">{tickets.filter((t) => !t.assignedTo?._id).length}</p>
          </article>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{message}</p>
        ) : null}

        <div className="space-y-3">
          {tickets.map((ticket) => (
            <article key={ticket._id} className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{ticket.title}</h2>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                      {formatStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{ticket.description}</p>
                  <p className="mt-2 text-xs text-slate-400">Current assignee: {ticket.assignedTo?.name || 'Unassigned'}</p>
                </div>

                <div className="flex items-center gap-2 min-w-fit">
                  <select
                    value={selectedAgents[ticket._id] || ticket.assignedTo?._id || ''}
                    onChange={(event) =>
                      setSelectedAgents((prev) => ({
                        ...prev,
                        [ticket._id]: event.target.value
                      }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                  >
                    <option value="">Select agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.agentType || 'general'})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleAssign(ticket._id)}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </article>
          ))}
          {tickets.length === 0 ? (
            <p className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">No tickets available for assignment.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AdminAssignTicketsPage;
