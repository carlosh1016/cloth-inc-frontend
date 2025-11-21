// ImageCarousel.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirstImageUrl } from "../../utils/imageUtils";

export default function ImageCarousel({ products = [] }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  // Obtener los primeros 3-5 productos para el carrusel
  const carouselProducts = products.slice(0, 5);

  const prevSlide = () =>
    setCurrent(current === 0 ? carouselProducts.length - 1 : current - 1);
  const nextSlide = () =>
    setCurrent(current === carouselProducts.length - 1 ? 0 : current + 1);

  // Si no hay productos, mostrar un placeholder
  if (carouselProducts.length === 0) {
    return (
      <div className="relative w-full overflow-hidden h-64 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {carouselProducts.map((product) => {
          const firstImageUrl = getFirstImageUrl(product);
          return (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-full h-64 md:h-96 relative group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img
              src={firstImageUrl || "/fotoProductosEjemplo/Sintitulo.png"}
              alt={product.name || `Producto ${product.id}`}
              className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay con información del producto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl flex items-end p-6">
              <div className="text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                  {product.name || `Producto ${product.id}`}
                </h3>
                {product.price && (
                  <div className="flex items-center gap-3">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-xl md:text-2xl font-bold text-green-400">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                        <span className="text-sm md:text-base line-through text-gray-300">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="bg-red-500 text-white text-xs md:text-sm px-2 py-1 rounded-full font-semibold">
                          -{product.discount}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xl md:text-2xl font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white/90 transition-colors"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white/90 transition-colors"
      >
        ›
      </button>
    </div>
  );
}
