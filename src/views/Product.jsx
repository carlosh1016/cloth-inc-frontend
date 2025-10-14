// src/views/Product.jsx

import { useState, useEffect } from 'react';

import Header from '../components/Header';
import ImageGallery from '../components/ProductScreen/ImageGallery';
import ProductInfo from '../components/ProductScreen/ProductInfo';
import ProductDescription from '../components/ProductScreen/ProductDescription';
import { useParams } from 'react-router-dom';
// import productData from '../data/product.json';



export default function Product() {
  const { id: productId } = useParams(); 
  const [product, setProduct] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true); 
        setError(null); 
        
        const response = await fetch(`http://localhost:4003/cloth/${productId}`); 
        
        if (!response.ok) {
          throw new Error(`Error al cargar el producto: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Producto recibido del backend:', data);
        setProduct(data); 
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); 
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center">
        <Header />
        <p className="text-xl">Cargando producto... ⏳</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto my-8 px-4 text-red-600">
            <h1 className="text-2xl font-bold">Error 🙁</h1>
            <p>No se pudo cargar el producto: {error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="font-sans min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto my-8 px-4">
            <h1 className="text-2xl font-bold">Producto no encontrado 🔎</h1>
            <p>Parece que el producto solicitado no existe.</p>
        </div>
      </div>
    );
  }


  // Adaptar la estructura del backend a lo que esperan los componentes
  const images = product.image ? [product.image] : [];
  
  return (
    <div className="font-sans min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto my-8 px-4">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <main className="grid grid-cols-1 md:grid-cols-2">
            
            <ImageGallery images={images} />
            <ProductInfo 
              name={product.name} 
              price={product.price} 
              sizes={product.sizes} 
            />
          </main>
          
          <ProductDescription 
            description={product.description}
            details={product.details}
            specs={product.specs}
          />

        </div>
      </div>
    </div>
  );
}