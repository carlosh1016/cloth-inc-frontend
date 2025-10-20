import { useState, useEffect, useCallback } from 'react';
import { searchProductsLocally } from '../services/searchService';

/**
 * Hook personalizado para manejar la lógica de búsqueda y filtrado
 * @param {Array} products - Lista de productos a filtrar
 * @param {Object} initialFilters - Filtros iniciales
 * @returns {Object} - Estado y funciones para manejar la búsqueda
 */
export const useSearch = (products = [], initialFilters = {}) => {
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    minPrice: '',
    maxPrice: '',
    stockOnly: false,
    discountOnly: false,
    searchQuery: '',
    sortBy: 'name', // name, price, discount
    sortOrder: 'asc', // asc, desc
    ...initialFilters
  });

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Función para aplicar filtros con debouncing
  const applyFilters = useCallback((productsToFilter, currentFilters) => {
    // Usar la función del servicio para filtrar
    let filtered = searchProductsLocally(productsToFilter, currentFilters);

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (currentFilters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'discount':
          aValue = a.discount || 0;
          bValue = b.discount || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (currentFilters.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, []);

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    setIsSearching(true);
    
    const timeoutId = setTimeout(() => {
      const filtered = applyFilters(products, filters);
      setFilteredProducts(filtered);
      setIsSearching(false);
    }, 300); // Debouncing de 300ms

    return () => clearTimeout(timeoutId);
  }, [filters, products, applyFilters]);

  // Función para actualizar un filtro específico
  const updateFilter = useCallback((key, value) => {
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
  }, []);

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      brands: [],
      sizes: [],
      minPrice: '',
      maxPrice: '',
      stockOnly: false,
      discountOnly: false,
      searchQuery: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  }, []);

  // Función para actualizar múltiples filtros a la vez
  const updateMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función para obtener estadísticas de filtros activos
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.stockOnly) count++;
    if (filters.discountOnly) count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredProducts,
    isSearching,
    updateFilter,
    clearFilters,
    updateMultipleFilters,
    getActiveFiltersCount,
    totalProducts: products.length,
    filteredCount: filteredProducts.length
  };
};
