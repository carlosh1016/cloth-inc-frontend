import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import EmptyShop from "../components/ShopScreen/EmptyShop";
import ShopDashboard from "../components/ShopScreen/ShopDashboard";
import CreateShopModal from "../components/ShopScreen/CreateShopModal";
import { fetchShopForUser } from "../redux/shopSlice";
import { useState } from "react";

export default function Shop() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const shopState = useSelector((state) => state.shop);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // si está autenticado y es seller, intentamos cargar su shop
    if (auth?.token && auth?.user?.role === "ROLE_SELLER") {
      dispatch(fetchShopForUser());
    }
  }, [auth?.token, auth?.user?.role, dispatch]);

  if (!auth?.token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">No estás autenticado. Por favor inicia sesión.</div>
      </div>
    );
  }

  if (auth?.user?.role !== "ROLE_SELLER") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">Solo los vendedores pueden acceder a esta página.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {shopState.status === "loading" && <div className="p-8 text-gray-500">Cargando tienda...</div>}
        {shopState.status === "failed" && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">Error: {shopState.error?.message ?? "Error al cargar tienda"}</div>}
        {!shopState.shop && shopState.status !== "loading" && (
          <>
            <EmptyShop onOpenCreate={() => setShowCreateModal(true)} />
            {showCreateModal && <CreateShopModal onClose={() => setShowCreateModal(false)} />}
          </>
        )}
        {shopState.shop && <ShopDashboard shop={shopState.shop} />}
      </div>
    </div>
  );
}
