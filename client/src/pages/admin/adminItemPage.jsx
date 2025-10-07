import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MdFastfood, MdCategory, MdDescription, MdInventory, MdExpandMore } from "react-icons/md";

export default function AdminItemPage() {
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
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
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Items</span>
            </div>
            <span className="text-white font-bold text-xl">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdFastfood className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Yet</h3>
            <p className="text-gray-500 text-sm">Shop items will appear here</p>
          </div>
        ) : (
          items.map((product) => (
            <div key={product.itemId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Item Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || "/default-food.jpg"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-orange-200 shadow-sm"
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
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white space-y-2">
                    {!product.approve && (
                      <button
                        onClick={() => handleApprove(product._id, product.name)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle className="text-xl" />
                        Approve Item
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate("/admin/item/edit", { state: product })}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                      >
                        <FiEdit className="text-lg" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
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
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}