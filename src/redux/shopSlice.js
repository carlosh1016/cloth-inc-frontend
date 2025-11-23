import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:4003";

export const UPLOADED_FILE = "/mnt/data/Untitled (1).pdf";

export const fetchShopForUser = createAsyncThunk(
  "shop/fetchShopForUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token;
      const userId = state.auth?.user?.userId ?? state.auth?.user?.user_id;

      if (!token || !userId) {
        return rejectWithValue({ status: null, message: "Usuario no autenticado" });
      }

      // Primero intentar obtener ownership
      const ownershipRes = await fetch(`${API_URL}/api/ownerships/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (ownershipRes.status === 404) {
        // No tiene tienda
        return null;
      }

      if (!ownershipRes.ok) {
        const txt = await ownershipRes.text();
        return rejectWithValue({ status: ownershipRes.status, message: txt || "Error al obtener ownership" });
      }

      const ownershipData = await ownershipRes.json();

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
      const shopRes = await fetch(`${API_URL}/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!shopRes.ok) {
        const txt = await shopRes.text();
        return rejectWithValue({ status: shopRes.status, message: txt || "Error al obtener shop" });
      }

      const shopData = await shopRes.json();
      return shopData;
    } catch (err) {
      return rejectWithValue({ status: null, message: err.message || "Error de red" });
    }
  }
);

export const createShopWithOwnership = createAsyncThunk(
  "shop/createShopWithOwnership",
  async ({ name, address, cuit }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth?.token;
      const userId = state.auth?.user?.userId ?? state.auth?.user?.user_id;

      if (!token || !userId) {
        return rejectWithValue({ status: null, message: "Usuario no autenticado" });
      }

      // Crear shop
      const createRes = await fetch(`${API_URL}/shops`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, address, cuit }),
      });

      if (!createRes.ok) {
        const txt = await createRes.text();
        return rejectWithValue({ status: createRes.status, message: txt || "Error al crear shop" });
      }

      const newShop = await createRes.json();

      const ownershipRes = await fetch(`${API_URL}/api/ownerships`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, shop_id: newShop.id }),
      });

      if (!ownershipRes.ok) {
        const txt = await ownershipRes.text();
        return rejectWithValue({ status: ownershipRes.status, message: txt || "Error al crear ownership" });
      }

      // Devolver la shop creada
      return newShop;
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
