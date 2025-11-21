/**
 * Utilidades para manejar imágenes en el frontend
 */

/**
 * Convierte un archivo File a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} - String Base64 con prefijo data:image/...
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // Resultado: "data:image/png;base64,..."
    reader.onerror = error => reject(error);
  });
}

/**
 * Convierte múltiples archivos a Base64
 * @param {FileList|File[]} files - Lista de archivos a convertir
 * @returns {Promise<string[]>} - Array de strings Base64
 */
export async function filesToBase64(files) {
  const promises = Array.from(files).map(file => fileToBase64(file));
  return Promise.all(promises);
}

/**
 * Convierte un array de objetos de imagen del backend a URLs para mostrar
 * El backend devuelve: [{id: number, imageBase64: string}] (sin prefijo data:)
 * @param {Array<{id: number, imageBase64: string}>} images - Array de objetos de imagen
 * @returns {string[]} - Array de URLs listas para usar en <img src>
 */
export function imagesToUrls(images) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }
  
  return images.map(imageObj => {
    if (!imageObj || !imageObj.imageBase64) {
      return null;
    }
    
    // Si ya tiene el prefijo data:, devolverlo tal cual
    if (imageObj.imageBase64.startsWith('data:image/')) {
      return imageObj.imageBase64;
    }
    
    // Si no tiene prefijo, agregarlo (asumimos JPEG por defecto, pero podríamos detectar el tipo)
    return `data:image/jpeg;base64,${imageObj.imageBase64}`;
  }).filter(url => url !== null);
}

/**
 * Obtiene la primera imagen de un producto como URL
 * Útil para componentes que solo necesitan mostrar una imagen (cards, carousel, etc.)
 * @param {Object} product - Objeto del producto con campo images
 * @returns {string|null} - URL de la imagen o null si no hay imágenes
 */
export function getFirstImageUrl(product) {
  if (!product) return null;
  
  // Si el producto tiene el formato antiguo (imageBase64 directo)
  if (product.imageBase64) {
    if (product.imageBase64.startsWith('data:image/')) {
      return product.imageBase64;
    }
    return `data:image/jpeg;base64,${product.imageBase64}`;
  }
  
  // Si tiene el nuevo formato (images array)
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage && firstImage.imageBase64) {
      if (firstImage.imageBase64.startsWith('data:image/')) {
        return firstImage.imageBase64;
      }
      return `data:image/jpeg;base64,${firstImage.imageBase64}`;
    }
  }
  
  return null;
}

/**
 * Valida un archivo de imagen
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB (default: 5)
 * @returns {{valid: boolean, error?: string}} - Resultado de la validación
 */
export function validateImageFile(file, maxSizeMB = 5) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  const maxSize = maxSizeMB * 1024 * 1024; // Convertir MB a bytes
  
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Use PNG, JPEG, WebP o GIF' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `El archivo es demasiado grande (máx ${maxSizeMB}MB)` };
  }
  
  return { valid: true };
}

