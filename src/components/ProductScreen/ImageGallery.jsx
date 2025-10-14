// src/components/ImageGallery.jsx
import { useState, useEffect } from 'react';

export default function ImageGallery({ images = [] }) {
  const [mainImage, setMainImage] = useState(images[0] || '');

  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center">
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <img 
          src={mainImage} 
          alt="Producto principal" 
          className="w-full h-auto object-cover rounded-lg aspect-[3/4]"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button 
            key={index}
            onClick={() => setMainImage(image)}
            className={`rounded-md overflow-hidden border-2 ${mainImage === image ? 'border-amber-600' : 'border-transparent'}`}
          >
            <img src={image} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover aspect-square" />
          </button>
        ))}
      </div>
    </div>
  );
}