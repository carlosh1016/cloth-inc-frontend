// src/screens/ProductScreen.jsx

import { useState } from 'react';
import { ShoppingCart, User, Trash2 } from 'lucide-react';

import Header from '../components/Header';
import ImageGallery from '../components/ProductScreen/ImageGallery';
import ProductInfo from '../components/ProductScreen/ProductInfo';
import ProductDescription from '../components/ProductScreen/ProductDescription';
import productData from '../data/product.json';



export default function Product() {
  return (
    <div className="font-sans min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto my-8 px-4">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <main className="grid grid-cols-1 md:grid-cols-2">
            
            {/* 2. Usamos los componentes y les pasamos los datos como props */}
            <ImageGallery images={productData.images} />
            <ProductInfo 
              name={productData.name} 
              price={productData.price} 
              sizes={productData.sizes} 
            />
          </main>
          
          <ProductDescription 
            description={productData.description}
            details={productData.details}
            specs={productData.specs}
          />

        </div>
      </div>
    </div>
  );
}