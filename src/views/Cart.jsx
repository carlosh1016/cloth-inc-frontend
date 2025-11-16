// src/views/Cart.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { toast } from "react-toastify";
import Header from "../components/Header";

export default function Cart() {
  // 1) Guard de sesión
  const { token, user } = useSelector((state) => state.auth);
  const userId = user?.userId;
  if (!token) return <Navigate to="/login" replace />;

  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState("CREDIT_CARD");
  const [isProcessing, setIsProcessing] = useState(false);

  // 2) Obtenemos el carrito del contexto
  const cart = useCart();
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const setQty = cart?.setQty ?? (() => {});
  const removeItem = cart?.removeItem ?? (() => {});
  const clear = cart?.clear ?? (() => {});

  const handleIncreaseQty = (item) => {
    if (item.qty >= item.stock) {
      toast.warning(`Solo hay ${item.stock} unidades disponibles`, { 
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }
    setQty(item.productId, item.qty + 1, { variantId: item.variantId, size: item.size });
  };

  const handleDecreaseQty = (item) => {
    setQty(item.productId, item.qty - 1, { variantId: item.variantId, size: item.size });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Validar stock antes de proceder
    const insufficientStock = items.find(item => item.qty > item.stock);
    if (insufficientStock) {
      toast.error(`No hay suficiente stock de "${insufficientStock.name}"`, { 
        position: "bottom-right",
        autoClose: 4000
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (!userId) {
        throw new Error("No se encontró información del usuario");
      }

      // Agrupar productos por tienda
      const itemsByShop = items.reduce((acc, item) => {
        const shopId = item.shopId;
        if (!shopId) {
          throw new Error(`Producto "${item.name}" no tiene tienda asignada`);
        }
        if (!acc[shopId]) {
          acc[shopId] = [];
        }
        acc[shopId].push(item);
        return acc;
      }, {});

      // Crear órdenes por cada tienda
      const orderPromises = Object.entries(itemsByShop).map(async ([shopId, shopItems]) => {
        const amount = shopItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const orderData = {
          amount: amount,
          emitedDate: today,
          state: true,
          payMethod: payMethod,
          userId: parseInt(userId),
          shopId: parseInt(shopId)
        };

        const response = await fetch("http://localhost:4003/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al crear orden: ${errorText || response.status}`);
        }

        return response.json();
      });

      await Promise.all(orderPromises);

      // Actualizar stock de cada producto
      const stockUpdatePromises = items.map(async (item) => {
        const newStock = item.stock - item.qty;

        // Preparar datos del producto para actualización
        const updatedProduct = {
          name: item.name,
          description: item.description,
          image: item.imageUrl,
          price: item.originalPrice,
          size: item.size,
          category: item.category?.id,
          stock: newStock,
          discount: item.discount,
          shop: item.shopId
        };

        const response = await fetch(`http://localhost:4003/cloth/${item.productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedProduct)
        });

        if (!response.ok) {
          console.error(`Error al actualizar stock del producto ${item.name}`);
        }

        return response;
      });

      await Promise.all(stockUpdatePromises);

      // Todo exitoso
      toast.success("¡Compra realizada con éxito! Redirigiendo...", { 
        position: "bottom-right",
        autoClose: 1500
      });
      clear();
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      console.error("Error en checkout:", error);
      toast.error(error.message || "Error al procesar la compra", { 
        position: "bottom-right",
        autoClose: 4000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
    <Header />
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Mi Carrito {items.length > 0 && `(${items.length} ${items.length === 1 ? 'producto' : 'productos'})`}
      </h1>

      {/* Lista */}
      <div className="space-y-4 mb-8">
        {items.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-6">Agrega productos para comenzar tu compra</p>
            <button 
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a la tienda
            </button>
          </div>
        )}

        {items.map((it) => {
          const key = `${it.productId}::${it.variantId ?? ""}::${it.size ?? ""}`;
          return (
            <article
              key={key}
              className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={it.imageUrl || "/placeholder.png"}
                  alt={it.name}
                  className="h-20 w-20 rounded-lg object-cover border-2 border-gray-100"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{it.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      📏 Talle: <span className="font-medium text-gray-800">{it.size ?? "-"}</span>
                    </span>
                    <span className="bg-blue-50 px-2 py-1 rounded">
                      🏪 {it.storeName ?? "Sin tienda"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border rounded-lg">
                      <button
                        className="h-8 w-8 rounded-l-lg hover:bg-gray-100 transition-colors font-bold text-gray-700"
                        onClick={() => handleDecreaseQty(it)}
                      >
                        −
                      </button>
                      <span className="px-3 min-w-[40px] text-center font-semibold text-gray-900">{it.qty ?? 1}</span>
                      <button
                        className={`h-8 w-8 rounded-r-lg hover:bg-gray-100 transition-colors font-bold text-gray-700 ${
                          it.qty >= it.stock ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleIncreaseQty(it)}
                        disabled={it.qty >= it.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="text-sm text-rose-600 hover:text-rose-700 hover:underline font-medium flex items-center gap-1"
                      onClick={() => removeItem(it.productId, { variantId: it.variantId, size: it.size })}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                  {it.qty >= it.stock && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      ⚠️ Stock máximo alcanzado
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right min-w-[100px]">
                <div className="text-xl font-bold text-gray-900">
                  ${Number((it.price ?? 0) * (it.qty ?? 1)).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ${Number(it.price ?? 0).toFixed(2)} c/u
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Resumen */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-md max-w-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del pedido</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">${Number(subtotal).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Envío</span>
            <span className="font-medium text-green-600">Gratis</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Impuestos</span>
            <span className="font-medium text-gray-900">—</span>
          </div>
          <div className="border-t pt-3 mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">${Number(subtotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="mt-6 pt-6 border-t">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            💳 Método de pago
          </label>
          <select
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="CREDIT_CARD">💳 Tarjeta de crédito</option>
            <option value="DEBIT_CARD">💳 Tarjeta de débito</option>
            <option value="CASH">💵 Efectivo</option>
            <option value="TRANSFER">🏦 Transferencia bancaria</option>
          </select>
        </div>

        <button
          disabled={items.length === 0 || isProcessing}
          onClick={handleCheckout}
          className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-4 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Procesando compra...
            </>
          ) : (
            <>
              🛍️ Finalizar compra
            </>
          )}
        </button>

        {items.length > 0 && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Al finalizar la compra aceptas nuestros términos y condiciones
          </p>
        )}
      </section>
    </main>
  </>
  );
}