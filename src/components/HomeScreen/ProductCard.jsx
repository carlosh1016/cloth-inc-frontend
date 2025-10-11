import { Link } from "react-router-dom";

export default function ProductCard({ id, name, price, image }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Imagen clickeable */}
      <Link to={`/product/${id}`}>
        <div
          className="h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      </Link>

      {/* Información */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="mt-1">${price}</p>
      </div>
    </div>
  );
}
