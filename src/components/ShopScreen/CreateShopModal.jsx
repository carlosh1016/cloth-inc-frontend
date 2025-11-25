import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createShopWithOwnership, fetchShopForUser } from "../../redux/shopSlice";
import { toast } from "react-toastify";

const CreateShopModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const creating = useSelector((state) => state.shop.creating);
  const createError = useSelector((state) => state.shop.createError);

  const [form, setForm] = useState({ name: "", address: "", cuit: "" });

  // Cerrar el modal y recargar la tienda cuando se cree exitosamente
  useEffect(() => {
    if (creating === "succeeded") {
      dispatch(fetchShopForUser());
      onClose();
    }
  }, [creating, dispatch, onClose]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Handler específico para CUIT que solo permite números
  const handleCuitChange = (e) => {
    const value = e.target.value;
    // Filtrar solo dígitos (0-9)
    const filteredValue = value.replace(/\D/g, "");
    setForm((p) => ({ ...p, cuit: filteredValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim() || !form.cuit.trim()) {
      toast.error("Completa todos los campos", { position: "bottom-right" });
      return;
    }
    try {
      const res = await dispatch(createShopWithOwnership({ name: form.name.trim(), address: form.address.trim(), cuit: form.cuit.trim() })).unwrap();
      toast.success("Tienda creada correctamente", { position: "bottom-right" });
      // El cierre del modal se maneja en el useEffect cuando creating === "succeeded"
    } catch (err) {
      console.error("Error creando tienda:", err);
      let errorMessage = "No se pudo crear la tienda";
      
      if (err?.status === 400) {
        errorMessage = err?.message || "Error de validación. Verifica que todos los datos sean correctos.";
        if (typeof err === "object" && err !== null) {
          const errorDetails = err?.data || err?.error || err;
          if (typeof errorDetails === "string") {
            errorMessage = errorDetails;
          } else if (typeof errorDetails === "object") {
            errorMessage = errorDetails?.message || JSON.stringify(errorDetails);
          }
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, { position: "bottom-right" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Crear nueva tienda</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">×</button>
        </div>

        {createError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {(() => {
              if (typeof createError === "string") {
                return createError;
              }
              if (createError?.message) {
                return createError.message;
              }
              if (createError?.status === 400) {
                return "Error de validación. Verifica que todos los datos sean correctos.";
              }
              if (typeof createError === "object") {
                const errorDetails = createError?.data || createError?.error || createError;
                if (typeof errorDetails === "string") {
                  return errorDetails;
                }
                if (errorDetails?.message) {
                  return errorDetails.message;
                }
              }
              return JSON.stringify(createError);
            })()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input name="address" value={form.address} onChange={handleChange} required className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CUIT</label>
            <input name="cuit" value={form.cuit} onChange={handleCuitChange} required className="mt-1 block w-full border rounded p-2" />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" disabled={creating === "loading"} className="px-4 py-2 bg-blue-600 text-white rounded">{creating === "loading" ? "Creando..." : "Crear tienda"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShopModal;
