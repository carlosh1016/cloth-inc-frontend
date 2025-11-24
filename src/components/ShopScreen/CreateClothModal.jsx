import { useState, useEffect, use } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { filesToBase64, validateImageFile } from "../../utils/imageUtils";
import { useDispatch } from "react-redux";
import { fetchCategories, selectCategories, selectCategoriesLoading, selectCategoriesError } from "../../redux/categoriesSlice";

const API_URL = "http://localhost:4003";

const CreateProductModal = ({ onClose, onProductCreated, shopId }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    size: "M",
    category: "",
    discount: "0",
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageBase64Array, setImageBase64Array] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const categories = useSelector(selectCategories);
  const loadingCategories = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const [stockBySizes, setStockBySizes] = useState(
  sizes.map(() => 0)
  );

  // Cargar categorías al montar el componente
  useEffect(() => {
    if (categories.length === 0 && !loadingCategories) {
      dispatch(fetchCategories());
    }
    
    // Seleccionar la primera categoría por defecto si existe
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [dispatch, categories, loadingCategories, form.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

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
        toast.error(validation.error, {
          position: "bottom-right",
        });
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
      toast.error("Error al cargar las imágenes", {
        position: "bottom-right",
      });
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

      // Validaciones
      if (!form.category) {
        throw new Error("Debes seleccionar una categoría");
      }

      if (parseFloat(form.price) <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      const totalStock = stockBySizes.reduce((sum, stock) => sum + stock, 0);
      if (totalStock === 0) {
        throw new Error("Debes agregar stock para al menos un talle");
      }

      // Preparar las imágenes: remover el prefijo data:image/...;base64, si existe
      // El backend acepta con o sin prefijo, pero es mejor enviarlo sin prefijo para consistencia
      const imagesForBackend = imageBase64Array.map(base64 => {
        // Si tiene prefijo, extraer solo el Base64
        if (base64.includes(',')) {
          return base64.split(',')[1];
        }
        return base64;
      });

      const productData = {
        name: form.name,
        description: form.description,
        images: imagesForBackend.length > 0 ? imagesForBackend : [], // Array de Base64 strings
        price: parseFloat(form.price),
        size: form.size,
        category: parseInt(form.category),
        stock: stockBySizes,
        discount: parseFloat(form.discount),
        shop: shopId,
      };

      const res = await fetch(`${API_URL}/cloth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Error al crear producto");
      }

      const newProduct = await res.json();

      toast.success("¡Producto creado exitosamente!", {
        position: "bottom-right",
      });

      // Notificar al componente padre
      onProductCreated(newProduct);
      onClose();
    } catch (err) {
      console.error("Error creando producto:", err);
      setError(err.message);
      toast.error(err.message, {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Crear nuevo producto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loadingCategories ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando categorías...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Remera básica"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe el producto..."
              />
            </div>

            {/* Subida de Múltiples Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del producto (opcional)
              </label>
              
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
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="image-upload" 
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

            {/* Fila: Precio y Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila: Talle y Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Stock por Talle *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((size, index) => (
                  <div key={size} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 min-w-[35px]">
                      {size}
                    </label>
                    <input
                      type="number"
                      value={stockBySizes[index]}
                      onChange={(e) => handleStockChange(index, e.target.value)}
                      min="0"
                      className="flex-1 border border-gray-300 rounded-md p-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total de unidades: {stockBySizes.reduce((sum, stock) => sum + stock, 0)}
              </p>
            </div>


            {/* Descuento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descuento (%) *
              </label>
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
                placeholder="0"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t sticky bottom-0 bg-white">
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
                disabled={loading || loadingCategories}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando..." : "Crear producto"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateProductModal;