import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { isDemo } from "../config/mode";


const API_URL = "http://localhost:4003";

export const UPLOADED_FILE = "/mnt/data/Untitled (1).pdf";

export const fetchShopForUser = createAsyncThunk(
  "shop/fetchShopForUser",
  async (_, { getState, rejectWithValue }) => {
    if (isDemo) {
      return {
        id: 1,
        name: 'Demo Shop',
        address: 'Calle Demo 123',
        cuit: '20-00000000-0',
      };
    }
    try {
      const state = getState();
      const token = state.auth?.token;
      const userId = state.auth?.user?.userId ?? state.auth?.user?.user_id;

      if (!token || !userId) {
        return rejectWithValue({ status: null, message: "Usuario no autenticado" });
      }

      // Primero intentar obtener ownership
      let ownershipData;
      try {
        const { data } = await axios.get(`${API_URL}/api/ownerships/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        ownershipData = data;
      } catch (err) {
        if (err.response?.status === 404) {
          // No tiene tienda
          return null;
        }
        const errorMessage = err.response?.data || err.message || "Error al obtener ownership";
        return rejectWithValue({ status: err.response?.status || null, message: errorMessage });
      }

      // ownershipData puede venir en varios formatos. Intentamos extraer shopId / shop_id / shop
      const shopId =
        ownershipData?.shop_id ??
        null;

      if (ownershipData?.shop && typeof ownershipData.shop === "object") {
        return ownershipData.shop;
      }

      if (!shopId) {
        return null;
      }

      // Obtener tienda por id
      try {
        const { data } = await axios.get(`${API_URL}/shops/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (err) {
        const errorMessage = err.response?.data || err.message || "Error al obtener shop";
        return rejectWithValue({ status: err.response?.status || null, message: errorMessage });
      }
    } catch (err) {
      return rejectWithValue({ status: null, message: err.message || "Error de red" });
    }
  }
);

export const createShopWithOwnership = createAsyncThunk(
  "shop/createShopWithOwnership",
  async ({ name, address, cuit }, { getState, rejectWithValue }) => {
  if (isDemo) {
      return {
        id: 1,
        name,
        address,
        cuit,
      };
    }

    try {
      const state = getState();
      const token = state.auth?.token;
      const userId = state.auth?.user?.userId ?? state.auth?.user?.user_id;

      if (!token || !userId) {
        return rejectWithValue({ status: null, message: "Usuario no autenticado" });
      }

      // Crear shop
      let newShop;
      try {
        const { data } = await axios.post(`${API_URL}/shops`, { name, address, cuit }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        newShop = data;
      } catch (err) {
        const errorMessage = err.response?.data || err.message || "Error al crear shop";
        return rejectWithValue({ status: err.response?.status || null, message: errorMessage });
      }

      // Verificar que tenemos un ID válido del shop
      const shopId = newShop?.id;
      if (!shopId) {
        return rejectWithValue({ 
          status: 400, 
          message: "El shop se creó pero no se pudo obtener su ID" 
        });
      }

      // Convertir IDs a números explícitamente
      const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : userId;
      const shopIdNum = typeof shopId === "string" ? parseInt(shopId, 10) : shopId;

      // Crear ownership con el formato correcto según la documentación de la API
      try {
        await axios.post(`${API_URL}/api/ownerships`, {
          user: { id: userIdNum },
          shop: { id: shopIdNum }
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        return newShop;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Error al crear ownership";
        return rejectWithValue({ 
          status: err.response?.status || 400, 
          message: errorMessage 
        });
      }
    } catch (err) {
      return rejectWithValue({ status: null, message: err.message || "Error de red" });
    }
  }
);

const initialState = {
  shop: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  creating: "idle", // idle | loading | succeeded | failed
  createError: null,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShop(state, action) {
      state.shop = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    clearShop(state) {
      state.shop = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchShopForUser
      .addCase(fetchShopForUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchShopForUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.shop = action.payload; // puede ser null si no tiene shop
        state.error = null;
      })
      .addCase(fetchShopForUser.rejected, (state, action) => {
        state.status = "failed";
        state.shop = null;
        state.error = action.payload || action.error || { message: "Error al obtener tienda" };
      })

      // createShopWithOwnership
      .addCase(createShopWithOwnership.pending, (state) => {
        state.creating = "loading";
        state.createError = null;
      })
      .addCase(createShopWithOwnership.fulfilled, (state, action) => {
        state.creating = "succeeded";
        state.shop = action.payload;
        state.createError = null;
      })
      .addCase(createShopWithOwnership.rejected, (state, action) => {
        state.creating = "failed";
        state.createError = action.payload || action.error || { message: "Error al crear tienda" };
      });
  },
});

export const { setShop, clearShop } = shopSlice.actions;
export default shopSlice.reducer;
