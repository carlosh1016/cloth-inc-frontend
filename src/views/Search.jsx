import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import FilterSidebar from "../components/SearchScreen/FilterSidebar";
import SearchResults from "../components/SearchScreen/SearchResults";
import { useSearch } from "../hooks/useSearch";
import { fetchProducts } from "../services/searchService";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Obtener query de búsqueda de la URL
  const searchQuery = searchParams.get("q") || "";

  // Inicializar filtros con la query de búsqueda
  const initialFilters = {
    searchQuery: searchQuery
  };

  // Usar el hook personalizado de búsqueda
  const {
    filters,
    filteredProducts,
    isSearching,
    updateFilter,
    clearFilters,
    updateMultipleFilters,
    getActiveFiltersCount,
    totalProducts,
    filteredCount
  } = useSearch(products, initialFilters);

  // 🔹 Traer productos del backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Sincronizar query de búsqueda con la URL
  useEffect(() => {
    if (filters.searchQuery !== searchQuery) {
      updateFilter("searchQuery", searchQuery);
    }
  }, [searchQuery, filters.searchQuery, updateFilter]);

  // Manejar cambios en la búsqueda desde el Header
  const handleSearchChange = useCallback((value) => {
    updateFilter("searchQuery", value);
    // Actualizar URL sin recargar la página
    const newSearchParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newSearchParams.set("q", value.trim());
    } else {
      newSearchParams.delete("q");
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [updateFilter, searchParams, setSearchParams]);

  // Manejar cambios en el ordenamiento
  const handleSortChange = useCallback((sortBy, sortOrder) => {
    updateMultipleFilters({ sortBy, sortOrder });
  }, [updateMultipleFilters]);

  // Manejar cambios en el modo de vista
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // Limpiar búsqueda
  const handleClearSearch = useCallback(() => {
    updateFilter("searchQuery", "");
    setSearchParams({}, { replace: true });
  }, [updateFilter, setSearchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con barra de búsqueda */}
      <Header 
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        showSearchSuggestions={true}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              activeFiltersCount={getActiveFiltersCount()}
              isLoading={isSearching}
            />
          </aside>

          {/* Resultados de búsqueda */}
          <main className="flex-1">
            <SearchResults
              products={filteredProducts}
              loading={loading}
              error={error}
              totalProducts={totalProducts}
              filteredCount={filteredCount}
              searchQuery={filters.searchQuery}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortChange={handleSortChange}
              onViewModeChange={handleViewModeChange}
              viewMode={viewMode}
              onClearSearch={handleClearSearch}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Search;
