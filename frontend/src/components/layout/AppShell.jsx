import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import chatbotImage from '../../assets/images/logo.png';
import Footer from './Footer';
import ThemeToggleButton from '../common/ThemeToggleButton';
import NotificationBell from '../common/NotificationBell';
import { getStoredNotifications, saveNotifications, NOTIFICATION_EVENT } from '../../utils/notifications';

const getRoleStyles = (role) => {
  const styles = {
    user: {
      accentColor: 'cyan',
      accentBg: 'bg-cyan-500',
      accentShadow: 'shadow-cyan-500/30',
      accentHover: 'group-hover:text-cyan-400'
    },
    agent: {
      accentColor: 'emerald',
      accentBg: 'bg-emerald-500',
      accentShadow: 'shadow-emerald-500/30',
      accentHover: 'group-hover:text-emerald-400'
    },
    admin: {
      accentColor: 'amber',
      accentBg: 'bg-amber-500',
      accentShadow: 'shadow-amber-500/30',
      accentHover: 'group-hover:text-amber-400'
    }
  };
  return styles[role] || styles.user;
};

const AppShell = () => {
  const { user, logout } = useAuth();
  const roleStyles = getRoleStyles(user?.role);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleNotification = (event) => {
      const nextNotification = event?.detail;
      if (!nextNotification) return;

      setNotifications((current) => {
        const next = [nextNotification, ...current].slice(0, 10);
        saveNotifications(next);
        return next;
      });
    };

    const handleOutsideClick = (event) => {
      if (!event.target.closest?.('[data-notification-root]')) {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener(NOTIFICATION_EVENT, handleNotification);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleNotification);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const getNavItems = () => {
    const baseItems = [
      { icon: '🏠', label: 'Home', to: '/user/dashboard' },
      { icon: '🔍', label: 'Search', to: '#' },
      { icon: '❤️', label: 'Likes', to: '#' }
    ];

    if (user?.role === 'user') {
      return [
        { icon: '🎯', label: 'Dashboard', to: '/user/dashboard' },
        { icon: '📝', label: 'Create Ticket', to: '/user/create-ticket' },
        { icon: '📋', label: 'My Tickets', to: '/user/my-tickets' },
        { icon: '👤', label: 'Profile', to: '/user/profile' },
        { icon: '💬', label: 'Chatbot', to: '/user/chatbot' }
      ];
    } else if (user?.role === 'agent') {
      return [
        { icon: '📊', label: 'Dashboard', to: '/agent/dashboard' },
        { icon: '📥', label: 'Incoming', to: '/agent/incoming-tickets' },
        { icon: '💬', label: 'Messages', to: '/agent/communication' }
      ];
    } else if (user?.role === 'admin') {
      return [
        { icon: '⚙️', label: 'Dashboard', to: '/admin/dashboard' },
        { icon: '📋', label: 'All Tickets', to: '/admin/all-tickets' },
        { icon: '🎯', label: 'Assign', to: '/admin/assign-tickets' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex bg-[var(--tm-page)] text-[var(--tm-text)] transition-colors duration-300">
      {/* Instagram-style Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-[var(--tm-border)] bg-[var(--tm-surface)] transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-24'}`}>
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-[var(--tm-border)]">
          {sidebarExpanded ? (
            <>
              
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                TicketMind
              </h1>
              <p className="mt-1 text-xs text-[var(--tm-text-muted)]">Support Platform</p>
            </>
          ) : (
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img src={chatbotImage} alt="TicketMind" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="absolute right-10 top-4 z-10 flex items-center gap-2">
          <div data-notification-root className="relative">
            <NotificationBell
              notifications={notifications}
              open={notificationsOpen}
              compact
              onToggle={() => setNotificationsOpen((current) => !current)}
              onClearAll={() => {
                saveNotifications([]);
                setNotifications([]);
              }}
              onDismiss={(id) => {
                const next = notifications.filter((item) => item.id !== id);
                saveNotifications(next);
                setNotifications(next);
              }}
            />
          </div>

          <ThemeToggleButton compact className="h-10 min-w-10 px-3" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `
                group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? `${roleStyles.accentBg} text-white shadow-lg ${roleStyles.accentShadow}`
                  : 'text-[var(--tm-text-muted)] hover:bg-[var(--tm-hover)] hover:text-[var(--tm-text)]'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarExpanded && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="space-y-3 border-t border-[var(--tm-border)] px-3 py-6">
          {/* Profile Card */}
          <div className="group cursor-pointer rounded-lg px-4 py-3 transition-all duration-200 hover:bg-[var(--tm-hover)]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${roleStyles.accentBg} flex items-center justify-center text-white text-sm font-bold`}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--tm-text)]">{user?.name}</p>
                  <p className="text-xs capitalize text-[var(--tm-text-muted)]">{user?.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* More Options & Logout */}
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--tm-surface-soft)] px-4 py-2.5 text-sm font-medium text-[var(--tm-text-muted)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
          >
            <span>🚪</span>
            {sidebarExpanded && 'Logout'}
          </button>
        </div>

        {/* Toggle Button */}
        <div className="border-t border-[var(--tm-border)] px-3 pb-3">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full rounded-lg px-4 py-2 text-sm text-[var(--tm-text-muted)] transition-all duration-200 hover:bg-[var(--tm-hover)] hover:text-[var(--tm-text)]"
          >
            {sidebarExpanded ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        {/* <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">IT Helpdesk</h2>
              <p className="text-sm text-slate-500">Enterprise support</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${roleStyles.accentBg} text-white text-sm font-medium`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </div>
          </div>
        </header> */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[var(--tm-page)] transition-colors duration-300">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer accentBg={roleStyles.accentBg} />
      </div>
    </div>
  );
};

export default AppShell;
