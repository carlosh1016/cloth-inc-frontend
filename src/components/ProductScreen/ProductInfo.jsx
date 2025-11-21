// src/components/ProductInfo.jsx
import { useState } from 'react';
import { ShoppingCart, Package, Tag, Store } from 'lucide-react';
import { useCart } from '../../components/CartContext';
import { toast } from 'react-toastify';

export default function ProductInfo({ product }) {
  const userId = localStorage.getItem("cloth-inc-user-id");
  const { name, price, size, stock, discount, category, shop } = product;
  const cart = useCart();

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Estado para el talle seleccionado
  const [selectedSize, setSelectedSize] = useState("");
  
  // Calcular precio con descuento
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const hasDiscount = discount > 0;

  // Obtener stock por talles
  const stockArray = Array.isArray(stock) ? stock : [0, 0, 0, 0, 0, 0];
  const totalStock = stockArray.reduce((sum, s) => sum + (s || 0), 0);

  // Obtener talles disponibles (con stock > 0)
  const availableSizes = sizes.filter((_, index) => stockArray[index] > 0);

  // Obtener stock del talle seleccionado
  const getStockForSize = (size) => {
    const index = sizes.indexOf(size);
    return stockArray[index] || 0;
  };



  const handleAddToCart = () => {
    if (!userId) {
      toast.error("Debes iniciar sesión para agregar productos al carrito", {
        position: "bottom-right",
      });
      return;
    }

        // Validar que se haya seleccionado un talle
    if (!selectedSize) {
      toast.error("Por favor selecciona un talle", {
        position: "bottom-right",
      });
      return;
    }

        // Validar que el talle seleccionado tenga stock
    const sizeStock = getStockForSize(selectedSize);
    if (sizeStock === 0) {
      toast.error("El talle seleccionado no tiene stock disponible", {
        position: "bottom-right",
      });
      return;
    }
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: discountedPrice,
      imageUrl: product.imageBase64
        ? `data:image/jpeg;base64,${product.imageBase64}`
        : null,
      size: selectedSize,
      stockAvailable: sizeStock,
      storeName: product.shop?.name,
      shopId: product.shop?.id,
      category: product.category,
      description: product.description,
      discount: product.discount,
      originalPrice: product.price,
      qty: 1,
    };

    cart.addItem(cartItem);
    toast.success(`${name} (Talle ${selectedSize}) agregado al carrito`, {
      position: "bottom-right",
    });
  };

  return (
    <div className="p-4 md:p-8 flex flex-col justify-center space-y-6">
      {/* Nombre del producto */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {name || 'Producto sin nombre'}
        </h1>
        {category && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Tag size={16} />
            {category.name}
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-2xl text-gray-500 line-through">
                ${price.toFixed(2)}
              </span>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {totalStock > 0 ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                En stock ({totalStock} unidades disponibles)
              </span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-600">
                Sin stock
              </span>
            </>
          )}
        </div>
      </div>

      {/* Selector de Talle */}
      {totalStock > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona tu talle:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size, index) => {
              const sizeStock = stockArray[index] || 0;
              const isAvailable = sizeStock > 0;
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    relative py-3 px-4 border-2 rounded-lg font-medium text-sm transition-all
                    ${isSelected 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : isAvailable
                        ? 'border-gray-300 hover:border-blue-400 text-gray-900'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">{size}</span>
                    {isAvailable && (
                      <span className="text-xs mt-1 text-gray-600">
                        {sizeStock} disp.
                      </span>
                    )}
                    {!isAvailable && (
                      <span className="text-xs mt-1">Sin stock</span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedSize && (
            <p className="text-xs text-gray-600 mt-2">
              Talle seleccionado: <strong>{selectedSize}</strong> ({getStockForSize(selectedSize)} disponibles)
            </p>
          )}
        </div>
      )}


      {/* Información de la tienda */}
      {shop && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Store size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Vendido por</h3>
          </div>
          <p className="text-gray-700 font-medium">{shop.name}</p>
          {shop.address && (
            <p className="text-sm text-gray-600 mt-1">{shop.address}</p>
          )}
        </div>
      )}

      {/* Botón de agregar al carrito */}
      <button 
        className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-bold transition-all duration-300 ${
          totalStock > 0 && selectedSize
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={totalStock === 0 || !selectedSize}
        onClick={handleAddToCart}
      >
        <ShoppingCart size={22} />
        {totalStock === 0 
          ? 'Sin stock' 
          : !selectedSize
            ? 'Selecciona un talle'
            : 'Agregar al carrito'
        }
      </button>

      {totalStock > 0 && totalStock < 5 && (
        <p className="text-orange-600 text-sm font-medium text-center">
          ⚠️ ¡Solo quedan {totalStock} unidades disponibles!
        </p>
      )}
    </div>
  );
}