// src/components/ProductScreen/ProductInfo.jsx
import { useState } from "react";
import { ShoppingCart, Package, Tag, Store } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getFirstImageUrl } from "../../utils/imageUtils";
import { addItem } from "../../redux/cartSlice";

export default function ProductInfo({ product }) {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?.userId);

  const { name, price, stock, discount, category, shop, images } = product;

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // stock viene como array [xs,s,m,l,xl,xxl]
  const stockArray = Array.isArray(stock) ? stock : [0, 0, 0, 0, 0, 0];
  const totalStock = stockArray.reduce((sum, s) => sum + (s || 0), 0);

  const [quantities, setQuantities] = useState({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });

  const hasDiscount = !!discount && discount > 0;
  const discountedPrice = hasDiscount ? price * (1 - discount / 100) : price;

  const handleAddToCart = () => {
    if (!userId) {
      toast.error("Tenés que iniciar sesión para agregar al carrito");
      return;
    }

    if (totalStock <= 0) {
      toast.error("Este producto no tiene stock disponible");
      return;
    }

    // Verificar que al menos un talle tenga cantidad > 0
    const hasAnyQuantity = sizes.some((size, idx) => {
      const qty = quantities[size] || 0;
      return qty > 0;
    });

    if (!hasAnyQuantity) {
      toast.error("Seleccioná al menos un talle con cantidad mayor a 0");
      return;
    }

    const finalPrice = Number(discountedPrice.toFixed(2));
    let itemsAdded = 0;

    // Agregar cada talle con cantidad > 0 al carrito
    sizes.forEach((size, idx) => {
      const qty = quantities[size] || 0;
      if (qty > 0) {
        const availableQty = stockArray[idx] || 0;
        
        if (availableQty <= 0) {
          toast.error(`No hay stock disponible para el talle ${size}`);
          return;
        }

        if (qty > availableQty) {
          toast.error(`Solo hay ${availableQty} unidades disponibles para el talle ${size}`);
          return;
        }

        const cartItem = {
          productId: product._id || product.id,
          variantId: null,
          size: size,
          name,
          price: finalPrice,
          originalPrice: price,
          discount: discount || 0,
          imageUrl: getFirstImageUrl(images),
          shopId: shop?._id || shop?.id || shop,
          shopName: shop?.name || shop?.shopName || product.shopName || "Tienda",
          storeName: shop?.name || shop?.shopName || product.shopName || "Tienda",
          qty: qty,
          maxQty: availableQty,
        };

        dispatch(addItem(cartItem));
        itemsAdded++;
      }
    });

    if (itemsAdded > 0) {
      toast.success(`${itemsAdded} ${itemsAdded === 1 ? "producto" : "productos"} agregado${itemsAdded === 1 ? "" : "s"} al carrito`);
      // Resetear cantidades después de agregar
      setQuantities({ XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    }
  };

  const handleChangeQty = (size, delta) => {
    const idx = sizes.indexOf(size);
    if (idx === -1) return;

    const availableQty = stockArray[idx] || 0;
    if (availableQty <= 0) return;

    setQuantities((prev) => {
      const currentQty = prev[size] || 0;
      const next = currentQty + delta;
      
      // No permitir valores negativos
      if (next < 0) return prev;
      
      // No exceder el stock disponible
      if (next > availableQty) {
        toast.info(`Stock máximo disponible: ${availableQty} unidades para talle ${size}`);
        return prev;
      }
      
      return {
        ...prev,
        [size]: next,
      };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">{name}</h1>
        {category && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Tag className="h-4 w-4" />
            {typeof category === 'object' ? category?.name : category}
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm line-through text-gray-400">
                ${price.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                -{discount}%
              </span>
            </>
          )}
        </div>
        {hasDiscount && (
          <p className="text-green-600 text-sm font-medium">
            ¡Ahorrás ${(price - discountedPrice).toFixed(2)}!
          </p>
        )}
      </div>

      {/* Stock total */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          <span>
            Stock total:{" "}
            <span className="font-semibold">
              {totalStock > 0 ? totalStock : "Sin stock"}
            </span>
          </span>
        </div>
      </div>

      {/* Tienda */}
      {shop && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="h-4 w-4" />
          <span>
            Vendido por{" "}
            <span className="font-semibold">
              {shop.name || shop.shopName || "Tienda"}
            </span>
          </span>
        </div>
      )}

      {/* Talles */}
      <div>
        <p className="text-sm font-medium mb-3">Talles disponibles</p>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s, idx) => {
            const sizeStock = stockArray[idx] || 0;
            const disabled = sizeStock <= 0;
            const selectedQty = quantities[s] || 0;
            const isSelected = selectedQty > 0;

            return (
              <div
                key={s}
                className={`flex flex-col items-center justify-center px-3 py-3 rounded-lg border-2 text-base font-medium transition-all
                  ${
                    disabled
                      ? "bg-gray-100 border-gray-200"
                      : isSelected
                      ? "bg-black border-black shadow-md"
                      : "bg-white border-gray-300"
                  }`}
              >
                <span className={`font-semibold ${disabled ? "text-gray-400 line-through" : isSelected ? "text-white" : "text-gray-800"}`}>
                  {s}
                </span>
                <span className={`text-xs mt-1 mb-2 ${
                  disabled 
                    ? "text-gray-400" 
                    : isSelected 
                    ? "text-gray-200" 
                    : "text-gray-500"
                }`}>
                  {sizeStock > 0 ? `${sizeStock} disponible${sizeStock !== 1 ? "s" : ""}` : "Sin stock"}
                </span>
                {!disabled && (
                  <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`h-7 w-7 rounded border flex items-center justify-center text-sm transition-colors ${
                        isSelected
                          ? "border-gray-600 text-white hover:bg-gray-800"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      } ${selectedQty === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleChangeQty(s, -1)}
                      disabled={selectedQty === 0}
                    >
                      −
                    </button>
                    <span className={`min-w-[24px] text-center text-sm font-medium ${
                      isSelected ? "text-white" : "text-gray-800"
                    }`}>
                      {selectedQty}
                    </span>
                    <button
                      type="button"
                      className={`h-7 w-7 rounded border flex items-center justify-center text-sm transition-colors ${
                        isSelected
                          ? "border-gray-600 text-white hover:bg-gray-800"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      } ${selectedQty >= sizeStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleChangeQty(s, 1)}
                      disabled={selectedQty >= sizeStock}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón agregar al carrito */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={totalStock <= 0 || !sizes.some((size) => (quantities[size] || 0) > 0)}
        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalStock <= 0
          ? "Sin stock"
          : !sizes.some((size) => (quantities[size] || 0) > 0)
          ? "Seleccioná cantidades para agregar"
          : "Agregar al carrito"}
      </button>

      {totalStock > 0 && totalStock < 5 && (
        <p className="text-orange-600 text-sm font-medium text-center">
          ⚠️ ¡Solo quedan {totalStock} unidades disponibles!
        </p>
      )}
    </div>
  );
}
