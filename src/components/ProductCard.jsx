import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, viewMode = "grid" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Vista de lista
  if (viewMode === "list") {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex gap-4 p-4"
      >
        {/* Imagen */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100 rounded">
          {product.imageBase64 ? (
            <img
              src={`data:image/jpeg;base64,${product.imageBase64}`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Badge de descuento */}
          {product.discount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white px-1 py-0.5 text-xs font-semibold rounded">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-medium mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mb-2">
            <div>
              {product.discount > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Stock y Talle */}
          <div className="flex items-center justify-between text-sm">
            <p className={`${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
            </p>
            
            {/* Talle */}
            {product.size && (
              <span className="text-gray-600">
                <span className="font-medium">{product.size}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista de cuadrícula (por defecto)
  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {product.imageBase64 ? (
          <img
            src={`data:image/jpeg;base64,${product.imageBase64}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badge de descuento */}
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Información */}
      <div className="p-4">
        <h3 className="text-gray-900 font-medium mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <div>
            {product.discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Stock y Talle */}
        <div className="flex items-center justify-between text-sm">
          <p className={`${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
          </p>
          
          {/* Talle */}
          {product.size && (
            <span className="text-gray-600">
              <span className="font-medium">{product.size}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

