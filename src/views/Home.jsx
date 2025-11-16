import { useState, useEffect } from "react";
import Header from "../components/Header";
import ImageCarousel from "../components/HomeScreen/ImageCarousel";
import Section from "../components/HomeScreen/Section";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [cloths, setCloths] = useState([]);

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch("http://localhost:4003/cloth", requestOptions)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Prenda no encontrada", { position: "bottom-right" });
          } else {
            toast.error(`Error del servidor: ${response.status}`, {
              position: "bottom-right",
            });
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCloths(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Ordenar y filtrar usando el estado actualizado
  const clothsNew = [...cloths]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  const clothsSale = [...cloths]
    .filter((cloth) => cloth.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <ImageCarousel products={cloths} />
      <Section title="Nuevos Productos" products={clothsNew} />
      <Section title="Ofertas" products={clothsSale} />
    </div>
  );
}
