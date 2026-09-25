import StatusBadge from './StatusBadge';

const cardClass = 'rounded-xl border bg-white p-4 shadow-sm';

const TicketSummaryCards = ({ tickets = [] }) => {
  const total = tickets.length;
  const open = tickets.filter((item) => item.status === 'open').length;
  const inProgress = tickets.filter((item) => item.status === 'in_progress').length;
  const closed = tickets.filter((item) => item.status === 'closed' || item.status === 'resolved').length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={cardClass}>
        <p className="text-sm text-slate-500">Total Tickets</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-500">Open</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-bold text-slate-900">{open}</p>
          <StatusBadge status="open" />
        </div>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-500">In Progress</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-bold text-slate-900">{inProgress}</p>
          <StatusBadge status="in_progress" />
        </div>
      </div>
      <div className={cardClass}>
        <p className="text-sm text-slate-500">Closed/Resolved</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-bold text-slate-900">{closed}</p>
          <StatusBadge status="closed" />
        </div>
      </div>
    </div>
  );
};

export default TicketSummaryCards;
