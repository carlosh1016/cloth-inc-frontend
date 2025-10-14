const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
  const colors = ['White', 'Black', 'Red', 'Blue', 'Green'];
  const styles = ['Casual', 'Formal', 'Sporty', 'Vintage', 'Streetwear'];
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

  const ColorFilter = () => {
    const colorMap = {
      White: 'bg-white border border-gray-300',
      Black: 'bg-black',
      Red: 'bg-red-500',
      Blue: 'bg-blue-500',
      Green: 'bg-green-500'
    };

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onFilterChange('colors', color)}
              className={`w-8 h-8 rounded-full ${colorMap[color]} ${
                filters.colors.includes(color)
                  ? 'ring-2 ring-blue-600 ring-offset-2'
                  : 'hover:ring-2 hover:ring-gray-300'
              }`}
              title={color}
            />
          ))}
        </div>
      </div>
    );
  };

  const SizeFilter = () => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
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
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      <FilterSection
        title="Categories"
        items={categories}
        filterKey="categories"
      />

      <ColorFilter />

      <FilterSection
        title="Men's Style"
        items={styles}
        filterKey="styles"
      />

      <FilterSection
        title="Brand"
        items={brands}
        filterKey="brands"
      />

      <SizeFilter />
    </div>
  );
};

export default FilterSidebar;
