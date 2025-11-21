// src/views/Checkout.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { useCart } from "../components/CartContext";

export default function Checkout() {
  // ---------- AUTH ----------
  const { token, user } = useSelector((state) => state.auth);
  const userId = user?.userId;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ---------- CARRITO ----------
  const cart = useCart();
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const clear = cart?.clear ?? (() => {});
  const navigate = useNavigate();

  if (items.length === 0) {
    toast.info("Tu carrito está vacío", { position: "bottom-right" });
    return <Navigate to="/cart" replace />;
  }

  // ---------- TIENDAS DEL CARRITO ----------
  const uniqueShops = [...new Set(items.map((item) => item.shopId))];

  // Dirección de cada tienda: { [shopId]: "dirección" }
  const [storeAddresses, setStoreAddresses] = useState({});

  useEffect(() => {
    const shopIds = [
      ...new Set(items.map((item) => item.shopId).filter(Boolean)),
    ];

    if (shopIds.length === 0) {
      setStoreAddresses({});
      return;
    }

    const fetchShops = async () => {
      try {
        const entries = await Promise.all(
          shopIds.map(async (shopId) => {
            const res = await fetch(`http://localhost:4003/shop/${shopId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!res.ok) return [shopId, "Dirección no disponible"];
            const data = await res.json();

            const dir =
              `${data.address || ""} ${data.city || ""} ${
                data.province || ""
              }`.trim() || "Dirección no disponible";

            return [shopId, dir];
          })
        );

        setStoreAddresses(Object.fromEntries(entries));
      } catch (err) {
        console.error("Error al obtener tiendas:", err);
      }
    };

    fetchShops();
  }, [items, token]);

  // ---------- DATOS DE ENVÍO ----------
  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    province: "",
    zip: "",
    phone: "",
  });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el campo fullName, solo permitir letras y espacios
    if (name === "fullName") {
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
      setShipping((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setShipping((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---------- MÉTODO DE PAGO + TARJETA ----------
  const [payMethod, setPayMethod] = useState("CREDIT_CARD");
  const [card, setCard] = useState({
    holder: "",
    number: "",
    exp: "",
    cvv: "",
  });

  const isValidExp = (exp) => {
    // formato MM/YY
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;

    const [mmStr, yyStr] = exp.split("/");
    const month = parseInt(mmStr, 10);
    const year = parseInt(yyStr, 10);

    if (Number.isNaN(month) || Number.isNaN(year)) return false;
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100; // últimos 2 dígitos
    const currentMonth = now.getMonth() + 1; // 1–12

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  // ---------- ESTADO DE PROCESO ----------
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------- HANDLE CHECKOUT ----------
  const handleCheckout = async () => {
    // Validar datos de envío
    if (
      !shipping.fullName ||
      !shipping.address ||
      !shipping.city ||
      !shipping.province ||
      !shipping.zip
    ) {
      toast.error("Completá todos los datos obligatorios de envío.", {
        position: "bottom-right",
      });
      return;
    }

    // Validar teléfono si se completó (debe tener exactamente 13 dígitos)
    if (shipping.phone && shipping.phone.length !== 13) {
      toast.error("El teléfono debe tener exactamente 13 dígitos.", {
        position: "bottom-right",
      });
      return;
    }

    // Validar método de pago
    if (payMethod === "CREDIT_CARD" || payMethod === "DEBIT_CARD") {
      if (!card.holder || card.holder.trim().length === 0) {
        toast.error("Ingresá el nombre del titular de la tarjeta.", {
            position: "bottom-right",
        });
        return;
    }
      if (card.number.length !== 16) {
        toast.error("El número de tarjeta debe tener 16 dígitos.", {
          position: "bottom-right",
        });
        return;
      }
      if (!isValidExp(card.exp)) {
        toast.error("La fecha de vencimiento es inválida o ya venció.", {
          position: "bottom-right",
        });
        return;
      }
      if (card.cvv.length !== 3) {
        toast.error("El CVV debe tener 3 dígitos.", {
          position: "bottom-right",
        });
        return;
      }
    }

    if (payMethod === "CASH" && uniqueShops.length !== 1) {
      toast.error(
          "El pago en efectivo solo está disponible cuando todos los productos pertenecen a una sola tienda.",
        { position: "bottom-right" }
      );
      return;
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío.", { position: "bottom-right" });
      navigate("/cart");
      return;
    }

    // Validar stock
    const insufficientStock = items.find((item) => item.qty > item.stock);
    if (insufficientStock) {
      toast.error(`No hay suficiente stock de "${insufficientStock.name}".`, {
        position: "bottom-right",
        autoClose: 4000,
      });
      return;
    }

    if (!userId) {
      toast.error("No se encontró información del usuario.", {
        position: "bottom-right",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Agrupar por tienda
    const itemsByShop = items.reduce((acc, item) => {
        const shopId = item.shopId;
        if (!shopId) {
          throw new Error(
            `El producto "${item.name}" no tiene tienda asignada.`
          );
        }
        if (!acc[shopId]) acc[shopId] = [];
        acc[shopId].push(item);
        return acc;
      }, {});

    // Crear órdenes por tienda
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const orderPromises = Object.entries(itemsByShop).map(
    async ([shopId, shopItems]) => {
        const amount = shopItems.reduce(
          (sum, item) => sum + item.price * item.qty, 0 );

          const orderData = {
            amount,
            emitedDate: today,
            state: true,
            payMethod,
            userId: parseInt(userId),
            shopId: parseInt(shopId),
          };

          const response = await fetch("http://localhost:4003/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Error al crear orden: ${errorText || response.status}`
            );
          }

          return response.json();
        }
      );

      await Promise.all(orderPromises);

      // Actualizar stock de cada producto
      const stockUpdatePromises = items.map(async (item) => {
      const newStock = item.stock - item.qty;

        const updatedProduct = {
          name: item.name,
          description: item.description,
          image: item.imageUrl,
          price: item.originalPrice,
          size: item.size,
          category: item.category?.id,
          stock: newStock,
          discount: item.discount,
          shop: item.shopId,
        };

        const response = await fetch(
          `http://localhost:4003/cloth/${item.productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedProduct),
          }
        );

        if (!response.ok) {
          console.error(
            `Error al actualizar stock del producto ${item.name}`,
            response.status
          );
        }
      });

      await Promise.all(stockUpdatePromises);

      toast.success("¡Compra realizada con éxito! Redirigiendo...", {
        position: "bottom-right",
        autoClose: 2000,
      });

      clear();
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(
        "Ocurrió un error al procesar la compra. Inténtalo de nuevo más tarde.",
        {
          position: "bottom-right",
          autoClose: 4000,
        }
      );
    } finally {
      setIsProcessing(false);
    }
  };

return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8 grid gap-8 grid-cols-2">
        {/* COLUMNA IZQUIERDA: Datos + Método de pago */}
        <div className="space-y-6">
          {/* DATOS DEL COMPRADOR */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Datos del comprador
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleShippingChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  name="address"
                  value={shipping.address}
                  onChange={handleShippingChange}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ciudad
                  </label>
                  <input
                    name="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Provincia
                  </label>
                  <input
                    name="province"
                    value={shipping.province}
                    onChange={handleShippingChange}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código postal
                  </label>
                  <input
                    name="zip"
                    value={shipping.zip}
                    onChange={handleShippingChange}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono (opcional)
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={shipping.phone}
                    maxLength={13}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setShipping((prev) => ({ ...prev, phone: value }));
                    }}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                  {shipping.phone.length > 0 && shipping.phone.length !== 13 && (
                    <p className="text-sm text-red-500 mt-1">
                      El teléfono debe tener exactamente 13 dígitos.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MÉTODO DE PAGO */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Método de pago
            </h2>

            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 mb-4"
            >
              <option value="CREDIT_CARD">Tarjeta de crédito</option>
              <option value="DEBIT_CARD">Tarjeta de débito</option>
              <option value="CASH">Efectivo</option>
              <option value="TRANSFER">Transferencia bancaria</option>
            </select>

            {/* TARJETA */}
            {(payMethod === "CREDIT_CARD" || payMethod === "DEBIT_CARD") && (
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nombre del titular</label>
                    <input
                        value={card.holder || ""}
                        onChange={(e) =>
                        setCard((prev) => ({ ...prev, holder: e.target.value }))
                        }
                        autoComplete="off"
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {card.holder !== undefined && card.holder.trim().length === 0 && (
                        <p className="text-sm text-red-500">
                        Ingresá el nombre del titular.
                        </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Número de tarjeta
                  </label>
                  <input
                    value={card.number}
                    maxLength={16}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCard((prev) => ({ ...prev, number: value }));
                    }}
                    autoComplete="off"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                  {card.number.length > 0 && card.number.length !== 16 && (
                    <p className="text-sm text-red-500">
                      La tarjeta debe tener 16 dígitos.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Vencimiento (MM/YY)
                    </label>
                    <input
                      value={card.exp}
                      maxLength={5}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^0-9/]/g, "");
                        if (v.length === 2 && !v.includes("/")) v += "/";
                        setCard((prev) => ({ ...prev, exp: v }));
                      }}
                      autoComplete="off"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {card.exp && !isValidExp(card.exp) && (
                      <p className="text-sm text-red-500">
                        Fecha inválida o ya vencida.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">CVV</label>
                    <input
                      value={card.cvv}
                      maxLength={3}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setCard((prev) => ({ ...prev, cvv: value }));
                      }}
                      autoComplete="off"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {card.cvv.length > 0 && card.cvv.length !== 3 && (
                      <p className="text-sm text-red-500">
                        El CVV debe tener 3 dígitos.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EFECTIVO */}
            {payMethod === "CASH" && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-sm">
                {uniqueShops.length === 1 ? (
                <p>
                    Podés pagar en efectivo directamente en la tienda:{" "}
                    <span className="font-semibold">
                    {storeAddresses[uniqueShops[0]] || "Dirección no disponible"}
                    </span>
                </p>
                ) : (
                <p className="text-red-600 font-semibold">
                    El pago en efectivo no está disponible porque tu pedido incluye
                    productos de más de una tienda.
                </p>
                )}
            </div>
            )}

            {/* TRANSFERENCIA */}
            {payMethod === "TRANSFER" && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                <p>
                  Te enviaremos los datos bancarios de la tienda por mail
                  para realizar la transferencia.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* COLUMNA DERECHA: Resumen + Finalizar */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-md h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Resumen del pedido
          </h2>

          <div className="space-y-3 text-sm mb-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}-${item.size}`}
                className="flex justify-between text-gray-700"
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                ${Number(subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="font-medium text-green-600">Gratis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impuestos</span>
              <span className="font-medium text-gray-900">—</span>
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                ${Number(subtotal).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            disabled={isProcessing || items.length === 0}
            onClick={handleCheckout}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando compra...
              </>
            ) : (
              <>🛍️ Finalizar compra</>
            )}
          </button>
        </section>
      </main>
    </>
  );
}
