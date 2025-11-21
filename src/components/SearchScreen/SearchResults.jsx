import { useState, useCallback } from "react";
import { 
  GridIcon, 
  ListIcon, 
  SortAscIcon, 
  SortDescIcon, 
  FilterIcon,
  XIcon,
  SearchIcon,
  AlertCircleIcon
} from "lucide-react";
import ProductCard from "../ProductCard";

/**
 * Componente para mostrar los resultados de búsqueda con controles de vista y ordenamiento
 */
const SearchResults = ({ 
  products = [], 
  loading = false, 
  error = null, 
  totalProducts = 0,
  filteredCount = 0,
  searchQuery = "",
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
  onViewModeChange,
  viewMode = "grid",
  onClearSearch,
  className = ""
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: "name", label: "Nombre", order: "asc" },
    { value: "name", label: "Nombre", order: "desc" },
    { value: "price", label: "Precio", order: "asc" },
    { value: "price", label: "Precio", order: "desc" },
    { value: "discount", label: "Descuento", order: "desc" },

  ];

  const handleSortChange = useCallback((option) => {
    onSortChange(option.value, option.order);
    setShowSortMenu(false);
  }, [onSortChange]);

  const getCurrentSortLabel = useCallback(() => {
    const option = sortOptions.find(opt => 
      opt.value === sortBy && opt.order === sortOrder
    );
    return option ? option.label : "Ordenar";
  }, [sortBy, sortOrder]);

  const getSortIcon = useCallback(() => {
    return sortOrder === "asc" ? 
      <SortAscIcon className="h-4 w-4" /> : 
      <SortDescIcon className="h-4 w-4" />;
  }, [sortOrder]);

  // Estado de carga
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Buscando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar productos</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sin resultados
  if (!loading && products.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? `No se encontraron productos para "${searchQuery}"` : "No hay productos disponibles"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "Intenta con otros términos de búsqueda o ajusta los filtros" : "No hay productos en el catálogo"}
            </p>
            {searchQuery && (
              <button 
                onClick={onClearSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Información de resultados */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-medium text-gray-900">{filteredCount}</span> de{" "}
            <span className="font-medium text-gray-900">{totalProducts}</span> productos
          </div>
          
          {searchQuery && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Búsqueda:</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                "{searchQuery}"
                <button 
                  onClick={onClearSearch}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Controles de vista y ordenamiento */}
        <div className="flex items-center gap-3">
          {/* Selector de vista */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Vista de cuadrícula"
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 transition-colors ${
                viewMode === "list" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Vista de lista"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Selector de ordenamiento */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {getSortIcon()}
              <span className="text-sm">{getCurrentSortLabel()}</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {sortOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSortChange(option)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        option.value === sortBy && option.order === sortOrder
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option.order === "asc" ? 
                        <SortAscIcon className="h-4 w-4" /> : 
                        <SortDescIcon className="h-4 w-4" />
                      }
                      {option.label} {option.order === "desc" ? "(Z-A)" : "(A-Z)"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className={
        viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Paginación (placeholder para futuras implementaciones) */}
      {products.length > 0 && (
        <div className="flex justify-center pt-8">
          <div className="text-sm text-gray-500">
            Mostrando todos los resultados
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
