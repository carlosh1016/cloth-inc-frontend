import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk para registrar usuario
export const registerUser = createAsyncThunk(
  'register/registerUser',
  async (
    { username, password, name, surname, phone, email, role },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('http://localhost:4003/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          name,
          surname,
          phone,
          email,
          role,
        }),
        redirect: 'follow',
      });

      if (!response.ok) {
        return rejectWithValue({
          status: response.status,
          message: 'Error al registrar usuario',
        });
      }

      const data = await response.json();

      // Se asume que la API devuelve un payload similar al login:
      // { access_token, role, shop_id, user_id, ... }
      return {
        raw: data,
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
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null, // { status, message } o null
  lastRegisteredUser: null, // puede contener info básica del último registro
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    resetRegisterState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.lastRegisteredUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.lastRegisteredUser = action.payload.raw ?? null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload || { status: null, message: 'Error al registrar usuario' };
      });
  },
});

export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;


