import { useState, useEffect} from "react";
import Header from "../components/Header";
import ImageCarousel from "../components/HomeScreen/ImageCarousel";
import Section from "../components/HomeScreen/Section";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCloths } from "../redux/clothSlice";
import { shuffle } from "../utils/shuffle";

export default function Home() {
  const dispatch = useDispatch();
  const { items, error, loading } = useSelector((state) => state.cloths);

  useEffect(() => {
    dispatch(fetchCloths());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Cargando productos...</p>
            <p className="text-gray-400 text-sm mt-2">Por favor espera un momento</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="h-12 w-12 text-red-400 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar productos</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ordenar y filtrar usando el estado actualizado
  const clothsNew = [...items]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  const clothsSale = [...items]
    .filter((cloth) => cloth.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);

  const randomItems = shuffle(items);

  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <ImageCarousel products={randomItems} />
      <Section title="Nuevos Productos" products={clothsNew} />
      <Section title="Ofertas" products={clothsSale} />
    </div>
  );
}
