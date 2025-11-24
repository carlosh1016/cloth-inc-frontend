import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "http://localhost:4003";

// Traer categorias
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token;

      if (!token) {
        return rejectWithValue("No hay token de autenticación disponible");
      }

      const { data } = await axios.get(`${API_URL}/category`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data?.message || error.response.statusText);
      }
      return rejectWithValue(error.message || "Error al cargar las categorías");
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "Error al cargar las categorías";
      })
  }
});


// Selectores
export const selectCategories = state => state.categories?.items ?? [];
export const selectCategoriesLoading = state => state.categories?.loading ?? false;
export const selectCategoriesError = state => state.categories?.error ?? null;

export default categoriesSlice.reducer;