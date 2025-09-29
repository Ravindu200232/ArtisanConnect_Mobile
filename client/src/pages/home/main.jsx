import { useEffect, useState } from "react";

export default function Main() {
  const [state, setState] = useState("loading");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (state === "loading") {
      // Fetch collections
      fetch(`http://localhost:3000/api/v1/collection`)
        .then((res) => res.json())
        .then((data) => {
          setItems(data);
          setFilteredItems(data.slice(0, 20)); // Show only first 20 items

          // Auto-generate categories from items with first image
          const uniqueCategories = [
            ...new Set(data.map((item) => item.category).filter(Boolean)),
          ];
          const categoryData = uniqueCategories.map((cat) => {
            // Find first item in this category to get image
            const firstItem = data.find((item) => item.category === cat);
            return {
              id: cat.toLowerCase(),
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              icon: getCategoryIcon(cat),
              image: firstItem?.images?.[0], // Use first item's image for category
            };
          });
          setCategories(categoryData);

          setState("success");
        })
        .catch((err) => {
          console.error(err);
          setState("error");
        });

      // Fetch shops for featured section
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`http://localhost:3000/api/v1/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setShops(data);
          })
          .catch((err) => {
            console.error("Error fetching shops:", err);
          });
      }
    }
  }, [state]);

  // Function to get appropriate emoji for each category
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

  // Function to render star ratings
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
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterItems(value, categoryFilters);
  };

  const handleFilterChange = (category) => {
    const updatedFilters = categoryFilters.includes(category)
      ? categoryFilters.filter((cat) => cat !== category)
      : [...categoryFilters, category];

    setCategoryFilters(updatedFilters);
    filterItems(searchTerm, updatedFilters);
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

    setFilteredItems(filtered.slice(0, 20)); // Always show max 20 items
  };

  const handleItemClick = (item) => {
    window.location.href = `/product/${item._id}`;
  };

  const handleShopClick = (shop) => {
    window.location.href = `/shop/${shop._id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DBF3C9] to-white pb-20">
      {/* Header with Search */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#32CD32] to-[#93DC5C] px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <button className="text-white">
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

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search Artisan Connect"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none shadow-sm"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 mt-3 text-white">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm font-medium">Deliver to Sri Lanka</span>
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Category Horizontal Scroll with Images */}
      {categories.length > 0 && (
        <div className="px-4 py-4 overflow-x-auto scrollbar-hide bg-white">
          <div className="flex gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange(cat.id)}
                className="flex-shrink-0 text-center"
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-all overflow-hidden ${
                    categoryFilters.includes(cat.id)
                      ? "ring-4 ring-[#32CD32] shadow-lg scale-105"
                      : "shadow-md"
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#32CD32] to-[#93DC5C] flex items-center justify-center text-white text-2xl">
                      {cat.icon}
                    </div>
                  )}
                </div>
                <p
                  className={`text-xs font-medium ${
                    categoryFilters.includes(cat.id)
                      ? "text-[#32CD32]"
                      : "text-gray-700"
                  }`}
                >
                  {cat.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Shops - Horizontal Scroll */}
      {shops.length > 0 && (
        <div className="px-4 py-4 bg-white">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Featured Shops
          </h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {shops.map((shop) => (
                <button
                  key={shop._id}
                  onClick={() => handleShopClick(shop)}
                  className="flex-shrink-0 w-32 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Portrait-style shop image */}
                  <div className="w-32 h-40 relative">
                    <img
                      src={
                        shop.images?.[0] ||
                        "https://via.placeholder.com/128x160"
                      }
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
                      {shop.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {categoryFilters.length > 0
              ? "Filtered Results"
              : "Featured Products"}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredItems.length} items
          </span>
        </div>

        {state === "loading" && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {state === "success" && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-[#B7E892]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <p className="text-gray-500 text-lg">No items found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {state === "success" && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item._id}
                onClick={() => handleItemClick(item)}
                className="bg-white rounded-xl shadow-md overflow-hidden text-left hover:shadow-lg transition-shadow"
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
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                    {item.description}
                  </p>

                  {/* Rating Stars */}
                  {item.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">{renderStars(item.rating)}</div>
                      <span className="text-xs text-gray-500">
                        ({item.rating})
                      </span>
                    </div>
                  )}

                  {item.price && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-[#32CD32]">
                        Rs.{item.price}
                      </span>
                      <button className="bg-[#32CD32] hover:bg-[#2DB82D] text-white p-2 rounded-full transition-colors">
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
