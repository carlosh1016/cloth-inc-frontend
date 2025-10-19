import { useEffect, useState } from "react";
import Header from "../components/Header";
import EmptyShop from "../components/ShopScreen/EmptyShop";
import ShopDashboard from "../components/ShopScreen/ShopDashboard";

const Shop = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("cloth-inc-token");
  const role = localStorage.getItem("cloth-inc-role");
  const shopId = localStorage.getItem("cloth-inc-shop-id");

  // Verificar autenticación y rol al montar el componente
  useEffect(() => {
    if (!token) {
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }

    if (role !== "ROLE_SELLER") {
      setError("Solo los vendedores pueden acceder a esta página.");
      setLoading(false);
      return;
    }

    // Si no hay shopId o es null, el usuario no tiene tienda
    if (!shopId || shopId === "null") {
      setShop(null);
      setLoading(false);
      return;
    }

    // Obtener datos de la tienda
    const fetchShop = async () => {
      try {
        setLoading(true);
        const shopRes = await fetch(`http://localhost:4003/shops/${shopId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!shopRes.ok) {
          throw new Error("Error al obtener los datos de la tienda");
        }

        const shopData = await shopRes.json();
        setShop(shopData);
      } catch (err) {
        console.error("Error fetching shop:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [token, shopId, role]);

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Cargando tienda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (role !== "ROLE_SELLER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <p className="text-xl">Solo los vendedores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {shop === null ? (
          <EmptyShop onShopCreated={setShop} />
        ) : (
          <ShopDashboard shop={shop} />
        )}
      </div>
    </div>
  );
};

export default Shop;