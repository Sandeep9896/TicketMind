import { createContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, meRequest, registerRequest } from '../services/api/auth.api';

export const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'tm_access_token';
const STORAGE_USER_KEY = 'tm_user';

const normalizeSessionUser = (sessionUser) => {
  if (!sessionUser) {
    return null;
  }

  const normalizedId = sessionUser.id || sessionUser._id || null;

  return {
    ...sessionUser,
    id: normalizedId,
    _id: sessionUser._id || normalizedId
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? normalizeSessionUser(JSON.parse(raw)) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = ({ sessionUser, sessionToken }) => {
    const normalizedUser = normalizeSessionUser(sessionUser);
    setUser(normalizedUser);
    setToken(sessionToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, sessionToken);
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  };

  const login = async (payload) => {
    const result = await loginRequest(payload);
    persistSession({
      sessionUser: result.data.user,
      sessionToken: result.data.token
    });
    return result;
  };

  const register = async (payload) => {
    const result = await registerRequest(payload);
    persistSession({
      sessionUser: result.data.user,
      sessionToken: result.data.token
    });
    return result;
  };

  const logout = () => {
    clearSession();
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await meRequest();
        const sessionUser = normalizeSessionUser(result.data);
        setUser(sessionUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(sessionUser));
      } catch (error) {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      persistSession,

    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
