// src/views/Product.jsx

import { useState, useEffect } from 'react';

import Header from '../components/Header';
import ImageGallery from '../components/ProductScreen/ImageGallery';
import ProductInfo from '../components/ProductScreen/ProductInfo';
import ProductDescription from '../components/ProductScreen/ProductDescription';
import { useParams } from 'react-router-dom';
import { imagesToUrls } from '../utils/imageUtils';
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
      <div className="font-sans min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto my-8 px-4">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden p-12">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600">Cargando producto...</p>
            </div>
          </div>
        </div>
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
  // El backend ahora devuelve images: [{id, imageBase64}]
  let images = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    images = imagesToUrls(product.images);
  } else if (product.imageBase64) {
    // Compatibilidad con formato antiguo
    images = [product.imageBase64.startsWith('data:image/') 
      ? product.imageBase64 
      : `data:image/jpeg;base64,${product.imageBase64}`];
  }
  
  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto my-8 px-4">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <main className="grid grid-cols-1 lg:grid-cols-2">
            <ImageGallery images={images} />
            <ProductInfo product={product} />
          </main>
          
          <ProductDescription 
            description={product.description}
            product={product}
          />
        </div>
      </div>
    </div>
  );
}