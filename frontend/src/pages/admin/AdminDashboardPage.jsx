import { useEffect, useState } from 'react';
import axiosClient from '../../services/api/axiosClient';

const statCards = (overview) => [
  {
    label: 'Total Tickets',
    value: overview?.totalTickets ?? 0,
    accent: 'from-amber-400/20 to-amber-500/0 text-amber-100',
    ring: 'border-amber-400/40'
  },
  {
    label: 'Open Tickets',
    value: overview?.openTickets ?? 0,
    accent: 'from-orange-400/20 to-orange-500/0 text-orange-100',
    ring: 'border-orange-400/40'
  },
  {
    label: 'Closed Tickets',
    value: overview?.closedTickets ?? 0,
    accent: 'from-emerald-400/20 to-emerald-500/0 text-emerald-100',
    ring: 'border-emerald-400/40'
  },
  {
    label: 'Avg Resolution (hrs)',
    value: overview?.averageResolutionTimeHours ?? 0,
    accent: 'from-sky-400/20 to-sky-500/0 text-sky-100',
    ring: 'border-sky-400/40'
  }
];

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [overviewRes, categoriesRes] = await Promise.all([
          axiosClient.get('/analytics/overview'),
          axiosClient.get('/analytics/categories')
        ]);

        setOverview(overviewRes.data.data);
        setCategories(categoriesRes.data.data || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load admin analytics');
      }
    };

    loadAdminData();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />

      <div className="relative space-y-6">
        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 md:p-6">
          <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
            Command Center
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--tm-text)] md:text-3xl">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)] md:text-base">
            Monitor ticket load, closure velocity, and category trends to keep support operations healthy.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>
        ) : null}

        {overview ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards(overview).map((item) => (
              <article
                key={item.label}
                className={`rounded-2xl border ${item.ring} bg-gradient-to-br ${item.accent} p-4 shadow-lg`}
              >
                <p className="text-xs uppercase tracking-wider text-[var(--tm-text-muted)]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--tm-text)]">{item.value}</p>
              </article>
            ))}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[var(--tm-text)]">Tickets per Category</h2>
          <ul className="space-y-3 text-sm">
            {categories.map((item) => (
              <li key={item.category} className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[var(--tm-text)]">{item.category}</span>
                  <span className="rounded-full border border-amber-300/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-100">{item.count}</span>
                </div>
              </li>
            ))}
            {categories.length === 0 ? (
              <li className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-3 text-[var(--tm-text-muted)]">No category data yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
