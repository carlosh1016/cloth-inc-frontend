// src/components/ProductInfo.jsx
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export default function ProductInfo({ name, price, sizes }) {
  const [selectedSize, setSelectedSize] = useState(null);

  return (
    <div className="p-4 md:p-6 flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
      <p className="text-3xl text-gray-700 my-4">{price}</p>
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Talle</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 border rounded-md font-medium transition-colors duration-200 ${selectedSize === size ? 'bg-gray-900 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <button className="w-full bg-[#c3a791] text-white py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-bold hover:bg-[#b59982] transition-colors duration-300">
        <ShoppingCart size={20} />
        Agregar al Carrito
      </button>
    </div>
  );
}