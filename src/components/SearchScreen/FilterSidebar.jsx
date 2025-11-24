import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories, selectCategories, selectCategoriesLoading, selectCategoriesError } from "../../redux/categoriesSlice";

const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  // Tallas estáticas (no requieren endpoint)
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const { token } = useSelector((state) => state.auth);
  const loadingCategories = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  const requestOptions = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    redirect: "follow"
  };

// Cargar categorías al montar el componente
  useEffect(() => {
    if (categories.length === 0 && !loadingCategories) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories, loadingCategories]);


  // 🔹 Traer marcas/shops desde API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:4003/shops", requestOptions);
        if (!res.ok) throw new Error("Error al cargar tiendas");
        const data = await res.json();
        setAvailableBrands(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBrands();
  }, []);

  const handlePriceChange = () => {
    onFilterChange("minPrice", minPrice);
    onFilterChange("maxPrice", maxPrice);
  };

  const handleStockChange = (value) => {
    setStockOnly(value);
    onFilterChange("stockOnly", value);
  };

  const handleDiscountChange = (value) => {
    setDiscountOnly(value);
    onFilterChange("discountOnly", value);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setStockOnly(false);
    setDiscountOnly(false);
    onClearFilters();
  };

  const FilterSection = ({ title, items, filterKey }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const value = item.name || item;
          return (
            <label
              key={value}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
            >
              <input
                type="checkbox"
                checked={filters[filterKey]?.includes(value)}
                onChange={() => onFilterChange(filterKey, value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{value}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const SizeFilter = () => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Tallas</h3>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => onFilterChange("sizes", size)}
            className={`px-4 py-2 border rounded ${
              filters.sizes?.includes(size)
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-black"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
        <button
          onClick={handleClear}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Limpiar todos
        </button>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Precio</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="w-1/2 border px-2 py-1 rounded"
          />
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="w-1/2 border px-2 py-1 rounded"
          />
        </div>
      </div>

      {/* Stock */}
      <div className="mb-6">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => handleStockChange(e.target.checked)}
          />
          Solo productos en stock
        </label>
      </div>

      {/* Descuento */}
      <div className="mb-6">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => handleDiscountChange(e.target.checked)}
          />
          Solo con descuento
        </label>
      </div>

      {/* Categorías dinámicas */}
      <FilterSection
        title="Categorías"
        items={availableCategories}
        filterKey="categories"
      />

      {/* Marcas/tiendas dinámicas */}
      <FilterSection
        title="Marcas"
        items={availableBrands}
        filterKey="brands"
      />

      {/* Tallas dinámicas */}
      <SizeFilter />
    </div>
  );
};

export default FilterSidebar;
