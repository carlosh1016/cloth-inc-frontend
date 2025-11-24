// src/views/Cart.jsx
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import {
  clearCart,
  removeItem,
  setItemQty,
  selectCartItems,
  selectCartSubtotal,
  selectCartCount,
} from "../redux/cartSlice";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Guard de sesión
  const { token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const count = useSelector(selectCartCount);

  const handleIncreaseQty = (item) => {
    const next = item.qty + 1;
    if (item.maxQty != null && next > item.maxQty) {
      toast.info(`Stock máximo: ${item.maxQty} unidades`);
      return;
    }
    dispatch(
      setItemQty({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        qty: next,
      })
    );
  };

  const handleDecreaseQty = (item) => {
    const next = item.qty - 1;
    dispatch(
      setItemQty({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        qty: next,
      })
    );
  };

  const handleRemove = (item) => {
    dispatch(
      removeItem({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
      })
    );
  };

  const handleClear = () => {
    if (items.length === 0) return;
    dispatch(clearCart());
    toast.info("Carrito vaciado");
  };

  const handleGoToCheckout = () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    navigate("/checkout");
  };

  const isEmpty = items.length === 0;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Columna izquierda: lista de items */}
        <section className="flex-1 bg-white rounded-xl shadow-sm p-4">
          <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>

          {isEmpty ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold mb-2">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Agregá productos desde el catálogo para verlos acá.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
              >
                Ir a la tienda
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={`${it.productId}-${it.variantId ?? ""}-${it.size ?? ""}`}
                  className="flex gap-4 border-b pb-4 last:border-b-0"
                >
                  {it.imageUrl && (
                    <img
                      src={it.imageUrl}
                      alt={it.name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {it.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Talle:{" "}
                          <span className="font-medium">
                            {it.size ?? "-"}
                          </span>
                        </span>
                        <span className="bg-blue-50 px-2 py-1 rounded">
                          🏪 {it.shopName ?? it.storeName ?? "Sin tienda"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 border rounded-lg">
                        <button
                          className="h-8 w-8 rounded-l-lg hover:bg-gray-100 transition-colors font-bold text-gray-700"
                          onClick={() => handleDecreaseQty(it)}
                        >
                          −
                        </button>
                        <span className="px-3 min-w-[40px] text-center font-semibold">
                          {it.qty}
                        </span>
                        <button
                          className="h-8 w-8 rounded-r-lg hover:bg-gray-100 transition-colors font-bold text-gray-700"
                          onClick={() => handleIncreaseQty(it)}
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">
                          ${(it.price * it.qty).toFixed(2)}
                        </span>
                        <button
                          className="text-sm text-red-500 hover:underline"
                          onClick={() => handleRemove(it)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleClear}
                className="mt-4 text-sm text-red-500 hover:underline"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </section>

        {/* Columna derecha: resumen */}
        <section className="w-full md:w-80 bg-white rounded-xl shadow-sm p-4 h-fit">
          <h2 className="text-lg font-semibold mb-4">Resumen</h2>

          <div className="flex justify-between text-sm mb-2">
            <span>Productos ({count})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <span>Envío</span>
            <span className="text-green-600 font-medium">A calcular</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-semibold">Total estimado</span>
            <span className="text-xl font-bold text-gray-900">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleGoToCheckout}
            disabled={isEmpty}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🧾 Continuar con la compra
          </button>

          {!isEmpty && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Al finalizar la compra aceptás nuestros términos y condiciones
            </p>
          )}
        </section>
      </main>
    </>
  );
}
