import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Item() {
  const [state, setState] = useState("loading");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSellerType, setSelectedSellerType] = useState("all");

  // Search Modal States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  // Seller Type Options with images
  const sellerTypes = [
    {
      id: "all",
      label: "All Items",
      icon: "🛍️",
      image: "/allItem.png",
      gradient: "from-purple-500 to-pink-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-500",
    },
    {
      id: "product",
      label: "Products",
      icon: "📦",
      image: "/product.png",
      gradient: "from-orange-500 to-red-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-500",
    },
    {
      id: "material",
      label: "Materials",
      icon: "🧵",
      image: "/matrieal.png",
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-500",
    },
    {
      id: "tourism",
      label: "Tourism Packages",
      icon: "✈️",
      image: "/toursim.png",
      gradient: "from-green-500 to-teal-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-500",
    },
  ];

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
            const firstItem = allItems.find(
              (item) => item.category?.toLowerCase() === cat
            );
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

          // Load recent searches
          const saved = sessionStorage.getItem("recentSearches");
          if (saved) {
            setRecentSearches(JSON.parse(saved));
          }
        })
        .catch((err) => {
          console.error(err);
          setState("error");
        });
    }
  }, [state]);

  const getCategoryIcon = (category) => {
    const categoryMap = {
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

  // Open search modal
  const openSearchModal = () => {
    setShowSearchModal(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search modal
  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
  };

  // Handle search in modal
  const handleSearchInModal = (value) => {
    setSearchQuery(value);

    if (value.trim().length > 0) {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.description?.toLowerCase().includes(value.toLowerCase()) ||
          item.category?.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (query) => {
    if (query.trim().length > 0) {
      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      sessionStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      saveRecentSearch(searchQuery);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    sessionStorage.removeItem("recentSearches");
  };

  const handleCategoryFilter = (categoryId) => {
    const updatedFilters = categoryFilters.includes(categoryId)
      ? categoryFilters.filter((cat) => cat !== categoryId)
      : [...categoryFilters, categoryId];

    setCategoryFilters(updatedFilters);
    filterItems(updatedFilters, selectedSellerType);
  };

  const handleSellerTypeFilter = (sellerTypeId) => {
    setSelectedSellerType(sellerTypeId);
    filterItems(categoryFilters, sellerTypeId);
  };

  const filterItems = (selectedCategories, sellerType) => {
    let filtered = items;

    // Filter by seller type
    if (sellerType !== "all") {
      filtered = filtered.filter(
        (item) => item.sellerType?.toLowerCase() === sellerType
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category?.toLowerCase())
      );
    }

    setFilteredItems(filtered.slice(0, 20));
  };

  const clearFilters = () => {
    setCategoryFilters([]);
    setSelectedSellerType("all");
    setFilteredItems(items.slice(0, 20));
  };

  const handleItemClick = (item) => {
   
    navigate(`/product/${item._id}`);
  };

  // Get counts for each seller type
  const getSellerTypeCounts = () => {
    return {
      all: items.length,
      product: items.filter(
        (item) => item.sellerType?.toLowerCase() === "product"
      ).length,
      material: items.filter(
        (item) => item.sellerType?.toLowerCase() === "material"
      ).length,
      tourism: items.filter(
        (item) => item.sellerType?.toLowerCase() === "tourism"
      ).length,
    };
  };

  const sellerTypeCounts = state === "success" ? getSellerTypeCounts() : {};

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div
        style={{
          height: "40px",
          width: "100%",
          backgroundColor: "white",
          position: "",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      />
      {/* Top Bar with Location and Notifications */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-30 h-10 rounded-lg flex items-center justify-center">
              <img src="/logo3r.png" className="w-[100px] object-cover" />
            </div>
            <div>{/* Location info removed as per your original code */}</div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Search Bar - Opens Modal */}
        <button onClick={openSearchModal} className="w-full text-left">
          <div className="relative">
            <div className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-100 text-gray-500 flex items-center">
              Search products...
            </div>
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
            </div>
          </div>
        </button>
      </div>

      {/* Full-Screen Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Search Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={closeSearchModal}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-white text-lg font-bold flex-1">
                Search Products
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, materials, tours..."
                value={searchQuery}
                onChange={(e) => handleSearchInModal(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                autoFocus
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-500 outline-none shadow-lg"
              />
              <svg
                className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
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
              {searchQuery && (
                <button
                  onClick={() => handleSearchInModal("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="bg-white p-4 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-orange-600 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchInModal(search)}
                      className="flex items-center gap-3 w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            {!searchQuery && (
              <div className="bg-white p-4 mb-2">
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Popular Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleSearchInModal(category.label);
                        closeSearchModal();
                      }}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3 font-semibold">
                  Found {searchResults.length} results for "{searchQuery}"
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        handleItemClick(item);
                        saveRecentSearch(searchQuery);
                      }}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={
                            item.images?.[0] ||
                            "https://via.placeholder.com/200"
                          }
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
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
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
                            <div className="flex text-xs">
                              {renderStars(item.rating)}
                            </div>
                            <span className="text-xs text-gray-500">
                              ({item.rating})
                            </span>
                          </div>
                        )}

                        {item.price && (
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-orange-600">
                              Rs.{item.price}
                            </span>
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
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
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
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  No results found
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  We couldn't find any products matching "{searchQuery}"
                </p>
                <button
                  onClick={() => handleSearchInModal("")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seller Type Filter with Images */}
      <div className="px-4 py-4 bg-white mt-3">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Shop By Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {sellerTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSellerTypeFilter(type.id)}
              className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
                selectedSellerType === type.id
                  ? `ring-4 ${type.borderColor} scale-105`
                  : "hover:scale-105"
              }`}
            >
              <div className="relative h-32">
                <img
                  src={type.image}
                  alt={type.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
                <div
                  className={`hidden absolute inset-0 bg-gradient-to-br ${type.gradient} items-center justify-center`}
                >
                  <span className="text-5xl">{type.icon}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm mb-1">
                    {type.label}
                  </p>
                </div>
              </div>
              {selectedSellerType === type.id && (
                <div className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Categories</h3>
            {(categoryFilters.length > 0 || selectedSellerType !== "all") && (
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
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-semibold">
              Showing {filteredItems.length} of {items.length} products
            </p>
            {selectedSellerType !== "all" && (
              <p className="text-xs text-gray-500 mt-1">
                Filtered by:{" "}
                <span className="font-semibold">
                  {sellerTypes.find((t) => t.id === selectedSellerType)?.label}
                </span>
              </p>
            )}
          </div>
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
            <p className="text-gray-500 text-lg font-semibold">
              No items found
            </p>
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
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
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
                      <div className="flex text-xs">
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({item.rating})
                      </span>
                    </div>
                  )}

                  {item.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-orange-600">
                        Rs.{item.price}
                      </span>
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
