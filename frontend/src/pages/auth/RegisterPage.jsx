import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggleButton from '../../components/common/ThemeToggleButton';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({ name, email, password ,role: 'user' });
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--tm-page)] px-4 py-12 text-[var(--tm-text)] transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className="pointer-events-none absolute -left-12 top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-4 rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-3 shadow-2xl backdrop-blur transition-colors duration-300 md:grid-cols-[1fr_1.1fr]">
        <aside className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-7 transition-colors duration-300">
          <p className="inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-fuchsia-200">
            New Account
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--tm-text)]">Create Your TicketMind Profile</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--tm-text-muted)]">
            Open tickets faster, track progress clearly, and communicate seamlessly with support teams.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-[var(--tm-text-muted)]">
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">Fast issue submission</p>
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">Role-based support flow</p>
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">AI-enabled triage support</p>
          </div>
        </aside>

        <section className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-7 transition-colors duration-300">
          <h2 className="text-2xl font-semibold text-[var(--tm-text)]">Register</h2>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Create your TicketMind account.</p>
          {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-fuchsia-400"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-fuchsia-400"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-fuchsia-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-400 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--tm-text-muted)]">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-fuchsia-300 hover:text-fuchsia-200">
              Login
            </Link>
          </p>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)]">
            Registering as agent?{' '}
            <Link to="/agent/register" className="font-medium text-fuchsia-300 hover:text-fuchsia-200">
              Agent Registration
            </Link>
            {' | '}
            Admin access?{' '}
            <Link to="/admin/login" className="font-medium text-fuchsia-300 hover:text-fuchsia-200">
              Admin Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
