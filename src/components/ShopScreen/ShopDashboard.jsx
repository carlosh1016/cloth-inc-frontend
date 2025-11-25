import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CreateClothModal from "./CreateClothModal";
import UpdateClothModal from "./UpdateClothModal";
import DeleteClothModal from "./DeleteClothModal";
import { fetchCloths } from "../../redux/clothSlice";
import { getFirstImageUrl } from "../../utils/imageUtils";

const ShopDashboard = ({ shop }) => {
  const dispatch = useDispatch();
  const { items: allCloths, loading } = useSelector((state) => state.cloths);
  const token = useSelector((state) => state.auth.token);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // cargar cloths globales (si no lo hace ya)
  useEffect(() => {
    if (!allCloths || allCloths.length === 0) {
      dispatch(fetchCloths());
    }
  }, [dispatch]);

  // Filtrar prendas de la tienda
  const shopCloths = (allCloths || []).filter((c) => {
    // varios formatos posibles: c.shop (obj), c.shopId, c.shop_id o c.shop === id
    const shopIdFromCloth =
      c?.shop?.id ?? c?.shopId ?? c?.shop_id ?? (typeof c?.shop === "number" ? c.shop : null);
    return shopIdFromCloth === shop.id;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{shop.name}</h2>
        <p className="text-gray-600 text-sm mb-1">Dirección: {shop.address}</p>
        <p className="text-gray-600 text-sm mb-4">CUIT: {shop.cuit}</p>
        <button onClick={() => setShowCreate(true)} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Añadir producto</button>
      </aside>

      <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos de la tienda</h3>
        {loading && <p className="text-gray-500">Cargando productos...</p>}
        {!loading && shopCloths.length === 0 && <p className="text-gray-500">No tienes productos registrados.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopCloths.map((product) => {
            const firstImageUrl = getFirstImageUrl(product);
            return (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <img src={firstImageUrl || "/fotoProductosEjemplo/Sintitulo.png"} alt={product.name} className="w-full h-48 object-cover rounded mb-3" />
              <h4 className="text-gray-900 font-medium">{product.name}</h4>
              <p className="text-gray-600 text-sm mt-1">Precio: ${product.price}</p>
              <p className="text-gray-600 text-sm">Stock: {Array.isArray(product.stock) ? product.stock.reduce((a,b)=>a+(b||0),0) : (product.stock ?? 0)}</p>

              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(product)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => setDeleting(product)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
            );
          })}
        </div>
      </main>

      {showCreate && <CreateClothModal shopId={shop.id} onClose={() => setShowCreate(false)} onClothCreated={(c)=>{ setShowCreate(false); dispatch(fetchCloths()); }} />}
      {editing && <UpdateClothModal cloth={editing} onClose={() => setEditing(null)} onClothUpdated={()=>{ setEditing(null); dispatch(fetchCloths()); }} />}
      {deleting && <DeleteClothModal product={deleting} onClose={() => setDeleting(null)} onProductDeleted={()=>{ setDeleting(null); dispatch(fetchCloths()); }} />}
    </div>
  );
};

export default ShopDashboard;
