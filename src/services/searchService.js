/**
 * Servicio para manejar las llamadas a la API relacionadas con búsqueda y filtros
 */

const API_BASE_URL = 'http://localhost:4003';
const token = localStorage.getItem('cloth-inc-token');

const getRequestOptions = () => ({
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  redirect: 'follow'
});

/**
 * Obtiene todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cloth`, getRequestOptions());
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('No se pudieron cargar los productos');
  }
};

/**
 * Obtiene todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/category`, getRequestOptions());
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('No se pudieron cargar las categorías');
  }
};

/**
 * Obtiene todas las tiendas/marcas
 * @returns {Promise<Array>} Lista de tiendas
 */
export const fetchShops = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/shops`, getRequestOptions());
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching shops:', error);
    throw new Error('No se pudieron cargar las tiendas');
  }
};

/**
 * Busca productos localmente (filtrado en el frontend)
 * @param {Array} products - Lista de productos a filtrar
 * @param {Object} searchParams - Parámetros de búsqueda
 * @returns {Array} Lista de productos filtrados
 */
export const searchProductsLocally = (products, searchParams = {}) => {
  let filtered = [...products];

  // Filtro por categorías
  if (searchParams.categories && searchParams.categories.length > 0) {
    filtered = filtered.filter(product =>
      searchParams.categories.includes(product.category?.name)
    );
  }

  // Filtro por marcas/tiendas
  if (searchParams.brands && searchParams.brands.length > 0) {
    filtered = filtered.filter(product =>
      searchParams.brands.includes(product.shop?.name)
    );
  }

  // Filtro por tallas
  if (searchParams.sizes && searchParams.sizes.length > 0) {
    filtered = filtered.filter(product =>
      searchParams.sizes.includes(product.size)
    );
  }

  // Filtro por precio mínimo
  if (searchParams.minPrice) {
    filtered = filtered.filter(product => 
      product.price >= parseFloat(searchParams.minPrice)
    );
  }

  // Filtro por precio máximo
  if (searchParams.maxPrice) {
    filtered = filtered.filter(product => 
      product.price <= parseFloat(searchParams.maxPrice)
    );
  }

  // Filtro por stock
  if (searchParams.stockOnly) {
    filtered = filtered.filter(product => {
      // El stock viene como array [XS, S, M, L, XL, XXL]
      if (Array.isArray(product.stock)) {
        // Calcular el total sumando todos los valores del array
        const totalStock = product.stock.reduce((sum, s) => sum + (s || 0), 0);
        return totalStock > 0;
      }
      // Compatibilidad: si no es array, tratarlo como número
      return (product.stock || 0) > 0;
    });
  }

  // Filtro por descuento
  if (searchParams.discountOnly) {
    filtered = filtered.filter(product => product.discount > 0);
  }

  // Filtro por búsqueda de texto
  if (searchParams.searchQuery) {
    const query = searchParams.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.name?.toLowerCase().includes(query) ||
      product.shop?.name?.toLowerCase().includes(query)
    );
  }

  return filtered;
};

/**
 * Valida los parámetros de búsqueda
 * @param {Object} searchParams - Parámetros a validar
 * @returns {Object} Parámetros validados
 */
export const validateSearchParams = (searchParams) => {
  const validated = { ...searchParams };

  // Validar precios
  if (validated.minPrice && isNaN(parseFloat(validated.minPrice))) {
    delete validated.minPrice;
  }
  if (validated.maxPrice && isNaN(parseFloat(validated.maxPrice))) {
    delete validated.maxPrice;
  }

  // Validar que minPrice no sea mayor que maxPrice
  if (validated.minPrice && validated.maxPrice) {
    const min = parseFloat(validated.minPrice);
    const max = parseFloat(validated.maxPrice);
    if (min > max) {
      delete validated.minPrice;
      delete validated.maxPrice;
    }
  }

  // Limpiar arrays vacíos
  Object.keys(validated).forEach(key => {
    if (Array.isArray(validated[key]) && validated[key].length === 0) {
      delete validated[key];
    }
  });

  // Limpiar strings vacíos
  Object.keys(validated).forEach(key => {
    if (typeof validated[key] === 'string' && validated[key].trim() === '') {
      delete validated[key];
    }
  });

  return validated;
};
