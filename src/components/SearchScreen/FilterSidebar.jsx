const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
  const brands = ['Style Haven', 'Urban Threads', 'Chic Boutique', 'Active Gear'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const FilterSection = ({ title, items, filterKey, type = 'checkbox' }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type={type}
              checked={filters[filterKey]?.includes(item)}
              onChange={() => onFilterChange(filterKey, item)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const SizeFilter = () => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Tallas</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onFilterChange('sizes', size)}
            className={`px-4 py-2 border rounded ${
              filters.sizes.includes(size)
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:border-black'
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
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Limpiar todos
        </button>
      </div>

      <FilterSection
        title="Categorías"
        items={categories}
        filterKey="categories"
      />

      <FilterSection
        title="Marcas"
        items={brands}
        filterKey="brands"
      />

      <SizeFilter />
    </div>
  );
};

export default FilterSidebar;
