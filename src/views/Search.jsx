import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/SearchScreen/FilterSidebar';
import ProductGrid from '../components/SearchScreen/ProductGrid';
import Header from '../components/Header';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    searchQuery: ''
  });
  const [loading, setLoading] = useState(true);

  // Pre-cargar filtros desde URL
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({
        ...prev,
        categories: [category]
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const fetchProducts = async () => {
    try {
      const mockData = [
        {
          id: 1,
          name: 'Flowy Summer Dress',
          price: 49.99,
          image: '/fotoProductosEjemplo/Sintitulo.png',
          category: 'Dresses',
          size: ['S', 'M', 'L'],
          brand: 'Style Haven'
        },
        {
          id: 2,
          name: 'Classic Denim Jeans',
          price: 59.99,
          image: '/fotoProductosEjemplo/Sintitulo2.png',
          category: 'Bottoms',
          size: ['XS', 'S', 'M', 'L', 'XL'],
          brand: 'Urban Threads'
        },
        {
          id: 3,
          name: 'Cozy Knit Sweater',
          price: 69.99,
          image: '/fotoProductosEjemplo/Sintitulo3.png',
          category: 'Tops',
          size: ['S', 'M', 'L'],
          brand: 'Chic Boutique'
        },
        {
          id: 4,
          name: 'Stylish Leather Jacket',
          price: 129.99,
          image: '/fotoProductosEjemplo/Sintitulo4.png',
          category: 'Outerwear',
          size: ['S', 'M', 'L'],
          brand: 'Urban Threads'
        },
        {
          id: 5,
          name: 'Comfortable Cotton T-Shirt',
          price: 29.99,
          image: '/fotoProductosEjemplo/Sintitulo.png',
          category: 'Tops',
          size: ['XS', 'S', 'M', 'L', 'XL'],
          brand: 'Active Gear'
        },
        {
          id: 6,
          name: 'Versatile Midi Skirt',
          price: 39.99,
          image: '/fotoProductosEjemplo/Sintitulo3.png',
          category: 'Bottoms',
          size: ['XS', 'S', 'M', 'L'],
          brand: 'Style Haven'
        }
      ];
      
      setProducts(mockData);
      setFilteredProducts(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filtro por categoría
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Filtro por marca
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // Filtro por talla
    if (filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        p.size.some(s => filters.sizes.includes(s))
      );
    }

    // Filtro por búsqueda
    if (filters.searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentFilter = prev[filterType];
      
      if (Array.isArray(currentFilter)) {
        // Toggle para arrays (checkboxes)
        const newFilter = currentFilter.includes(value)
          ? currentFilter.filter(item => item !== value)
          : [...currentFilter, value];
        
        return { ...prev, [filterType]: newFilter };
      } else {
        // Para strings (búsqueda)
        return { ...prev, [filterType]: value };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      sizes: [],
      searchQuery: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <ProductGrid products={filteredProducts} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Search;
