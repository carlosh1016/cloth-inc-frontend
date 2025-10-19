import { useEffect, useState } from "react";
import CreateClothModal from "./CreateClothModal";
import UpdateClothModal from "./UpdateClothModal";
import DeleteClothModal from "./DeleteClothModal";

const API_URL = "http://localhost:4003";

const ShopDashboard = ({ shop }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para los modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const token = localStorage.getItem("cloth-inc-token");

  // Obtener los productos de esta tienda
  useEffect(() => {
    fetchProducts();
  }, [shop.id, token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/cloth/shop/${shop.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Si no hay productos (204), no es un error
      if (res.status === 204) {
        setProducts([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Error al cargar productos");
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para los modales
  const handleProductCreated = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  };

  const handleProductDeleted = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  // Abrir modal de edición
  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  // Abrir modal de eliminación
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Cerrar modales y limpiar producto seleccionado
  const closeModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar con info de la tienda */}
      <aside className="lg:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h2>
        <p className="text-gray-600 text-sm mb-1">Dirección: {shop.address}</p>
        <p className="text-gray-600 text-sm mb-4">CUIT: {shop.cuit}</p>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => setShowCreateModal(true)}
        >
          Añadir producto
        </button>

        {/* Estadísticas */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total productos:</span>
              <span className="font-semibold text-gray-900">{products.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">En stock:</span>
              <span className="font-semibold text-gray-900">
                {products.filter(p => p.stock > 0).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Agotados:</span>
              <span className="font-semibold text-gray-900">
                {products.filter(p => p.stock === 0).length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Sección principal con productos */}
      <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Productos de la tienda
          </h3>
          {!loading && products.length > 0 && (
            <span className="text-sm text-gray-600">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </span>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando tu primer producto
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Añadir producto
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Imagen del producto */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={
                    product.image
                      ? product.image.startsWith('data:')
                        ? product.image
                        : `data:image/jpeg;base64,${product.image}`
                      : "/fotoProductosEjemplo/Sintitulo.png"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/fotoProductosEjemplo/Sintitulo.png";
                  }}
                />
                {/* Badge de stock */}
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Agotado
                  </span>
                )}
                {product.stock > 0 && product.stock < 10 && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Poco stock
                  </span>
                )}
                {/* Badge de descuento */}
                {product.discount > 0 && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Info del producto */}
              <div className="p-4">
                <h4 className="text-gray-900 font-medium text-lg mb-1 line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Talle:</span>
                    <span className="font-semibold text-gray-900">{product.size}</span>
                  </div>
                  {product.category && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Categoría:</span>
                      <span className="text-gray-900">{product.category.name}</span>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    onClick={() => openUpdateModal(product)}
                  >
                    Editar
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    onClick={() => openDeleteModal(product)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modales */}
      {showCreateModal && (
        <CreateClothModal
          onClose={closeModals}
          onProductCreated={handleProductCreated}
          shopId={shop.id}
        />
      )}

      {showUpdateModal && selectedProduct && (
        <UpdateClothModal
          product={selectedProduct}
          onClose={closeModals}
          onProductUpdated={handleProductUpdated}
        />
      )}

      {showDeleteModal && selectedProduct && (
        <DeleteClothModal
          product={selectedProduct}
          onClose={closeModals}
          onProductDeleted={handleProductDeleted}
        />
      )}
    </div>
  );
};

export default ShopDashboard;
