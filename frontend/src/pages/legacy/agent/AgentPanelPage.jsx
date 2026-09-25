import { useEffect, useState } from 'react';
import { adminTicketsRequest, updateStatusRequest } from '../../../services/api/ticket.api';

const AgentPanelPage = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    try {
      const result = await adminTicketsRequest();
      setTickets(result.data || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Failed to load tickets');
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleStatusChange = async (ticketId, status) => {
    try {
      await updateStatusRequest({ ticketId, status });
      await loadTickets();
    } catch (updateError) {
      setError(updateError?.response?.data?.message || 'Unable to update ticket status');
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Agent Panel</h1>
        <p className="text-slate-600">Update ticket progress in real-time.</p>
      </div>

      {error ? <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <article key={ticket._id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{ticket.title}</h2>
                <p className="text-sm text-slate-600">{ticket.description}</p>
              </div>
              <div>
                <select
                  value={ticket.status}
                  onChange={(event) => handleStatusChange(ticket._id, event.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AgentPanelPage;
