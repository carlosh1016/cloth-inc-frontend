import { useState } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:4003";

const DeleteProductModal = ({ product, onClose, onProductDeleted }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("cloth-inc-token");

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cloth/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar el producto");

      toast.success("Producto eliminado exitosamente", { position: "bottom-right" });
      onProductDeleted(product.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message, { position: "bottom-right" });
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
