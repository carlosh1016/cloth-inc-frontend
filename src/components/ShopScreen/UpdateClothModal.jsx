import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { filesToBase64, validateImageFile, imagesToUrls } from "../../utils/imageUtils";
import { updateCloth } from "../../redux/clothSlice";
import { fetchCategories, selectCategories, selectCategoriesLoading, selectCategoriesError } from "../../redux/categoriesSlice";

const API_URL = "http://localhost:4003";

const UpdateClothModal = ({ cloth, onClose, onClothUpdated }) => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const categories = useSelector(selectCategories) || [];
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

  // Prellenar el formulario con los datos del cloth
  useEffect(() => {
    if (cloth) {
      // Manejar categoría: usar category.id si existe, sino categoryId como fallback
      const categoryId = cloth.category?.id ?? cloth.categoryId ?? "";
      
      setForm({
        name: cloth.name || "",
        description: cloth.description || "",
        price: cloth.price || "",
        size: cloth.size || "M",
        category: categoryId,
        discount: cloth.discount || "0",
      });

      // Imágenes: manejar tanto images (objetos) como imagesBase64 (strings)
      let imageUrls = [];
      let base64Images = [];
      
      if (cloth.images && Array.isArray(cloth.images) && cloth.images.length > 0) {
        // Formato: [{id, imageBase64}]
        imageUrls = imagesToUrls(cloth.images);
        base64Images = cloth.images.map(img => {
          if (img.imageBase64 && img.imageBase64.startsWith('data:image/')) {
            return img.imageBase64;
          }
          return `data:image/jpeg;base64,${img.imageBase64}`;
        });
      } else if (cloth.imagesBase64 && Array.isArray(cloth.imagesBase64) && cloth.imagesBase64.length > 0) {
        // Formato: [string, string, ...]
        imageUrls = cloth.imagesBase64.map(imgStr => {
          if (imgStr.startsWith('data:image/')) {
            return imgStr;
          }
          return `data:image/jpeg;base64,${imgStr}`;
        });
        base64Images = imageUrls;
      } else if (cloth.imageBase64) {
        // Formato antiguo: string único
        const imageUrl = cloth.imageBase64.startsWith('data:image/') 
          ? cloth.imageBase64 
          : `data:image/jpeg;base64,${cloth.imageBase64}`;
        imageUrls = [imageUrl];
        base64Images = [imageUrl];
      }
      
      setImagePreviews(imageUrls);
      setImageBase64Array(base64Images);

      // Stock por talles
      if (Array.isArray(cloth.stock)) {
        setStockBySizes(cloth.stock);
      } else {
        setStockBySizes(sizes.map(() => 0));
      }
    }
  }, [cloth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleStockChange = (index, value) => {
    const newStock = [...stockBySizes];
    newStock[index] = parseInt(value) || 0;
    setStockBySizes(newStock);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        toast.error(validation.error, { position: "bottom-right" });
        return;
      }
    }

    try {
      const base64Images = await filesToBase64(files);
      setImagePreviews(prev => [...prev, ...base64Images]);
      setImageBase64Array(prev => [...prev, ...base64Images]);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      toast.error("Error al cargar las imágenes", { position: "bottom-right" });
    }
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageBase64Array(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) throw new Error("No estás autenticado.");
      if (!form.category) throw new Error("Debes seleccionar una categoría");
      if (parseFloat(form.price) <= 0) throw new Error("El precio debe ser mayor a 0");
      const totalStock = stockBySizes.reduce((sum, s) => sum + s, 0);
      if (totalStock === 0) throw new Error("Debes agregar stock");

      const imagesForBackend = imageBase64Array.map(img => img.split(',')[1] || img);
      const validStock = stockBySizes.map(s => parseInt(s) || 0);

      const updatedClothData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        size: form.size,
        category: parseInt(form.category),
        discount: parseFloat(form.discount),
        stock: validStock,
        images: imagesForBackend,
      };

      const updatedCloth = await dispatch(
        updateCloth({ id: cloth.id, cloth: updatedClothData, token })
      ).unwrap();

      toast.success("¡Cloth actualizado exitosamente!", { position: "bottom-right" });
      onClothUpdated(updatedCloth);
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl px-6 pt-0 pb-0 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b -mx-6 px-6 rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">Editar Cloth</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" type="button">×</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {loadingCategories ? (
          <div className="text-center py-8 text-gray-500">Cargando categorías...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del cloth *</label>
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

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del cloth</label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md border border-gray-300"/>
                      <button type="button" onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar imagen">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
                <input type="file" id="image-upload-edit" accept="image/*" multiple onChange={handleImageChange} className="hidden"/>
                <label htmlFor="image-upload-edit" className="cursor-pointer flex flex-col items-center">
                  <span className="text-sm text-gray-600">
                    {imagePreviews.length > 0 ? "Agregar más imágenes" : "Subir imágenes"}
                  </span>
                </label>
              </div>
            </div>

            {/* Precio y Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio ($) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                <select name="category" value={form.category} onChange={handleChange} required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Selecciona una categoría</option>
                  {Array.isArray(categories) && categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock por talle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Stock por Talle *</label>
              <div className="grid grid-cols-2 gap-5">
                {sizes.map((size, index) => (
                  <div key={size} className="flex items-center gap-3 bg-gray-50 p-5 rounded-md border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 min-w-[40px]">{size}</label>
                    <input type="number" value={stockBySizes[index]} onChange={(e) => handleStockChange(index, e.target.value)}
                      min="0"
                      className="flex-1 border border-gray-300 rounded-md p-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"/>
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
              <input type="number" name="discount" value={form.discount} onChange={handleChange} required min="0" max="100" step="0.01"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white -mx-6 px-6 rounded-b-lg">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
