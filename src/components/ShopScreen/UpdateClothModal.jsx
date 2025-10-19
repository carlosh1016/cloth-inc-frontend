import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:4003";

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
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

  // Cargar categorías y datos del producto
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
        image: product.image || "",
        price: product.price || "",
        size: product.size || "M",
        category: product.category?.id || "",
        stock: product.stock || "",
        discount: product.discount || "0",
      });
      setImagePreview(product.image || null);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        name: form.name,
        description: form.description,
        image: form.image || null,
        price: parseFloat(form.price),
        size: form.size,
        category: parseInt(form.category),
        stock: parseInt(form.stock),
        discount: parseFloat(form.discount),
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
      toast.success("Producto actualizado exitosamente", { position: "bottom-right" });
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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-900">Editar producto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {loadingCategories ? (
          <div className="text-center py-8 text-gray-500">Cargando categorías...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required className="mt-1 block w-full border rounded-md p-2" />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del producto</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md border" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600">
                    ×
                  </button>
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={handleImageChange} />
              )}
            </div>

            {/* Precio / Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>

            {/* Talla / Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Talle</label>
                <select name="size" value={form.size} onChange={handleChange} required className="mt-1 block w-full border rounded-md p-2">
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select name="category" value={form.category} onChange={handleChange} required className="mt-1 block w-full border rounded-md p-2">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descuento */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
              <input type="number" name="discount" value={form.discount} onChange={handleChange} min="0" max="100" className="mt-1 block w-full border rounded-md p-2" />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProductModal;
