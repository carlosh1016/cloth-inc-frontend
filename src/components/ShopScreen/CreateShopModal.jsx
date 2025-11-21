import { useState } from "react";

const CreateShopModal = ({ onClose, onShopCreated }) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    cuit: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("cloth-inc-token");
  const userId = localStorage.getItem("cloth-inc-user-id");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      // Crear la tienda
      const shopRes = await fetch("http://localhost:4003/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!shopRes.ok) {
        const errorData = await shopRes.text();
        throw new Error(errorData || "Error al crear tienda");
      }
      
      const newShop = await shopRes.json();

      // Crear la relación ownership
      const ownershipRes = await fetch("http://localhost:4003/api/ownerships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: { id: parseInt(userId) },
          shop: { id: newShop.id },
        }),
      });

      if (!ownershipRes.ok) {
        const errorData = await ownershipRes.text();
        throw new Error(errorData || "Error al asignar ownership");
      }

      // Actualizar el shop_id en localStorage
      localStorage.setItem("cloth-inc-shop-id", newShop.id);

      // Notificar al componente padre
      onShopCreated(newShop);
      onClose();
    } catch (err) {
      console.error("Error creando tienda:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear nueva tienda</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Mi Tienda de Ropa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Av. Corrientes 1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CUIT</label>
            <input
              type="text"
              name="cuit"
              value={form.cuit}
              onChange={handleChange}
              required
              pattern="\d{11}"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 20123456789"
              title="El CUIT debe tener 11 dígitos"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
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
              {loading ? "Creando..." : "Crear tienda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShopModal;