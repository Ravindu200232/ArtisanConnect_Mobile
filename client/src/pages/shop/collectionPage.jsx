import { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CollectionPage() {
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
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
        });
    }
  }, [itemsLoaded, shopId]);

  const handleDelete = (itemId) => {
    const token = localStorage.getItem("token");

    toast(
      (t) => (
        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-orange-200">
          <span className="text-gray-800 font-bold text-sm">
            Are you sure you want to delete this item?
          </span>
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
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95 text-sm"
            >
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
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
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Items</span>
            </div>
            <span className="text-white font-bold text-xl">{items.length}</span>
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
            className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-2xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <AiOutlinePlusCircle size={22} />
            Add New Item
          </Link>

          {/* Items List */}
          {items.length === 0 ? (
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md"
              >
                <AiOutlinePlusCircle size={20} />
                Add Your First Item
              </Link>
            </div>
          ) : (
            items.map((product) => (
              <div
                key={product.itemId}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100"
              >
                {/* Product Image and Info */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                  <div className="flex gap-3 mb-3">
                    <div className="relative">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-24 w-24 object-cover rounded-xl border-2 border-orange-200"
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
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <FiEdit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <FiTrash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))
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