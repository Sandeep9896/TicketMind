import { useEffect, useState } from 'react';
import { myTicketsRequest } from '../../services/api/ticket.api';
import TicketTable from '../../components/ticket/TicketTable';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const result = await myTicketsRequest();
        setTickets(result.data || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load tickets');
      }
    };

    loadTickets();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-8 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative space-y-4">
        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 md:p-6">
          <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Ticket History
          </p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)] md:text-3xl">My Tickets</h1>
            <p className="mt-2 text-sm text-[var(--tm-text-muted)] md:text-base">All support requests created by you in one place.</p>
        </div>

        {error ? (
            <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}

        <TicketTable tickets={tickets} />
      </div>
    </section>
  );
};

export default MyTicketsPage;
