import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  googleLoginRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest
} from '../../../services/api/auth.api';

export const STORAGE_TOKEN_KEY = 'tm_access_token';
export const STORAGE_USER_KEY = 'tm_user';

export const normalizeSessionUser = (sessionUser) => {
  if (!sessionUser) return null;
  const id = sessionUser.id || sessionUser._id || null;
  return { ...sessionUser, id, _id: sessionUser._id || id };
};

const readStoredUser = () => {
  try {
    return normalizeSessionUser(JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || 'null'));
  } catch {
    return null;
  }
};

const initialToken = typeof localStorage === 'undefined'
  ? null
  : localStorage.getItem(STORAGE_TOKEN_KEY);

const initialState = {
  user: typeof localStorage === 'undefined' ? null : readStoredUser(),
  token: initialToken,
  isLoading: Boolean(initialToken),
  status: initialToken ? 'idle' : 'unauthenticated',
  error: null
};

const persistSession = (user, token) => {
  if (!user || !token) {
    throw new Error('A valid user and access token are required');
  }

  const normalizedUser = normalizeSessionUser(user);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser));
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  return { user: normalizedUser, token };
};

const clearStoredSession = () => {
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem(STORAGE_TOKEN_KEY);
};

export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, { rejectWithValue }) => {
  try {
    const result = await meRequest();
    return {
      user: normalizeSessionUser(result.data),
      token: localStorage.getItem(STORAGE_TOKEN_KEY)
    };
  } catch (error) {
    clearStoredSession();
    return rejectWithValue(error);
  }
  },
  {
    condition: (_, { getState }) => getState().auth.status !== 'loading'
  }
);

export const login = createAsyncThunk('auth/login', async (payload) => {
  const result = await loginRequest(payload);
  return persistSession(result.data.user, result.data.token);
});

export const register = createAsyncThunk('auth/register', async (payload) => {
  const result = await registerRequest(payload);
  return persistSession(result.data.user, result.data.token);
});

export const loginWithGoogle = createAsyncThunk('auth/googleLogin', async (credential) => {
  const result = await googleLoginRequest(credential);
  return persistSession(result.data.user, result.data.token);
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutRequest();
  } finally {
    clearStoredSession();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    persistSessionState: (state, action) => {
      const { user, token } = persistSession(action.payload.user, action.payload.token);
      state.user = user;
      state.token = token;
      state.isLoading = false;
      state.status = 'authenticated';
      state.error = null;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem(STORAGE_TOKEN_KEY, action.payload);
    },
    clearSession: (state) => {
      clearStoredSession();
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.status = 'unauthenticated';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.isLoading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.status = 'authenticated';
        state.error = null;
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(hydrateAuth.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload || action.error;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        clearStoredSession();
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload || action.error;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        clearStoredSession();
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload || action.error;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        clearStoredSession();
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload || action.error;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.error;
      });
  }
});

export const { clearSession, persistSessionState, updateToken } = authSlice.actions;
export default authSlice.reducer;
