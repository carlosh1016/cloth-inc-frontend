import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

const ShopDashboard = ({ shop }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("cloth-inc-token");

  // Obtener los productos de esta tienda
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/cloths/shop/${shop.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [shop.id, token]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar con info de la tienda */}
      <aside className="lg:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h2>
        <p className="text-gray-600 text-sm mb-1">Dirección: {shop.address}</p>
        <p className="text-gray-600 text-sm mb-4">CUIT: {shop.cuit}</p>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => alert("Abrir modal para crear producto")}
        >
          Añadir producto
        </button>
      </aside>

      {/* Sección principal con productos */}
      <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos de la tienda</h3>

        {loading && <p className="text-gray-500">Cargando productos...</p>}
        {error && (
          <p className="text-red-500 mb-2">Error: {error}</p>
        )}
        {!loading && products.length === 0 && (
          <p className="text-gray-500">No tienes productos registrados.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <img
                src={product.image || "/public/fotoProductosEjemplo/Sintitulo.png"}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h4 className="text-gray-900 font-medium">{product.name}</h4>
              <p className="text-gray-600 text-sm mt-1">
                Precio: ${product.price}
              </p>
              <p className="text-gray-600 text-sm">
                Stock: {product.stock > 0 ? product.stock : "Agotado"}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  onClick={() => alert(`Editar producto ${product.id}`)}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  onClick={() => alert(`Eliminar producto ${product.id}`)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ShopDashboard;
