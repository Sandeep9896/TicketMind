import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import RoleGate from '../../../components/common/RoleGate';
import TicketSummaryCards from '../../../components/ticket/TicketSummaryCards';
import TicketTable from '../../../components/ticket/TicketTable';
import CreateTicketModal from '../../../components/ticket/CreateTicketModal';
import { adminTicketsRequest, myTicketsRequest } from '../../../services/api/ticket.api';

const roleHeading = {
  admin: 'System-wide support command center',
  agent: 'Assigned operations and workflow queue',
  user: 'Track and manage your support requests'
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTickets = async () => {
    try {
      const result = user?.role === 'admin' ? await adminTicketsRequest() : await myTicketsRequest();
      setTickets(result.data || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load tickets');
    }
  };

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user?.role]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-600">{roleHeading[user?.role] || roleHeading.user}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          New Ticket
        </button>
      </div>

      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <TicketSummaryCards tickets={tickets} />

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Tickets</h2>
          <p className="text-sm text-slate-500">Latest updates from support workflow</p>
        </div>
        <TicketTable tickets={tickets.slice(0, 8)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RoleGate roles={['admin']}>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold">Administration</h3>
            <p className="mt-1 text-sm text-slate-600">Use Admin Dashboard for full analytics and team-level control.</p>
          </div>
        </RoleGate>

        <RoleGate roles={['agent']}>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold">Agent Operations</h3>
            <p className="mt-1 text-sm text-slate-600">Use Agent Panel to process queue and update issue status.</p>
          </div>
        </RoleGate>
      </div>

      <CreateTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={loadTickets} />
    </section>
  );
};

export default DashboardPage;
