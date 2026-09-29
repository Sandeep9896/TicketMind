import { useDispatch, useSelector } from 'react-redux';
import {
  clearSession,
  login,
  loginWithGoogle,
  logout,
  persistSessionState,
  register
} from '../redux/slices/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login: (payload) => dispatch(login(payload)).unwrap(),
    loginWithGoogle: (credential) => dispatch(loginWithGoogle(credential)).unwrap(),
    register: (payload) => dispatch(register(payload)).unwrap(),
    logout: () => dispatch(logout()).unwrap(),
    persistSession: (session) => dispatch(persistSessionState(session)),
    clearSession: () => dispatch(clearSession())
  };
};
