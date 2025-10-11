// ImageCarousel.jsx
import { useState } from "react";

const producto = "/fotoProductosEjemplo/Sintitulo.png";

export default function ImageCarousel() {
  const images = [producto, producto, producto]; // 3 veces la misma imagen
  const [current, setCurrent] = useState(0);

  const prevSlide = () =>
    setCurrent(current === 0 ? images.length - 1 : current - 1);
  const nextSlide = () =>
    setCurrent(current === images.length - 1 ? 0 : current + 1);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="flex-shrink-0 w-full h-64 md:h-96">
            <img
              src={img}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover rounded-xl transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => window.location.href="/producto"}
            />
          </div>
        ))}
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
