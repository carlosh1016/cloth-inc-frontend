import { useState, useEffect } from "react";
import Header from "../components/Header";
import ImageCarousel from "../components/HomeScreen/ImageCarousel";
import Section from "../components/HomeScreen/Section";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [cloths, setCloths] = useState([]);

  useEffect(() => {
    // HARDCODED DATA
    const mockCloths = [
      {
        id: 1,
        name: 'Flowy Summer Dress',
        price: 49.99,
        image: '/fotoProductosEjemplo/Sintitulo.png',
        category: 'Dresses',
        size: ['S', 'M', 'L'],
        brand: 'Style Haven',
        discount: 0
      },
      {
        id: 2,
        name: 'Classic Denim Jeans',
        price: 59.99,
        image: '/fotoProductosEjemplo/Sintitulo2.png',
        category: 'Bottoms',
        size: ['XS', 'S', 'M', 'L', 'XL'],
        brand: 'Urban Threads',
        discount: 20
      },
      {
        id: 3,
        name: 'Cozy Knit Sweater',
        price: 69.99,
        image: '/fotoProductosEjemplo/Sintitulo3.png',
        category: 'Tops',
        size: ['S', 'M', 'L'],
        brand: 'Chic Boutique',
        discount: 10
      },
      {
        id: 4,
        name: 'Stylish Leather Jacket',
        price: 129.99,
        image: '/fotoProductosEjemplo/Sintitulo4.png',
        category: 'Outerwear',
        size: ['S', 'M', 'L'],
        brand: 'Urban Threads',
        discount: 0
      },
      {
        id: 5,
        name: 'Comfortable Cotton T-Shirt',
        price: 29.99,
        image: '/fotoProductosEjemplo/Sintitulo.png',
        category: 'Tops',
        size: ['XS', 'S', 'M', 'L', 'XL'],
        brand: 'Active Gear',
        discount: 15
      },
      {
        id: 6,
        name: 'Versatile Midi Skirt',
        price: 39.99,
        image: '/fotoProductosEjemplo/Sintitulo3.png',
        category: 'Bottoms',
        size: ['XS', 'S', 'M', 'L'],
        brand: 'Style Haven',
        discount: 0
      }
    ];

    setCloths(mockCloths);

    // CODIGO PARA FETCH REAL
    /*
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    fetch("http://localhost:4003/cloth", requestOptions)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Prenda no encontrada", { position: "bottom-right" });
          } else {
            toast.error(`Error del servidor: ${response.status}`, { position: "bottom-right" });
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        
        setCloths(data);
      })
      .catch(err => console.error(err));
    */
  }, []);

  // Ordenar y filtrar usando el estado actualizado
  const clothsNew = [...cloths]
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  const clothsSale = [...cloths]
    .filter(cloth => cloth.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl">
      <ToastContainer />
      <Header />
      <ImageCarousel />
      <Section title="Nuevos Productos" products={clothsNew} />
      <Section title="Ofertas" products={clothsSale} />
    </div>
  );
}
