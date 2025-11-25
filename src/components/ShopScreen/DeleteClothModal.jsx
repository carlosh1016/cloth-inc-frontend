import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { deleteCloth } from "../../redux/clothSlice";

const DeleteProductModal = ({ product, onClose, onProductDeleted }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const handleDelete = async () => {
    if (!token) {
      toast.error("No estás autenticado", { position: "bottom-right" });
      return;
    }

    setLoading(true);
    try {
      const productId = product._id || product.id;
      await dispatch(deleteCloth({ id: productId, token })).unwrap();

      toast.success("Producto eliminado exitosamente", { position: "bottom-right" });
      
      // Llamar al callback antes de cerrar para actualizar la lista
      if (onProductDeleted && typeof onProductDeleted === 'function') {
        onProductDeleted(productId);
      }
      
      onClose();
    } catch (err) {
      console.error(err);
      const errorMessage = err?.message || err || "Error al eliminar el producto";
      toast.error(errorMessage, { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Eliminar producto</h2>
        <p className="text-gray-700 mb-6">
          ¿Seguro que deseas eliminar <span className="font-semibold">{product.name}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
