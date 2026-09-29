import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const TicketTable = ({ tickets = [] }) => {
  const navigate = useNavigate();

  const handleViewCommunication = (ticketId) => {
    navigate(`/user/ticket/${ticketId}/communication`);
  };

  const handleOpenChatbot = (ticket) => {
    navigate(`/user/chatbot/${ticket._id}`, {
      state: {
        ticket: {
          _id: ticket._id,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status
        }
      }
    });
  };

  return (
    <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] shadow-lg">
      
      {/* Scroll Container */}
      <div className="max-h-[75vh] overflow-auto">
        <table className="min-w-full text-left text-sm text-[var(--tm-text)]">
          
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 border-b border-[var(--tm-border)] bg-[var(--tm-surface)] text-[var(--tm-text-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-[var(--tm-text-muted)]"
                >
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="border-b border-[var(--tm-border)] last:border-b-0 hover:bg-[var(--tm-hover)] transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {ticket.title}
                  </td>

                  <td className="px-4 py-3 text-[var(--tm-text-muted)]">
                    {ticket.category || 'Other'}
                  </td>

                  <td className="px-4 py-3 capitalize text-[var(--tm-text-muted)]">
                    {ticket.priority}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>

                  <td className="px-4 py-3 text-[var(--tm-text-muted)] whitespace-nowrap">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleViewCommunication(ticket._id)
                        }
                        className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-500/20"
                      >
                        View Communication
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenChatbot(ticket)}
                        className="rounded-md border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20"
                      >
                        Open Chatbot
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default TicketTable;