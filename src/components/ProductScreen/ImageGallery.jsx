// src/components/ImageGallery.jsx
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

export default function ImageGallery({ images = [] }) {
  const [mainImage, setMainImage] = useState(images[0] || '');

  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center bg-gray-100 min-h-[400px] lg:min-h-full">
        <div className="text-center">
          <ImageOff size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50">
      <div className="mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
        <img 
          src={mainImage} 
          alt="Producto principal" 
          className="w-full h-auto object-cover aspect-[3/4]"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button 
              key={index}
              onClick={() => setMainImage(image)}
              className={`rounded-lg overflow-hidden border-3 transition-all duration-200 ${
                mainImage === image 
                  ? 'border-blue-600 ring-2 ring-blue-300 shadow-md' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img 
                src={image} 
                alt={`Miniatura ${index + 1}`} 
                className="w-full h-full object-cover aspect-square"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}