import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = "http://localhost:4003/cloth";

export const fetchProducts = createAsyncThunk("cloth/fetchCloths", async () => {
    const { data } = await axios.get(URL);
    return data;
});

export const createProduct = createAsyncThunk(
  "cloth/createCloth",
  async ({ product, token }, thunkAPI) => {
    try {
      const { data } = await axios.post(URL, product, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || err.message || "Error creando producto"
      );
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
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default clothSlice.reducer;
