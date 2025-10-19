import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Stock total sumando todas las tallas
  const totalStock = product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img
        src={
          product.imageBase64 
            ? `data:image/jpeg;base64,${product.imageBase64}` 
            : "/public/fotoProductosEjemplo/Sintitulo.png"
        }
        alt={product.name}
        className="w-full h-full object-cover"
      />
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

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {product.discount > 0
              ? `$${(product.price * (1 - product.discount / 100)).toFixed(2)}`
              : `$${product.price.toFixed(2)}`}
          </span>
        </div>

        {/* Stock */}
        <p className={`mt-2 text-sm ${totalStock > 0 ? "text-green-600" : "text-red-600"}`}>
          {totalStock > 0 ? `En stock: ${totalStock}` : "Agotado"}
        </p>

        {/* Tallas disponibles */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.map((s) => (
              <span
                key={s.id}
                className={`px-2 py-1 border rounded text-xs ${
                  s.stock > 0 ? "bg-gray-100" : "bg-gray-300 line-through"
                }`}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
