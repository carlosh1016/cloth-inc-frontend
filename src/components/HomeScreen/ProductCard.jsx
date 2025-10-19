import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Imagen del producto */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.imageBase64 && (
          <img
            src={`data:image/jpeg;base64,${product.imageBase64}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Badge de descuento (opcional) */}
        {product.discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-gray-900 font-medium mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          
          {/* Indicador de colores disponibles (opcional) */}
          {product.colors && Array.isArray(product.colors) && product.colors.length > 1 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tallas disponibles (opcional) */}
        {product.size && (
          <div className="mt-2 text-xs text-gray-500">
            Sizes: {Array.isArray(product.size) ? product.size.join(', ') : product.size}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
