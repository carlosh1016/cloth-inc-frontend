import { useEffect, useState } from "react";

const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // 🔹 Traer tallas desde API
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/sizes");
        if (!res.ok) throw new Error("Error al cargar tallas");
        const data = await res.json();
        setAvailableSizes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSizes();
  }, []);

  // 🔹 Traer categorías desde API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/categories");
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setAvailableCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Traer marcas/shops desde API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/shops");
        if (!res.ok) throw new Error("Error al cargar tiendas");
        const data = await res.json();
        setAvailableBrands(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBrands();
  }, []);

  // 🔹 Actualizar filtros de talla
  useEffect(() => {
    onFilterChange("sizes", selectedSizes);
  }, [selectedSizes]);

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handlePriceChange = () => {
    onFilterChange("minPrice", minPrice);
    onFilterChange("maxPrice", maxPrice);
  };

  const handleStockChange = () => {
    onFilterChange("stockOnly", stockOnly);
  };

  const handleDiscountChange = () => {
    onFilterChange("discountOnly", discountOnly);
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setStockOnly(false);
    setDiscountOnly(false);
    setSelectedSizes([]);
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
        {availableSizes.map((size) => {
          const value = size.name || size;
          return (
            <button
              key={value}
              onClick={() => handleSizeToggle(value)}
              className={`px-4 py-2 border rounded ${
                selectedSizes.includes(value)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-black"
              }`}
            >
              {value}
            </button>
          );
        })}
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
            onChange={(e) => {
              setStockOnly(e.target.checked);
              handleStockChange();
            }}
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
            onChange={(e) => {
              setDiscountOnly(e.target.checked);
              handleDiscountChange();
            }}
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
