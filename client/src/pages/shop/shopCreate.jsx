import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useNavigation } from "react-router-dom";
import Swal from "sweetalert2";

export default function ShopCreate() {
  const [shop, setShop] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const OwnerName = localStorage.getItem("user")

  const handleUpdateShop = async (id) => {
    navigate("/shopC/shop/edit", { state: id });
  }

  const handleItem = async (id) => {
    navigate("/shopC/shop/collection", { state: id });
  }

  const handleDeleteShop = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`h${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchShop();
        setShop((prevShop) =>
          prevShop.filter((shop) => shop._id !== id)
        );
      } catch (error) {
        console.error("Error status:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to delete the shop.",
        });
      }
    }
  };

  const fetchShop = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShop(response.data);
    } catch (error) {
      console.error("Failed to fetch shop:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleToggleShop = async (id, shouldOpen) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = shouldOpen
        ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/isOpen/${id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/isClose/${id}`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchShop();
    } catch (error) {
      console.error("Error toggling shop status:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update shop status.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading shops...</p>
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
                My Shops
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage your shop portfolio
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Shops</span>
            </div>
            <span className="text-white font-bold text-xl">{shop.length}</span>
          </div>
        </div>
      </div>

      {/* Add Shop Button - Floating */}
      <div className="p-4 pb-3">
        <Link
          to="/shopC/shop/add"
          className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-2xl font-bold transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Shop
        </Link>
      </div>

      {/* Shop Cards Grid */}
      <div className="px-4 space-y-3">
        {shop.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Shops Yet</h3>
            <p className="text-gray-500 text-sm mb-4">Create your first shop to start selling</p>
            <Link
              to="/shopC/shop/add"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Shop
            </Link>
          </div>
        ) : (
          shop.map((shopItem) => (
            <div
              key={shopItem._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100"
            >
              {/* Shop Image */}
              <button 
                onClick={() => handleItem(shopItem._id)}
                className="w-full transition-transform active:scale-95"
              >
                <div className="relative">
                  <img
                    src={shopItem.images?.[0] || "/default-shop.jpg"}
                    alt={shopItem.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      shopItem.isOpen 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-600 text-white"
                    }`}>
                      {shopItem.isOpen ? "🟢 Open" : "⚫ Closed"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      shopItem.verified 
                        ? "bg-blue-500 text-white" 
                        : "bg-amber-500 text-white"
                    }`}>
                      {shopItem.verified ? "✓ Verified" : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h2 className="text-white font-bold text-lg">{shopItem.name}</h2>
                  </div>
                </div>
              </button>
              
              {/* Shop Info */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Owner</span>
                      <p className="text-gray-800 font-medium">{shopItem.ownerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Phone</span>
                      <p className="text-gray-800 font-medium">{shopItem.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 space-y-2">
                
                {/* Edit and Delete Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateShop(shopItem._id)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteShop(shopItem._id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>

                {/* View Items Button */}
                <button
                  onClick={() => handleItem(shopItem._id)}
                  className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  View Collection
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Bottom Toast/Notification Position */}
      <style>{`
        .Toastify__toast-container {
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }
        .Toastify__toast {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* SweetAlert2 Custom Styling for Mobile */
        .swal2-popup {
          border-radius: 20px !important;
          padding: 2rem 1.5rem !important;
        }
        .swal2-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
        }
        .swal2-styled.swal2-confirm {
          background: linear-gradient(to right, #F85606, #FF7420) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 12px 24px !important;
        }
        .swal2-styled.swal2-cancel {
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 12px 24px !important;
        }
      `}</style>
    </div>
  );
}