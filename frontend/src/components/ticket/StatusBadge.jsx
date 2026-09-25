const statusMap = {
  open: 'bg-amber-500/15 text-amber-700 border-amber-400/40',
  in_progress: 'bg-blue-500/15 text-blue-700 border-blue-400/40',
  resolved: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/40',
  closed: 'bg-slate-500/15 text-slate-700 border-slate-400/40'
};

const normalizeStatus = (status) => (status || 'open').toLowerCase();

const StatusBadge = ({ status }) => {
  const normalized = normalizeStatus(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusMap[normalized] || statusMap.open
      }`}
    >
      {normalized.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
