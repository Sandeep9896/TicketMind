import AppRouter from './routes/AppRouter';
import {socket }from './socket/socket.js';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDispatch } from 'react-redux';
import { clearSession, hydrateAuth, updateToken } from './redux/slices/auth/authSlice';
import { addNotification } from './redux/slices/notifications/notificationSlice';

const App = () => {
  const dispatch = useDispatch();
  const { user,token } = useAuth();

  useEffect(() => {
    if (token) {
      dispatch(hydrateAuth());
    }
  }, [dispatch]);

  useEffect(() => {
    const handleTokenRefresh = (event) => {
      dispatch(updateToken(event.detail));
    };
    const handleSessionExpired = () => {
      dispatch(clearSession());
    };

    window.addEventListener('tm-auth-token-refreshed', handleTokenRefresh);
    window.addEventListener('tm-auth-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('tm-auth-token-refreshed', handleTokenRefresh);
      window.removeEventListener('tm-auth-session-expired', handleSessionExpired);
    };
  }, [dispatch]);

	useEffect(() => {
		if (!user?._id || !token) return undefined;
		socket.auth = { token };

		const handleTicketCreated = ({ ticket }) => {
			dispatch(addNotification({
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				title: 'New ticket created',
				message: ticket?.title || 'A new support ticket is available.',
				type: 'ticket'
			}));
		};

		const handleTicketAssigned = ({ ticket, assignedTo }) => {
			dispatch(addNotification({
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				title: 'Ticket assigned',
				message: `${ticket?.title || 'A ticket'} assigned to ${assignedTo?.name || 'an agent'}.`,
				type: 'assignment'
			}));
		};

		socket.on('ticket:created', handleTicketCreated);
		socket.on('ticket:assigned', handleTicketAssigned);

		socket.connect();

		return () => {
			socket.off('ticket:created', handleTicketCreated);
			socket.off('ticket:assigned', handleTicketAssigned);
			socket.disconnect();
		};
	}, [dispatch, user?._id]);

	useEffect(() => {
		if (token) {
			socket.auth = { token };
		}
	}, [token]);

	return <AppRouter />;
};

export default App;
