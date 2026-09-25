import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggleButton from '../../components/common/ThemeToggleButton';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });

      if (result?.data?.user?.role !== 'admin') {
        logout();
        setError('This page is for admin accounts only');
        return;
      }

      navigate('/admin/dashboard');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--tm-page)] px-4 py-12 text-[var(--tm-text)] transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className="pointer-events-none absolute -left-8 top-10 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-4 rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-3 shadow-2xl backdrop-blur transition-colors duration-300 md:grid-cols-[1fr_1.1fr]">
        <aside className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-7 transition-colors duration-300">
          <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
            Admin Access
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--tm-text)]">Secure Control Center Login</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--tm-text-muted)]">
            Enter the TicketMind command center to oversee analytics, assignments, and operations quality.
          </p>

          <div className="mt-8 space-y-3 text-sm text-[var(--tm-text-muted)]">
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">System-wide visibility</p>
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">Agent assignment controls</p>
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">Performance analytics</p>
          </div>
        </aside>

        <section className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-7 transition-colors duration-300">
          <h2 className="text-2xl font-semibold text-[var(--tm-text)]">Admin Login</h2>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Sign in as administrator.</p>
          {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Login as Admin'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--tm-text-muted)]">
            Agent account?{' '}
            <Link to="/agent/login" className="font-medium text-amber-300 hover:text-amber-200">
              Agent Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminLoginPage;
