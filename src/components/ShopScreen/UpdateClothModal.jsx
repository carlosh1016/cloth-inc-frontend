import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:4003";

const UpdateClothModal = ({ product, onClose, onProductUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
    size: "",
    category: "",
    stock: "",
    discount: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("cloth-inc-token");
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
      // Manejar la imagen usando imageBase64 del backend
      let imageData = "";
      let previewData = null;
      
      if (product.imageBase64) {
        // El backend ahora devuelve imageBase64 (sin el prefijo data:)
        imageData = `data:image/jpeg;base64,${product.imageBase64}`;
        previewData = imageData;
      }
      
      setForm({
        name: product.name || "",
        description: product.description || "",
        image: imageData, // Guardar con el prefijo completo
        price: product.price || "",
        size: product.size || "M",
        category: product.category?.id || "",
        stock: product.stock || "",
        discount: product.discount || "0",
      });
      setImagePreview(previewData);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido", { position: "bottom-right" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB", { position: "bottom-right" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setForm({ ...form, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: "" });
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload-edit');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!form.category) {
        throw new Error("Debes seleccionar una categoría");
      }

      if (parseFloat(form.price) <= 0) {
        throw new Error("El precio debe ser mayor a 0");
      }

      if (parseInt(form.stock) < 0) {
        throw new Error("El stock no puede ser negativo");
      }

      const updatedData = {
        name: form.name,
        description: form.description,
        image: form.image || null, // Enviar base64 o null
        price: parseFloat(form.price),
        size: form.size,
        category: parseInt(form.category),
        stock: parseInt(form.stock),
        discount: parseFloat(form.discount),
        shop: product.shop?.id || product.shopId, // Incluir el shopId
      };

      const res = await fetch(`${API_URL}/cloth/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al actualizar el producto");
      }

      const updatedProduct = await res.json();
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-y-auto">
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

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del producto</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md border border-gray-300" />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload-edit"
                    accept="image/*"
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
                    <span className="text-sm text-gray-600">Haz clic para cambiar la imagen</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (máx. 5MB)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Precio / Stock */}
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
                <label className="block text-sm font-medium text-gray-700">Stock *</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={form.stock} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>

            {/* Talle / Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Talle *</label>
                <select 
                  name="size" 
                  value={form.size} 
                  onChange={handleChange} 
                  required 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
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