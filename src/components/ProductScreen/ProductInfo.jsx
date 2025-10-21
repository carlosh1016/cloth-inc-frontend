// src/components/ProductInfo.jsx
import { ShoppingCart, Package, Tag, Store } from 'lucide-react';
import { useCart } from '../../components/CartContext';
import { toast } from 'react-toastify';
import { use } from 'react';

export default function ProductInfo({ product }) {
  const userId = localStorage.getItem("cloth-inc-user-id");
  const { name, price, size, stock, discount, category, shop } = product;
  const cart = useCart();
  
  // Calcular precio con descuento
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const hasDiscount = discount > 0;

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: discountedPrice,
      imageUrl: product.imageBase64 
        ? `data:image/jpeg;base64,${product.imageBase64}` 
        : null,
      size: product.size,
      storeName: product.shop?.name,
      shopId: product.shop?.id,
      stock: product.stock,
      category: product.category,
      description: product.description,
      discount: product.discount,
      originalPrice: product.price,
      qty: 1
    };
    
    cart.addItem(cartItem);
    toast.success("✓ Producto agregado al carrito", {
      position: "bottom-right",
      autoClose: 2000
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

      {/* Información de stock y talle */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Talle</h3>
          <div className="px-4 py-2 bg-gray-100 rounded-md text-center font-bold text-gray-900">
            {size || 'N/A'}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Disponibilidad</h3>
          <div className={`px-4 py-2 rounded-md text-center font-medium flex items-center justify-center gap-2 ${
            stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <Package size={18} />
            {stock > 0 ? `${stock} en stock` : 'Agotado'}
          </div>
        </div>
      </div>

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
          stock > 0 
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={stock === 0}
        onClick={userId ? handleAddToCart : () => toast.info("Por favor, inicia sesión para agregar productos al carrito.", {
          position: "bottom-right",
          autoClose: 3000
        })}
      >
        <ShoppingCart size={22} />
        {stock > 0 ? 'Agregar al Carrito' : 'Producto Agotado'}
      </button>

      {stock > 0 && stock < 5 && (
        <p className="text-orange-600 text-sm font-medium text-center">
          ⚠️ ¡Solo quedan {stock} unidades disponibles!
        </p>
      )}
    </div>
  );
}