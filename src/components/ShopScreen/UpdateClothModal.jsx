import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { filesToBase64, validateImageFile, imagesToUrls } from "../../utils/imageUtils";

const API_URL = "http://localhost:4003";

const UpdateClothModal = ({ product, onClose, onProductUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    size: "",
    category: "",
    discount: "",
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageBase64Array, setImageBase64Array] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  const { token, user } = useSelector((state) => state.auth);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

    // Estado para stock por talle
  const [stockBySizes, setStockBySizes] = useState(
    sizes.map(() => 0)
  );

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        toast.error("Error al cargar categorías", { position: "bottom-right" });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [token]);

  // Prellenar el formulario con los datos del producto
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        size: product.size || "M",
        category: product.category?.id || "",
        discount: product.discount || "0",
      });

      // Cargar imágenes existentes del producto
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Convertir imágenes del backend a URLs para preview
        const imageUrls = imagesToUrls(product.images);
        setImagePreviews(imageUrls);
        // Guardar también los Base64 para enviar al backend
        setImageBase64Array(product.images.map(img => {
          // Si ya tiene prefijo, mantenerlo; si no, agregarlo
          if (img.imageBase64.startsWith('data:image/')) {
            return img.imageBase64;
          }
          return `data:image/jpeg;base64,${img.imageBase64}`;
        }));
      } else if (product.imageBase64) {
        // Compatibilidad con formato antiguo (una sola imagen)
        const imageUrl = product.imageBase64.startsWith('data:image/') 
          ? product.imageBase64 
          : `data:image/jpeg;base64,${product.imageBase64}`;
        setImagePreviews([imageUrl]);
        setImageBase64Array([imageUrl]);
      } else {
        setImagePreviews([]);
        setImageBase64Array([]);
      }

      // Cargar el stock por talles
      if (Array.isArray(product.stock)) {
        setStockBySizes(product.stock);
      } else {
        // Si es un número (datos antiguos), poner todo en 0
        setStockBySizes(sizes.map(() => 0));
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

    // Manejar cambio de stock por talle
  const handleStockChange = (index, value) => {
    const newStock = [...stockBySizes];
    newStock[index] = parseInt(value) || 0;
    setStockBySizes(newStock);
  };

  // Manejar la selección de múltiples imágenes
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validar cada archivo
    for (const file of files) {
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        toast.error(validation.error, { position: "bottom-right" });
        return;
      }
    }

    try {
      // Convertir todos los archivos a Base64
      const base64Images = await filesToBase64(files);
      
      // Agregar a los arrays existentes
      setImagePreviews(prev => [...prev, ...base64Images]);
      setImageBase64Array(prev => [...prev, ...base64Images]);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      toast.error("Error al cargar las imágenes", { position: "bottom-right" });
    }
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  // Eliminar una imagen específica del preview
  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageBase64Array(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar token
      if (!token) {
        throw new Error("No estás autenticado. Por favor, inicia sesión nuevamente");
      }

      // Validar que el usuario sea dueño de la tienda del producto
      const productShopId = product.shop?.id || product.shopId;
      const userShopId = user?.shopId;
      
      if (userShopId && productShopId && userShopId !== productShopId) {
        throw new Error("No tienes permisos para actualizar este producto. Solo puedes actualizar productos de tu propia tienda.");
      }

      // Validaciones
      if (!form.category) {
        throw new Error("Debes seleccionar una categoría");
      }

      if (parseFloat(form.price) <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      // Validar que al menos un talle tenga stock
      const totalStock = stockBySizes.reduce((sum, stock) => sum + stock, 0);
      if (totalStock === 0) {
        throw new Error("Debes agregar stock para al menos un talle");
      }

      // Preparar las imágenes: remover el prefijo data:image/...;base64, si existe
      const imagesForBackend = imageBase64Array
        .filter(base64 => base64 && typeof base64 === 'string' && base64.length > 0)
        .map(base64 => {
          // Si tiene prefijo, extraer solo el Base64
          if (base64.includes(',')) {
            return base64.split(',')[1];
          }
          return base64;
        });

      // Asegurar que stockBySizes sea un array válido de números
      const validStock = stockBySizes.map(s => {
        const num = parseInt(s);
        return isNaN(num) ? 0 : num;
      });

      const updatedData = {
        name: form.name || "",
        description: form.description || "",
        images: imagesForBackend.length > 0 ? imagesForBackend : [], // Array de Base64 strings
        price: parseFloat(form.price) || 0,
        size: form.size || "M",
        category: parseInt(form.category) || 0,
        stock: validStock,
        discount: parseFloat(form.discount) || 0,
        // No enviar el campo shop - el backend lo infiere del producto existente
      };

      // Validar que los datos críticos sean válidos
      if (!updatedData.name || updatedData.name.trim() === "") {
        throw new Error("El nombre del producto es requerido");
      }
      if (updatedData.price <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }
      if (!updatedData.category || updatedData.category === 0) {
        throw new Error("Debes seleccionar una categoría válida");
      }

      // Validar que el JSON sea válido antes de enviarlo
      let jsonBody;
      try {
        jsonBody = JSON.stringify(updatedData);
        // Verificar que el JSON sea válido
        JSON.parse(jsonBody);
      } catch (jsonError) {
        console.error("Error al serializar datos:", updatedData);
        throw new Error(`Error al preparar los datos: ${jsonError.message}`);
      }

      const res = await fetch(`${API_URL}/cloth/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: jsonBody,
      });

      if (!res.ok) {
        let errorText;
        try {
          errorText = await res.text();
          // Intentar parsear como JSON si es posible
          try {
            const errorJson = JSON.parse(errorText);
            errorText = errorJson.message || errorJson.error || errorText;
          } catch {
            // Si no es JSON válido, usar el texto tal cual
          }
        } catch (e) {
          errorText = `Error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorText || "Error al actualizar el producto");
      }

      let updatedProduct;
      try {
        const responseText = await res.text();
        if (!responseText || responseText.trim() === '') {
          throw new Error("El servidor no devolvió datos");
        }
        updatedProduct = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error al parsear respuesta del servidor:", parseError);
        throw new Error("Error al procesar la respuesta del servidor. Por favor, intenta nuevamente.");
      }
      toast.success("¡Producto actualizado exitosamente!", { position: "bottom-right" });
      onProductUpdated(updatedProduct);
      onClose();
    } catch (err) {
      console.error("Error actualizando producto:", err);
      toast.error(err.message, { position: "bottom-right" });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Editar producto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" type="button">
            ×
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {loadingCategories ? (
          <div className="text-center py-8 text-gray-500">Cargando categorías...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del producto *</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción *</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                rows={3} 
                required 
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            {/* Múltiples Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del producto</label>
              
              {/* Grid de previews de imágenes */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar imagen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input para agregar más imágenes */}
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="image-upload-edit"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="image-upload-edit" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {imagePreviews.length > 0 
                      ? "Haz clic para agregar más imágenes" 
                      : "Haz clic para subir imágenes"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP (máx. 5MB cada una)
                  </span>
                  {imagePreviews.length > 0 && (
                    <span className="text-xs text-blue-600 mt-1 font-medium">
                      {imagePreviews.length} {imagePreviews.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Precio / Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio ($) *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  required 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock por talle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Stock por Talle *
              </label>
              <div className="grid grid-cols-2 gap-5">
                {sizes.map((size, index) => (
                  <div key={size} className="flex items-center gap-3 bg-gray-50 p-5 rounded-md border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 min-w-[40px]">
                      {size}
                    </label>
                    <input
                      type="number"
                      value={stockBySizes[index]}
                      onChange={(e) => handleStockChange(index, e.target.value)}
                      min="0"
                      className="flex-1 border border-gray-300 rounded-md p-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Total de unidades: {stockBySizes.reduce((sum, stock) => sum + stock, 0)}
              </p>
            </div>

            {/* Descuento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Descuento (%) *</label>
              <input 
                type="number" 
                name="discount" 
                value={form.discount} 
                onChange={handleChange} 
                required
                min="0" 
                max="100" 
                step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateClothModal;