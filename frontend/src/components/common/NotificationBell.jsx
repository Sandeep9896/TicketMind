const NotificationBell = ({ notifications = [], open = false, onToggle, onClearAll, onDismiss, compact = false }) => {
  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--tm-text)] transition hover:bg-[var(--tm-hover)]"
        aria-expanded={open}
        aria-label={`Notifications (${unreadCount})`}
      >
        <span>🔔</span>
        {compact ? null : <span className="hidden xl:inline">Alerts</span>}
        {unreadCount > 0 ? (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--tm-text)]">Notifications</p>
            <button type="button" onClick={onClearAll} className="text-xs text-[var(--tm-text-muted)] hover:text-[var(--tm-text)]">
              Clear all
            </button>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-3 text-sm text-[var(--tm-text-muted)]">
                No notifications yet.
              </p>
            ) : (
              notifications.map((item) => (
                <article key={item.id} className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[var(--tm-text)]">{item.title}</p>
                      <p className="mt-1 text-sm text-[var(--tm-text-muted)]">{item.message}</p>
                    </div>
                    <button type="button" onClick={() => onDismiss?.(item.id)} className="text-xs text-[var(--tm-text-muted)] hover:text-[var(--tm-text)]">
                      ✕
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[var(--tm-text-muted)]">
                    {item.type || 'info'} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationBell;
