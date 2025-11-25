import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = "http://localhost:4003/cloth";

// Traer cloths
export const fetchCloths = createAsyncThunk(
  "cloth/fetchCloths",
  async () => {
    const { data } = await axios.get(URL);
    return data;
  }
);

// Crear cloth
export const createCloth = createAsyncThunk(
  "cloth/createCloth",
  async ({ cloth, token }, thunkAPI) => {
    try {
      const { data } = await axios.post(URL, cloth, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || err.message || "Error creando cloth"
      );
    }
  }
);

// Actualizar cloth
export const updateCloth = createAsyncThunk(
  "cloth/updateCloth",
  async ({ id, cloth, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cloth),
      });
      if (!res.ok) throw new Error("Error al actualizar el cloth");
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Eliminar cloth
export const deleteCloth = createAsyncThunk(
  "cloth/deleteCloth",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al eliminar el cloth");
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const clothSlice = createSlice({
  name: 'cloths',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCloths.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCloths.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCloths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCloth.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCloth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCloth.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(updateCloth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCloth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCloth.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (item) => item.id !== action.payload && item._id !== action.payload
        );
      })
      .addCase(deleteCloth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default clothSlice.reducer;
