import { useEffect, useState } from "react";

export default function Item() {
  const [state, setState] = useState("loading");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (state === "loading") {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/collection`)
        .then((res) => res.json())
        .then((data) => {
          const allItems = data;
          setItems(allItems);
          setFilteredItems(allItems.slice(0, 20));

          // Auto-generate categories from API data
          const uniqueCategories = [
            ...new Set(
              allItems
                .map((item) => item.category)
                .filter(Boolean)
                .map((cat) => cat.toLowerCase())
            ),
          ];

          const categoryData = uniqueCategories.map((cat) => {
            const firstItem = allItems.find((item) => item.category?.toLowerCase() === cat);
            return {
              id: cat,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              icon: getCategoryIcon(cat),
              image: firstItem?.images?.[0],
              count: allItems.filter(
                (item) => item.category?.toLowerCase() === cat
              ).length,
            };
          });

          setCategories(categoryData);
          setState("success");
        })
        .catch((err) => {
          console.error(err);
          setState("error");
        });
    }
  }, [state]);

  const getCategoryIcon = (category) => {
    const categoryMap = {
      fastfood: "🍔",
      familymeals: "🍱",
      dessert: "🍰",
      beverages: "🥤",
      snacks: "🍿",
      breakfast: "🍳",
      lunch: "🍝",
      dinner: "🍽️",
      vegetarian: "🥗",
      nonvegetarian: "🍗",
    };
    return categoryMap[category.toLowerCase()] || "📦";
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterItems(value.toLowerCase(), categoryFilters);
  };

  const handleCategoryFilter = (categoryId) => {
    const updatedFilters = categoryFilters.includes(categoryId)
      ? categoryFilters.filter((cat) => cat !== categoryId)
      : [...categoryFilters, categoryId];

    setCategoryFilters(updatedFilters);
    filterItems(searchTerm.toLowerCase(), updatedFilters);
  };

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

    setFilteredItems(filtered.slice(0, 20));
  };

  const clearFilters = () => {
    setCategoryFilters([]);
    setSearchTerm("");
    setFilteredItems(items.slice(0, 20));
  };

  const handleItemClick = (item) => {
    window.location.href = `/product/${item._id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Bar with Location and Notifications */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-xs text-gray-500">Deliver to</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-800">Sri Lanka</span>
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="relative">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button>
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 outline-none"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
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
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <p className="text-white text-2xl font-bold mb-1">Flat 15% Off</p>
            <p className="text-white text-sm mb-3">On your First order Today</p>
            <button className="bg-white text-orange-600 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              Shop Now
            </button>
          </div>
          <div className="absolute bottom-0 right-4">
            <div className="bg-yellow-400 rounded-full px-3 py-1 text-xs font-bold text-orange-800">
              Limited Time
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters with Images */}
      {categories.length > 0 && (
        <div className="px-4 py-3 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Categories</h3>
            {categoryFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className="flex-shrink-0 text-center"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-all overflow-hidden ${
                      categoryFilters.includes(category.id)
                        ? "ring-4 ring-orange-500 shadow-lg scale-105"
                        : "shadow-md"
                    }`}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl">
                        {category.icon}
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      categoryFilters.includes(category.id)
                        ? "text-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    {category.label}
                  </p>
                  <p className="text-xs text-gray-400">({category.count})</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} products
          </p>
          {searchTerm && (
            <p className="text-xs text-gray-500">
              Results for "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-3 bg-white mt-2">
        {state === "loading" && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {state === "success" && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <p className="text-gray-500 text-lg font-semibold">No items found</p>
            <p className="text-gray-400 text-sm mt-2 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {state === "success" && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item._id}
                onClick={() => handleItemClick(item)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/200"}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  {item.available === false && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  {item.price && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      20% OFF
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                    {item.description}
                  </p>

                  {item.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-xs">{renderStars(item.rating)}</div>
                      <span className="text-xs text-gray-500">
                        ({item.rating})
                      </span>
                    </div>
                  )}

                  {item.price && (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-orange-600">
                          Rs.{item.price}
                        </span>
                      </div>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}