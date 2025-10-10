import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiCheckCircle, FiSearch, FiX } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  MdFastfood, 
  MdCategory, 
  MdDescription, 
  MdInventory, 
  MdExpandMore,
  MdFilterList,
  MdAttachMoney
} from "react-icons/md";

export default function AdminItemPage() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, approved, pending
  const [stockFilter, setStockFilter] = useState("all"); // all, in-stock, out-of-stock
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, price-high, price-low, name
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
          const data = res.data || [];
          setItems(data);
          setFilteredItems(data);
          setItemsLoaded(true);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load items", {
            position: "bottom-center",
            duration: 3000,
          });
        });
    }
  }, [itemsLoaded, shopId]);

  // Filter and search functionality
  useEffect(() => {
    let results = items;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.itemId?.toString().includes(query) ||
        item.price?.toString().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(item => 
        statusFilter === "approved" ? item.approve : !item.approve
      );
    }

    // Apply stock filter
    if (stockFilter !== "all") {
      results = results.filter(item => 
        stockFilter === "in-stock" ? item.available : !item.available
      );
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

    setFilteredItems(results);
  }, [searchQuery, statusFilter, stockFilter, sortBy, items]);

  const handleDelete = (itemId, itemName) => {
    const token = localStorage.getItem("token");

    toast(
      (t) => (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-orange-200">
          <p className="text-gray-800 font-bold mb-2">
            Delete "{itemName}"?
          </p>
          <p className="text-gray-600 text-sm mb-4">
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
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
                    toast.success("Item deleted successfully!", {
                      position: "bottom-center",
                      duration: 3000,
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    toast.error("Failed to delete the item.", {
                      position: "bottom-center",
                      duration: 3000,
                    });
                  });
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "bottom-center",
      }
    );
  };

  const handleApprove = (collectionId, itemName) => {
    const token = localStorage.getItem("token");
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/collection/isApprove/${collectionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success(`"${itemName}" approved successfully!`, {
          position: "bottom-center",
          duration: 3000,
        });
        setItemsLoaded(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to approve the item.", {
          position: "bottom-center",
          duration: 3000,
        });
      });
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getItemStats = () => {
    const total = items.length;
    const approved = items.filter(item => item.approve).length;
    const pending = total - approved;
    const inStock = items.filter(item => item.available).length;
    const outOfStock = total - inStock;
    
    return { total, approved, pending, inStock, outOfStock };
  };

  const itemStats = getItemStats();

  if (!itemsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  ">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Collection Items
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage shop products
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdFastfood className="text-2xl text-white" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search items by name, description, category, price, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white rounded-xl border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent text-gray-800 placeholder-gray-500 font-medium text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              )}
            </div>
          </div>

          {/* Filters and Stats */}
          <div className="space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm">{itemStats.total}</div>
                <div className="text-orange-100 text-xs">Total</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm">{itemStats.approved}</div>
                <div className="text-orange-100 text-xs">Approved</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm">{itemStats.pending}</div>
                <div className="text-orange-100 text-xs">Pending</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-sm">{itemStats.inStock}</div>
                <div className="text-orange-100 text-xs">In Stock</div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
                >
                  <option value="all" className="text-gray-800">All Status</option>
                  <option value="approved" className="text-gray-800">Approved</option>
                  <option value="pending" className="text-gray-800">Pending</option>
                </select>
                <MdFilterList className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
                >
                  <option value="all" className="text-gray-800">All Stock</option>
                  <option value="in-stock" className="text-gray-800">In Stock</option>
                  <option value="out-of-stock" className="text-gray-800">Out of Stock</option>
                </select>
                <MdInventory className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
                >
                  <option value="newest" className="text-gray-800">Newest</option>
                  <option value="oldest" className="text-gray-800">Oldest</option>
                  <option value="price-high" className="text-gray-800">Price: High</option>
                  <option value="price-low" className="text-gray-800">Price: Low</option>
                  <option value="name" className="text-gray-800">Name: A-Z</option>
                </select>
                <MdAttachMoney className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-3">
        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSearch className="w-4 h-4 text-[#F85606]" />
                <span className="text-sm font-medium text-gray-700">
                  Search results for: "{searchQuery}"
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-100 text-[#F85606] px-2 py-1 rounded">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearSearch}
                  className="text-xs bg-orange-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <FiX size={12} />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredItems.length === 0 && !searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdFastfood className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Yet</h3>
            <p className="text-gray-500 text-sm">Shop items will appear here</p>
          </div>
        ) : filteredItems.length === 0 && searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-3xl text-gray-400" />
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
            <div key={product.itemId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100 hover:shadow-lg transition-shadow duration-200">
              {/* Item Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || "/default-food.jpg"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-orange-200 shadow-sm"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80/f97316/white?text=No+Image";
                      }}
                    />
                    {product.approve && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                        <FiCheckCircle className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 text-base line-clamp-2">{product.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-[#F85606] text-white px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold">Rs. {product.price}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        product.available 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {product.available ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      ID: {product.itemId}
                    </div>
                  </div>
                </div>

                {/* Status Row */}
                <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                  <div className="flex items-center gap-1 text-xs">
                    <MdCategory className="text-[#F85606]" />
                    <span className="text-gray-700 font-medium capitalize">{product.category}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <span className={`text-xs font-bold ${
                    product.approve ? "text-green-600" : "text-amber-600"
                  }`}>
                    {product.approve ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedItem === product._id && (
                <div className="border-t border-orange-100">
                  {/* Item Details */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <MdDescription className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Product Details</h4>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border-2 border-blue-200 mb-3">
                      <p className="text-sm text-gray-800 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">Stock Status</p>
                        <p className={`font-bold text-sm ${
                          product.available ? "text-green-600" : "text-red-600"
                        }`}>
                          {product.available ? "Available" : "Out of Stock"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">Approval</p>
                        <p className={`font-bold text-sm ${
                          product.approve ? "text-green-600" : "text-amber-600"
                        }`}>
                          {product.approve ? "Approved" : "Pending"}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border-2 border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Item ID</p>
                      <p className="font-bold text-sm text-gray-800 font-mono">{product.itemId}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white space-y-2">
                    {!product.approve && (
                      <button
                        onClick={() => handleApprove(product._id, product.name)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <FiCheckCircle className="text-xl" />
                        Approve Item
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate("/admin/item/edit", { state: product })}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <FiEdit className="text-lg" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <FiTrash2 className="text-lg" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleItemExpand(product._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-md"
              >
                {expandedItem === product._id ? (
                  <>
                    <MdExpandMore className="text-xl transform rotate-180 transition-transform" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <MdExpandMore className="text-xl transition-transform" />
                    View Details & Actions
                  </>
                )}
              </button>
            </div>
          ))
        )}

        {/* Quick Search Tips */}
        {items.length > 5 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
            <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <FiSearch className="w-4 h-4 text-green-600" />
              Search Tips
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">•</span>
                <span>Search by product name</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">•</span>
                <span>Filter by category</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">•</span>
                <span>Find by price</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">•</span>
                <span>Search description</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}