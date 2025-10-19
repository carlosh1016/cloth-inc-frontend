// src/components/ProductDescription.jsx
import { Info, Package, Shield, Truck } from 'lucide-react';

export default function ProductDescription({ description, product }) {
  return (
    <footer className="p-4 md:p-8 border-t text-left space-y-8">
      {/* Descripción del producto */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info size={24} />
          Descripción del Producto
        </h3>
        <p className="text-gray-700 leading-relaxed text-lg">
          {description || 'Sin descripción disponible'}
        </p>
      </div>

      {/* Detalles adicionales del producto */}
      <div className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Información del Producto</h4>
          <ul className="space-y-2 text-gray-700">
            {product.category && (
              <li className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{product.category.name}</span>
              </li>
            )}
            {product.size && (
              <li className="flex justify-between">
                <span className="text-gray-600">Talle:</span>
                <span className="font-medium">{product.size}</span>
              </li>
            )}
            {product.price && (
              <li className="flex justify-between">
                <span className="text-gray-600">Precio:</span>
                <span className="font-medium">${product.price.toFixed(2)}</span>
              </li>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Información de la Tienda</h4>
          <ul className="space-y-2 text-gray-700">
            {product.shop?.name && (
              <li className="flex justify-between">
                <span className="text-gray-600">Tienda:</span>
                <span className="font-medium">{product.shop.name}</span>
              </li>
            )}
            {product.shop?.cuit && (
              <li className="flex justify-between">
                <span className="text-gray-600">CUIT:</span>
                <span className="font-medium">{product.shop.cuit}</span>
              </li>
            )}
            {product.shop?.address && (
              <li className="flex justify-between">
                <span className="text-gray-600">Dirección:</span>
                <span className="font-medium text-right">{product.shop.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Beneficios y políticas */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Beneficios de tu Compra
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Truck className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Envío Rápido</h4>
              <p className="text-sm text-gray-600">Recibí tu producto en 3-5 días hábiles</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <Shield className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Compra Segura</h4>
              <p className="text-sm text-gray-600">Protegemos tus datos personales</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <Package className="text-purple-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Devolución Fácil</h4>
              <p className="text-sm text-gray-600">30 días para cambios y devoluciones</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}