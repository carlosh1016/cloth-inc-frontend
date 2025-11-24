// src/redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],      // [{ productId, variantId, size, name, price, imageUrl, shopId, shopName, qty, maxQty }]
  loading: false, // reservado por si después sincronizás con backend
  error: null,
};

// misma idea que en CartContext: clave = productId + variantId + size
const getItemKey = (item) =>
  `${item.productId ?? ""}::${item.variantId ?? ""}::${item.size ?? ""}`;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const incoming = action.payload;
      const key = getItemKey(incoming);

      const existing = state.items.find((it) => getItemKey(it) === key);

      const deltaQty = incoming.qty ?? 1;

      if (existing) {
        const newQty = existing.qty + deltaQty;
        // respetar stock máximo si lo mandás en maxQty
        if (existing.maxQty != null) {
          existing.qty = Math.min(newQty, existing.maxQty);
        } else {
          existing.qty = newQty;
        }
      } else {
        const baseQty = incoming.qty ?? 1;
        let finalQty = baseQty;
        if (incoming.maxQty != null) {
          finalQty = Math.min(baseQty, incoming.maxQty);
        }
        state.items.push({
          ...incoming,
          qty: finalQty,
        });
      }
    },

    removeItem(state, action) {
      const { productId, variantId = null, size = null } = action.payload;
      state.items = state.items.filter((it) => {
        const key = getItemKey(it);
        const targetKey = getItemKey({ productId, variantId, size });
        return key !== targetKey;
      });
    },

    setItemQty(state, action) {
      const { productId, variantId = null, size = null, qty } = action.payload;
      const item = state.items.find(
        (it) => getItemKey(it) === getItemKey({ productId, variantId, size })
      );
      if (!item) return;

      let newQty = qty;
      if (newQty <= 0) {
        // si llega a 0, lo sacamos
      } else {
        if (item.maxQty != null) {
          newQty = Math.min(newQty, item.maxQty);
        }
        item.qty = newQty;
      }

      if (newQty <= 0) {
        state.items = state.items.filter(
          (it) => getItemKey(it) !== getItemKey({ productId, variantId, size })
        );
      }
    },

    clearCart(state) {
      state.items = [];
      state.error = null;
    },
  },
  // por ahora sin extraReducers; después podemos meter thunks para backend
});

export const { addItem, removeItem, setItemQty, clearCart } = cartSlice.actions;

// --- Selectores ---
export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((acc, it) => acc + (it.qty ?? 0), 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((acc, it) => acc + (it.price ?? 0) * (it.qty ?? 0), 0);

export const selectCartShopIds = (state) => {
  const ids = state.cart.items
    .map((it) => it.shopId)
    .filter((id) => id != null);
  return Array.from(new Set(ids));
};

export const selectCartByShop = (state) => {
  const grouped = {};
  state.cart.items.forEach((it) => {
    const key = it.shopId ?? "unknown";
    if (!grouped[key]) {
      grouped[key] = {
        shopId: it.shopId,
        shopName: it.shopName ?? it.storeName ?? "Tienda",
        items: [],
      };
    }
    grouped[key].items.push(it);
  });
  return grouped;
};

export default cartSlice.reducer;
