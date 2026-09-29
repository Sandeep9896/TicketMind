import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createTicketFromChatbotRequest,
  getChatHistoryRequest,
  sendChatMessageRequest
} from '../../services/api/ai.api';

export const createTicketFromChatbot = createAsyncThunk(
  'chat/createTicket',
  async (content, { rejectWithValue }) => {
    try {
      const response = await createTicketFromChatbotRequest(content);
      return { content, response: response.data };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Could not create ticket');
    }
  }
);

export const loadChatHistory = createAsyncThunk(
  'chat/loadHistory',
  async (ticketId) => {
    const response = await getChatHistoryRequest(ticketId);
    return response.data || [];
  },
  {
    condition: (ticketId, { getState }) => Boolean(ticketId) && !getState().chat.isLoading
  }
);

export const sendChatMessage = createAsyncThunk('chat/sendMessage', async ({ ticketId, content }, { rejectWithValue }) => {
  try {
    const response = await sendChatMessageRequest(ticketId, content);
    return { content, response: response.data };
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Chatbot reply failed');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isLoading: false,
    isSending: false,
    error: null
  },
  reducers: {
    clearChatError: (state) => {
      state.error = null;
    },
    resetChat: (state) => {
      state.messages = [];
      state.isLoading = false;
      state.isSending = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTicketFromChatbot.pending, (state, action) => {
        state.isSending = true;
        state.error = null;
        state.messages.push({
          role: 'user',
          content: action.meta.arg,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(createTicketFromChatbot.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push({
          role: 'assistant',
          content: action.payload.response.reply,
          action: action.payload.response.action,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(createTicketFromChatbot.rejected, (state, action) => {
        state.isSending = false;
        state.messages.pop();
        state.error = action.payload || 'Could not create ticket';
      })
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.isLoading = false;
      })
      .addCase(loadChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load chat history';
      })
      .addCase(sendChatMessage.pending, (state, action) => {
        state.isSending = true;
        state.error = null;
        state.messages.push({
          role: 'user',
          content: action.meta.arg.content,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push({
          role: 'assistant',
          content: action.payload.response.reply,
          action: action.payload.response.action,
          createdAt: new Date().toISOString()
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSending = false;
        state.messages.pop();
        state.error = action.payload || 'Chatbot reply failed';
      });
  }
});

export const { clearChatError, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
