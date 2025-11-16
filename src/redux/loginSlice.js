import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk asíncrono para hacer el login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:4003/api/v1/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        redirect: 'follow',
      });

      if (!response.ok) {
        // Pasamos un mensaje simple que luego se mapeará en el componente
        return rejectWithValue({
          status: response.status,
          message: 'Error al autenticarse',
        });
      }

      const data = await response.json();

      // La API actual devuelve al menos: access_token, role, shop_id, user_id
      return {
        token: data.access_token,
        role: data.role,
        shopId: data.shop_id,
        userId: data.user_id,
      };
    } catch (error) {
      return rejectWithValue({
        status: null,
        message: 'No se pudo conectar al servidor',
      });
    }
  }
);

const initialState = {
  user: {
    role: null,
    shopId: null,
    userId: null,
  },
  token: null,
  isAuthenticated: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // { status, message } o null
};

const loginSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = { role: null, shopId: null, userId: null };
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    // Por si en algún momento querés setear el usuario manualmente (no obligatorio usarlo ahora)
    setAuthState: (state, action) => {
      const { token, role, shopId, userId } = action.payload;
      state.user = { role, shopId, userId };
      state.token = token;
      state.isAuthenticated = !!token;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, role, shopId, userId } = action.payload;
        state.user = { role, shopId, userId };
        state.token = token;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.token = null;
        state.user = { role: null, shopId: null, userId: null };
        state.error = action.payload || { status: null, message: 'Error al iniciar sesión' };
      });
  },
});

export const { logout, setAuthState } = loginSlice.actions;
export default loginSlice.reducer;