import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { changePasswordRequest } from '../../services/api/auth.api';

const UserProfilePage = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const displayName = user?.name || 'Guest User';
  const email = user?.email || '-';
  const role = user?.role || 'user';
  const profileId = user?.id || user?._id || '-';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '-';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password must match.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const result = await changePasswordRequest({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setPasswordSuccess(result?.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      setPasswordError(submitError?.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleTogglePasswordForm = () => {
    const nextVisibility = !showPasswordForm;
    setShowPasswordForm(nextVisibility);

    if (!nextVisibility) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
  };

  return (
    <section className="relative space-y-6 overflow-hidden rounded-3xl border border-[var(--tm-border)] bg-[var(--tm-surface)] p-5 text-[var(--tm-text)] shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-fuchsia-400/15 blur-2xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-lg font-semibold text-slate-950 shadow-sm">
              {initials || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--tm-text)]">{displayName}</h1>
              <p className="text-sm text-[var(--tm-text-muted)]">Manage your TicketMind account and security</p>
            </div>
          </div>

          <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-100">
            {role}
          </span>
        </div>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tm-text-muted)]">Profile ID</p>
          <p className="mt-2 break-all text-lg font-semibold text-[var(--tm-text)]">{profileId}</p>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Unique account reference</p>
        </article>

        <article className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tm-text-muted)]">Member Since</p>
          <p className="mt-2 text-lg font-semibold text-[var(--tm-text)]">{memberSince}</p>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Trusted TicketMind member</p>
        </article>

        <article className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--tm-text-muted)]">Contact Email</p>
          <p className="mt-2 break-all text-lg font-semibold text-[var(--tm-text)]">{email}</p>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Primary sign-in email address</p>
        </article>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--tm-text)]">Security</h2>
          <p className="mt-1 text-sm text-[var(--tm-text-muted)]">Change your password to keep your account safe.</p>

          {passwordError ? (
            <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{passwordError}</p>
          ) : null}
          {passwordSuccess ? (
            <p className="mt-4 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
              {passwordSuccess}
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            {!showPasswordForm ? (
              <button
                type="button"
                onClick={handleTogglePasswordForm}
                className="w-full rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-[var(--tm-text)] transition hover:bg-emerald-500/20 "
              >
                Update Password
              </button>
            ) : null}

            {showPasswordForm ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--tm-text)]">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-page)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--tm-text)]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-page)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--tm-text)]">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-[var(--tm-border)] bg-[var(--tm-page)] px-3 py-2.5 text-[var(--tm-text)] outline-none transition focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60 dark:text-slate-950"
                  >
                    {isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTogglePasswordForm}
                    className="rounded-xl border border-[var(--tm-border)] bg-[var(--tm-page)] px-4 py-2.5 text-sm font-semibold text-[var(--tm-text)] transition hover:border-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--tm-border)] bg-[var(--tm-surface-muted)] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--tm-text)]">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              to="/user/create-ticket"
              className="block rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium  text-[var(--tm-text)] transition hover:bg-cyan-500/20"
            >
              Create New Ticket
            </Link>
            <Link
              to="/user/dashboard"
              className="block rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-[var(--tm-text)] transition hover:bg-fuchsia-500/20 "
            >
              Open User Dashboard
            </Link>
            <Link
              to="/user/chatbot"
              className="block rounded-xl border border-[var(--tm-border)] bg-[var(--tm-page)] px-4 py-3 text-sm font-medium text-[var(--tm-text)] transition hover:border-slate-500"
            >
              Ask Support Chatbot
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default UserProfilePage;
