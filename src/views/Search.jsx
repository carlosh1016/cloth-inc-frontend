import { useEffect, useState } from "react";
import Header from "../components/Header"; // Asegúrate de tener el componente Header
import FilterSidebar from "../components/SearchScreen/FilterSidebar";
import ProductGrid from "../components/SearchScreen/ProductGrid";

const API_URL = "http://localhost:8080/api/cloths";

const Search = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    minPrice: "",
    maxPrice: "",
    stockOnly: false,
    discountOnly: false,
    searchQuery: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Traer productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al obtener productos");
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔹 Aplicar filtros locales
  useEffect(() => {
    let filtered = [...products];

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.includes(p.category?.name)
      );
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter(p =>
        filters.brands.includes(p.shop?.name)
      );
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes?.some(s => filters.sizes.includes(s.name) && s.stock > 0)
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    if (filters.stockOnly) {
      filtered = filtered.filter(p => p.sizes?.some(s => s.stock > 0));
    }

    if (filters.discountOnly) {
      filtered = filtered.filter(p => p.discount > 0);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [filters, products]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const current = prev[key];

      if (Array.isArray(current)) {
        const newValue = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [key]: newValue };
      } else {
        return { ...prev, [key]: value };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      sizes: [],
      minPrice: "",
      maxPrice: "",
      stockOnly: false,
      discountOnly: false,
      searchQuery: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con barra de búsqueda */}
      <Header 
        searchQuery={filters.searchQuery}
        onSearchChange={(value) => handleFilterChange('searchQuery', value)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Grid de productos */}
          <main className="flex-1">
            <div className="mb-4 text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                Error: {error}
              </div>
            )}
            <ProductGrid products={filteredProducts} loading={loading} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Search;
