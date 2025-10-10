import { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FiEdit, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CollectionPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state;

  useEffect(() => {
    if (!itemsLoaded && shopId) {
      const token = localStorage.getItem("token");
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/collection/getAll/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setItems(res.data);
          setFilteredItems(res.data);
          setItemsLoaded(true);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load items");
        });
    }
  }, [itemsLoaded, shopId]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      const query = searchQuery.toLowerCase().trim();
      const filtered = items.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.price?.toString().includes(query) ||
        item.itemId?.toString().includes(query)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  const handleDelete = (itemId) => {
    const token = localStorage.getItem("token");

    toast(
      (t) => (
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiTrash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <span className="text-gray-800 font-bold text-sm block">
                Delete Item?
              </span>
              <span className="text-gray-600 text-xs">
                This action cannot be undone
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors text-sm active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                axios
                  .delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/collection/delete/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  .then(() => {
                    setItems((prev) => prev.filter((item) => item._id !== itemId));
                    setItemsLoaded(false);
                    toast.success("Item deleted successfully!");
                  })
                  .catch((err) => {
                    console.error(err);
                    toast.error("Failed to delete the item.");
                  });
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 text-sm flex items-center gap-2"
            >
              <FiTrash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  pb-20">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white">
                Collection
              </h1>
              <p className="text-orange-100 text-xs mt-0.5">
                Manage your inventory
              </p>
            </div>
            <div className="w-9"></div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items by name, category, price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white rounded-xl border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent text-gray-800 placeholder-gray-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">
                {isSearching ? "Search Results" : "Total Items"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-white font-bold text-xl">{filteredItems.length}</span>
              {isSearching && items.length > 0 && (
                <span className="text-orange-200 text-xs block">
                  of {items.length} total
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {!itemsLoaded ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#F85606] font-semibold text-lg">Loading items...</p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Add Item Button */}
          <Link
            to="/shopC/shop/collection/add"
            state={shopId}
            className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-2xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2 hover:shadow-xl"
          >
            <AiOutlinePlusCircle size={22} />
            Add New Item
          </Link>

          {/* Search Results Info */}
          {isSearching && (
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiSearch className="w-4 h-4 text-[#F85606]" />
                  <span className="text-sm font-medium text-gray-700">
                    Searching for: "{searchQuery}"
                  </span>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-xs bg-orange-100 text-[#F85606] px-3 py-1 rounded-lg font-bold hover:bg-orange-200 transition-colors flex items-center gap-1"
                >
                  <FiX size={12} />
                  Clear
                </button>
              </div>
              {filteredItems.length === 0 && (
                <p className="text-gray-500 text-xs mt-2">
                  No items found matching your search
                </p>
              )}
            </div>
          )}

          {/* Items List */}
          {filteredItems.length === 0 && !isSearching ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Yet</h3>
              <p className="text-gray-500 text-sm mb-4">Add your first item to start selling</p>
              <Link
                to="/shopC/shop/collection/add"
                state={shopId}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
              >
                <AiOutlinePlusCircle size={20} />
                Add Your First Item
              </Link>
            </div>
          ) : filteredItems.length === 0 && isSearching ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Found</h3>
              <p className="text-gray-500 text-sm mb-4">
                No items found for "{searchQuery}"
              </p>
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
              >
                <FiX size={18} />
                Clear Search
              </button>
            </div>
          ) : (
            filteredItems.map((product) => (
              <div
                key={product.itemId}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Product Image and Info */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                  <div className="flex gap-3 mb-3">
                    <div className="relative">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-24 w-24 object-cover rounded-xl border-2 border-orange-200"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/96x96/f97316/white?text=No+Image";
                        }}
                      />
                      <div className="absolute -top-2 -right-2 bg-[#F85606] text-white rounded-full px-2 py-0.5 text-xs font-bold shadow-md">
                        #{product.itemId}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#F85606] text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-bold">Rs. {product.price}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          product.available 
                            ? "bg-green-100 text-green-700 border border-green-200" 
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                          {product.available ? "✓ In Stock" : "✗ Out of Stock"}
                        </span>
                      </div>
                      <span className="inline-block bg-orange-100 text-[#F85606] px-2 py-1 rounded-lg text-xs font-bold border border-orange-200">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate("/shopC/shop/collection/update", { state: product })}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <FiEdit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <FiTrash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Quick Actions */}
          {items.length > 5 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
              <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <FiSearch className="w-4 h-4 text-purple-600" />
                Quick Search Tips
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-center gap-1">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Search by name</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Filter by category</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Find by price</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Search description</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Toast Position */}
      <style>{`
        .Toastify__toast-container,
        .go2072408551 {
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }
        
        .Toastify__toast,
        .go685806154 {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          padding: 16px 20px !important;
          font-size: 14px !important;
        }

        /* Success Toast */
        .go685806154[data-type="success"] {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: white !important;
        }

        /* Error Toast */
        .go685806154[data-type="error"] {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: white !important;
        }

        /* Loading Toast */
        .go685806154[data-type="loading"] {
          background: linear-gradient(135deg, #F85606 0%, #FF7420 100%) !important;
          color: white !important;
        }

        /* Custom Toast (for delete confirmation) */
        .go685806154[data-type="custom"] {
          background: white !important;
          color: #1f2937 !important;
          border: 2px solid #fed7aa !important;
        }
      `}</style>
    </div>
  );
}