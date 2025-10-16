import { useEffect, useState } from "react";
import Header from "../components/Header";
import EmptyShop from "../components/ShopScreen/EmptyShop";
import ShopDashboard from "../components/ShopScreen/ShopDashboard";

const Shop = () => {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("cloth-inc-token");
  const role = localStorage.getItem("cloth-inc-role");

  useEffect(() => {
    if (!token) {
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }

    //obtener datos del usuario autenticado desde el backend
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener usuario");
        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchUser();
  }, [token]);

  //verificar si el usuario tiene tienda asociada (ownership)
  useEffect(() => {
    const fetchOwnership = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const ownershipRes = await fetch(`http://localhost:8080/ownership/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (ownershipRes.status === 404) {
          setShop(null); // no tiene tienda
        } else if (ownershipRes.ok) {
          const ownershipData = await ownershipRes.json();
          const shopId = ownershipData.shop.id;

          const shopRes = await fetch(`http://localhost:8080/shops/${shopId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!shopRes.ok) throw new Error("Error al obtener tienda");
          const shopData = await shopRes.json();
          setShop(shopData);
        } else {
          throw new Error("Error al obtener ownership");
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && role === "ROLE_SELLER") {
      fetchOwnership();
    }
  }, [user, token, role]);

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando tienda...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (role !== "ROLE_SELLER") {
    return (
      <div className="p-8 text-gray-600">
        <p>Solo los vendedores pueden acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!shop ? (
          <EmptyShop user={user} onShopCreated={setShop} />
        ) : (
          <ShopDashboard shop={shop} />
        )}
      </div>
    </div>
  );
};

export default Shop;
