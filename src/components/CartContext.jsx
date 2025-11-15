// CartContext.jsx
// Maneja los items en memoria
import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

function mergeItems(prev, next) {
  // Combinar por productId + variantId + size
  const keyOf = (i) => `${i.productId}::${i.variantId ?? ""}::${i.size ?? ""}`;
  const map = new Map(prev.map(i => [keyOf(i), { ...i }]));

  next.forEach(i => {
    const k = keyOf(i);
    if (map.has(k)) {
      const existing = map.get(k);
      existing.qty += i.qty;
      // Preservar stock del item existente, no sumarlo
      existing.stock = existing.stock ?? i.stock;
    } else {
      map.set(k, { ...i });
    }
  });

  return [...map.values()];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Se agrega el toast
  const addItem = (item) => {
    setItems((prev) => mergeItems(prev, [item]));

    toast.success("Producto agregado al carrito", {
      position: "bottom-right",
    });
  };

  const removeItem = (productId, { variantId = undefined, size = undefined } = {}) =>
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            (i.variantId ?? "") === (variantId ?? "") &&
            (i.size ?? "") === (size ?? "")
          )
      )
    );

  const setQty = (
    productId,
    qty,
    { variantId = undefined, size = undefined } = {}
  ) =>
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId &&
        (i.variantId ?? "") === (variantId ?? "") &&
        (i.size ?? "") === (size ?? "")
          ? { ...i, qty: Math.max(1, qty) }
          : i
      )
    );

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.price * i.qty, 0),
    }),
    [items]
  );

  const value = { items, addItem, removeItem, setQty, clear, count, subtotal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
