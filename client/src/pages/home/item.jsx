import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "../../components/productCard";

export default function Item() {
  const [state, setState] = useState("loading");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (state === "loading") {
      axios
        .get(`http://localhost:3000/api/v1/collection`)
        .then((res) => {
          const allItems = res.data;
          setItems(allItems);
          setFilteredItems(allItems.slice(0, 20)); // Show only first 20 items

          // Auto-generate categories from API data
          const uniqueCategories = [
            ...new Set(
              allItems
                .map((item) => item.category)
                .filter(Boolean)
                .map((cat) => cat.toLowerCase())
            ),
          ];

          const categoryData = uniqueCategories.map((cat) => ({
            id: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: getCategoryIcon(cat),
            count: allItems.filter(
              (item) => item.category?.toLowerCase() === cat
            ).length,
          }));

          setCategories(categoryData);
          setState("success");
        })
        .catch((err) => {
          toast.error(err?.response?.data?.error || "An error occurred");
          setState("error");
        });
    }
  }, []);

  // Get appropriate emoji for each category
  const getCategoryIcon = (category) => {
    const categoryMap = {};
    return categoryMap[category];
  };

  // Handle Search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterItems(value, categoryFilters);
  };

  // Handle Category Filter
  const handleCategoryFilter = (categoryId) => {
    const updatedFilters = categoryFilters.includes(categoryId)
      ? categoryFilters.filter((cat) => cat !== categoryId)
      : [...categoryFilters, categoryId];

    setCategoryFilters(updatedFilters);
    filterItems(searchTerm, updatedFilters);
  };

  // Filter Logic
  const filterItems = (searchValue, selectedCategories) => {
    let filtered = items;

    if (searchValue) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchValue)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category?.toLowerCase())
      );
    }

    setFilteredItems(filtered.slice(0, 20)); // Always show max 20 items
  };

  // Clear all filters
  const clearFilters = () => {
    setCategoryFilters([]);
    setSearchTerm("");
    setFilteredItems(items.slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-16">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#32CD32] to-[#93DC5C] px-4 py-4 shadow-md">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            Discover Products
          </h1>
          <p className="text-white/90 text-sm">
            Find amazing items from local shops
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-3 pl-12 rounded-xl bg-white text-gray-800 placeholder-gray-500 outline-none shadow-sm border border-[#93DC5C]"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white text-[#32CD32] px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              />
            </svg>
            Filters{" "}
            {categoryFilters.length > 0 && `(${categoryFilters.length})`}
          </button>

          {(searchTerm || categoryFilters.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-white font-semibold text-sm hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Auto-generated Categories */}
      {categories.length > 0 && (
        <div className="px-4 py-3 bg-white border-b border-[#B7E892]">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    categoryFilters.includes(category.id)
                      ? "bg-[#32CD32] text-white shadow-md"
                      : "bg-[#DBF3C9] text-gray-700"
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  {category.label}
                  <span
                    className={`text-xs ${
                      categoryFilters.includes(category.id)
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}
                  >
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-3 bg-white">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} products
          {searchTerm && ` for "${searchTerm}"`}
          {categoryFilters.length > 0 && ` in ${categoryFilters.join(", ")}`}
        </p>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-4">
        {state === "loading" && (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {state === "success" && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-[#B7E892]">
            <div className="text-[#93DC5C] text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No items found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="bg-[#32CD32] hover:bg-[#2DB82D] text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {state === "success" && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div key={item._id}>
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
