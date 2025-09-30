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
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/collection`)
        .then((res) => res.json())
        .then((data) => {
          setItems(data);
          setFilteredItems(data.slice(0, 20));

          // Auto-generate categories from items with first image
          const uniqueCategories = [
            ...new Set(data.map((item) => item.category).filter(Boolean)),
          ];
          const categoryData = uniqueCategories.map((cat) => {
            const firstItem = data.find((item) => item.category === cat);
            return {
              id: cat.toLowerCase(),
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              icon: getCategoryIcon(cat),
              image: firstItem?.images?.[0],
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
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/owner`, {
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

    setFilteredItems(filtered.slice(0, 20));
  };

  const handleItemClick = (item) => {
    window.location.href = `/product/${item._id}`;
  };

  const handleShopClick = (shop) => {
    window.location.href = `/shop/${shop._id}`;
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
           
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Artisan Connect"
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

      {/* Quick Categories */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          <button className="flex-shrink-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-md font-semibold text-sm">
            Shop Here
          </button>
          <button className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl shadow-md font-semibold text-sm">
            Deals Lock
          </button>
          <button className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-md font-semibold text-sm">
            Beauty
          </button>
          <button className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-md font-semibold text-sm">
            Artisan Works
          </button>
        </div>
      </div>

      {/* Flash Sale Section */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Flash Sale</h3>
          <button className="text-sm text-orange-600 font-semibold flex items-center gap-1">
            Shop More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2">
            {filteredItems.slice(0, 4).map((item) => (
              <button
                key={item._id}
                onClick={() => handleItemClick(item)}
                className="flex-shrink-0 w-36 bg-white rounded-xl border-2 border-orange-200 overflow-hidden shadow-sm"
              >
                <div className="relative">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/144"}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    20% OFF
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-orange-600">
                      Rs.{Math.floor(item.price * 0.8)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      Rs.{item.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Only 2 left</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Grid with Images */}
      {categories.length > 0 && (
        <div className="px-4 py-3 bg-white mt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Categories</h3>
            <button className="text-sm text-[#32CD32] font-semibold">Shop More</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange(cat.id)}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-16 h-16 rounded-xl overflow-hidden mb-1 shadow-md ${
                    categoryFilters.includes(cat.id)
                      ? "ring-2 ring-[#32CD32]"
                      : ""
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#32CD32] to-[#93DC5C] flex items-center justify-center text-2xl">
                      {cat.icon}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 text-center line-clamp-2">
                  {cat.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Shops */}
      {shops.length > 0 && (
        <div className="px-4 py-3 bg-white mt-2">
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            Featured Shops
          </h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {shops.map((shop) => (
                <button
                  key={shop._id}
                  onClick={() => handleShopClick(shop)}
                  className="flex-shrink-0 w-32 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="w-32 h-36 relative">
                    <img
                      src={
                        shop.images?.[0] ||
                        "https://via.placeholder.com/128x144"
                      }
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-800 text-center line-clamp-2">
                      {shop.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Deals Banner */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-800 text-lg font-bold">Top Deals</p>
            <p className="text-gray-700 text-sm">Best price ever</p>
          </div>
          <button className="bg-white text-orange-600 px-4 py-2 rounded-full text-sm font-bold shadow-md">
            Shop Now
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-3 bg-white mt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">
            {categoryFilters.length > 0 ? "Filtered Results" : "All Products"}
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
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                    {item.name}
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
                        <span className="text-base font-bold text-[#32CD32]">
                          Rs.{item.price}
                        </span>
                      </div>
                      <button className="bg-[#32CD32] hover:bg-[#2DB82D] text-white p-2 rounded-lg transition-colors">
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