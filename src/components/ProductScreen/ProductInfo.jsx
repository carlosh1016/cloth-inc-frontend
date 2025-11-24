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

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

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

    if (!selectedSize) {
      toast.error("Seleccioná un talle antes de agregar al carrito");
      return;
    }

    const idx = sizes.indexOf(selectedSize);
    if (idx === -1) {
      toast.error("Talle inválido");
      return;
    }

    const availableQty = stockArray[idx] || 0;
    if (availableQty <= 0) {
      toast.error("No hay stock para ese talle");
      return;
    }

    if (quantity > availableQty) {
      toast.error(`Solo hay ${availableQty} unidades disponibles para este talle`);
      return;
    }

    const finalPrice = Number(discountedPrice.toFixed(2));

    const cartItem = {
      productId: product._id || product.id,
      variantId: null,
      size: selectedSize,
      name,
      price: finalPrice,
      originalPrice: price,
      discount: discount || 0,
      imageUrl: getFirstImageUrl(images),
      shopId: shop?._id || shop?.id || shop,
      shopName: shop?.name || shop?.shopName || product.shopName || "Tienda",
      storeName: shop?.name || shop?.shopName || product.shopName || "Tienda",
      qty: quantity,
      maxQty: availableQty,
    };

    dispatch(addItem(cartItem));
    toast.success("Producto agregado al carrito");
  };

  const handleChangeQty = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">{name}</h1>
        {category && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Tag className="h-4 w-4" />
            {category}
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
        <p className="text-sm font-medium mb-2">Talles disponibles</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s, idx) => {
            const sizeStock = stockArray[idx] || 0;
            const disabled = sizeStock <= 0;

            return (
              <button
                key={s}
                type="button"
                onClick={() => !disabled && setSelectedSize(s)}
                disabled={disabled}
                className={`px-3 py-1 rounded-full border text-sm
                  ${
                    disabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                      : selectedSize === s
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-800 hover:bg-gray-50"
                  }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Cantidad:</span>
        <div className="flex items-center border rounded-lg">
          <button
            type="button"
            className="h-8 w-8 rounded-l-lg hover:bg-gray-100 text-lg"
            onClick={() => handleChangeQty(-1)}
          >
            −
          </button>
          <span className="px-4 text-center min-w-[40px]">{quantity}</span>
          <button
            type="button"
            className="h-8 w-8 rounded-r-lg hover:bg-gray-100 text-lg"
            onClick={() => handleChangeQty(1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Botón agregar al carrito */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={totalStock <= 0}
        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalStock <= 0
          ? "Sin stock"
          : !selectedSize
          ? "Selecciona un talle"
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
