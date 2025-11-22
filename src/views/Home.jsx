import { useState, useEffect} from "react";
import Header from "../components/Header";
import ImageCarousel from "../components/HomeScreen/ImageCarousel";
import Section from "../components/HomeScreen/Section";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../Redux/clothSlice";
import { shuffle } from "../utils/shuffle";

export default function Home() {
  const dispatch = useDispatch();
  const { items, error, loading } = useSelector((state) => state.cloths);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return <div>Cargando productos...</div>;
  }
  if (error) {
    return <p>Error al cargar los productos: {error}</p>;
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
