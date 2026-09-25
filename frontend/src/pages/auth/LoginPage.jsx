import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggleButton from '../../components/common/ThemeToggleButton';
import useThemeMode from '../../hooks/useThemeMode';
import { GoogleLogin } from '@react-oauth/google';
import { googleLoginRequest,forgetPasswordRequest } from '../../services/api/auth.api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login,persistSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useThemeMode();
  const cyanGlowClass = theme === 'dark' ? 'bg-cyan-500/25' : 'bg-cyan-400/20';
  const emeraldGlowClass = theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-400/20';

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLoginRequest(credentialResponse.credential);
      console.log("login", res.data);
      persistSession({
        sessionUser: res.data.user,
        sessionToken: res.data.token
      });
      navigate('/dashboard');

    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgetPassword = () => {
    if (!email) {
      return alert('Please enter your email to reset password');
    }
    const res = forgetPasswordRequest(email);
    if(res) {
      alert('Password reset link sent to your email');
    } else {
      alert('Failed to send reset link. Please try again.');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--tm-page)] px-4 py-12 text-[var(--tm-text)] transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggleButton />
      </div>
      <div className={`pointer-events-none absolute -left-20 top-10 h-60 w-60 rounded-full blur-3xl ${cyanGlowClass}`} />
      <div className={`pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl ${emeraldGlowClass}`} />

      <div className="relative mx-auto grid w-full max-w-6xl gap-4 rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] p-3 shadow-2xl backdrop-blur transition-colors duration-300 md:grid-cols-[1fr_1.1fr]">
        <aside className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-7 transition-colors duration-300">
          <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Welcome Back
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-[var(--tm-text)]">Sign In To TicketMind</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--tm-text-muted)]">
            Continue managing tickets, tracking activity, and collaborating across user, agent, and admin workspaces.
          </p>

          <div className="mt-8 space-y-3 text-sm text-[var(--tm-text-muted)]">
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">Real-time status tracking</p>
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">AI-assisted ticket operations</p>
            <p className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-surface)] px-3 py-2">Role-based secure access</p>
          </div>
        </aside>

        <section className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-7 transition-colors duration-300">
          <h2 className="text-2xl font-semibold text-[var(--tm-text)]">Login</h2>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Access your TicketMind account.</p>
          {error ? <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p> : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-cyan-400"
                required
              />
              <button
                type="button"
                className="mt-1 text-xs text-cyan-300 hover:text-cyan-200"
                onClick={handleForgetPassword}
              >
                Forgot password?
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--tm-text-muted)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-surface-soft)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-cyan-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => {
                console.log('Login Failed');
              }}
            />

          </form>

          <p className="mt-5 text-sm text-[var(--tm-text-muted)]">
            No account?{' '}
            <Link to="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
              Register
            </Link>
          </p>
          <p className="mt-2 text-sm text-[var(--tm-text-muted)]">
            Agent?{' '}
            <Link to="/agent/login" className="font-medium text-cyan-300 hover:text-cyan-200">
              Agent Login
            </Link>
            {' | '}
            Admin?{' '}
            <Link to="/admin/login" className="font-medium text-cyan-300 hover:text-cyan-200">
              Admin Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
