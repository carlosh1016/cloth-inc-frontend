import { useState } from "react";
import CreateShopModal from "./CreateShopModal";

const EmptyShop = ({ user, onShopCreated }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Aún no tienes una tienda
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Crea una tienda para empezar a vender tus productos y gestionar tu catálogo.
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Crear tienda
      </button>

      {showModal && (
        <CreateShopModal
          user={user}
          onClose={() => setShowModal(false)}
          onShopCreated={onShopCreated}
        />
      )}
    </div>
  );
};

export default EmptyShop;
