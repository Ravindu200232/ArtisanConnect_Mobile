import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { MdVerified, MdDelete, MdStore, MdPhone, MdLocationOn } from "react-icons/md";
import { FaStore, FaUser, FaInfoCircle } from "react-icons/fa";

export default function AdminPackagePage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedShop, setExpandedShop] = useState(null);
  const navigate = useNavigate();

  const handleItem = async (id) => {
    navigate("/admin/item", { state: id });
  };

  const handleDeleteShop = async (id, shopName) => {
    const result = await Swal.fire({
      title: "Delete Shop?",
      text: `Are you sure you want to delete ${shopName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/delete/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.data.message,
          timer: 1500,
          showConfirmButton: false,
        });

        setShops((prevShops) => prevShops.filter((shop) => shop._id !== id));
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

  const handleVerifyShop = async (id, shopName) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/update/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Verified!",
        text: `${shopName} has been verified`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Update local state
      setShops(prevShops =>
        prevShops.map(shop =>
          shop._id === id ? { ...shop, verified: true } : shop
        )
      );
    } catch (error) {
      console.error("Verification error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to verify the shop.",
      });
    }
  };

  const fetchShop = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShops(response.data);
    } catch (error) {
      console.error("Failed to fetch shop:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load shops",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const toggleShopExpand = (shopId) => {
    setExpandedShop(expandedShop === shopId ? null : shopId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Manage Shops
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Verify and manage restaurant shops
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{shops.length} shops total</span>
        </div>
      </div>

      {/* Shops List */}
      <div className="space-y-4">
        {shops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaStore className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No shops found</p>
            <p className="text-sm text-gray-400 mt-1">Shops will appear here once created</p>
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop._id} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Shop Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <img
                    src={shop.images?.[0] || "/default-shop.jpg"}
                    alt={shop.name}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-[#B7E892]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 truncate">{shop.name}</h3>
                      <div className="flex items-center gap-1">
                        {shop.verified && (
                          <MdVerified className="text-blue-500 text-lg" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          shop.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {shop.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <FaUser className="text-gray-400" />
                      <span>{shop.ownerName}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MdLocationOn className="text-gray-400" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedShop === shop._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Shop Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="text-gray-400" />
                      <span className="text-gray-700">{shop.phone}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <FaInfoCircle className="text-gray-400 mt-0.5" />
                      <p className="text-gray-700 flex-1">{shop.description}</p>
                    </div>

                    {/* Status Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">Status</p>
                        <p className={`font-semibold ${
                          shop.isOpen ? "text-green-600" : "text-red-500"
                        }`}>
                          {shop.isOpen ? "Open" : "Closed"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">Verified</p>
                        <p className={`font-semibold ${
                          shop.verified ? "text-green-600" : "text-red-500"
                        }`}>
                          {shop.verified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleItem(shop._id)}
                      className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-[#2DB82D] flex items-center justify-center gap-2"
                    >
                      <FaStore className="text-lg" />
                      View Items
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDeleteShop(shop._id, shop.name)}
                        className="bg-red-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <MdDelete className="text-lg" />
                        Delete
                      </button>

                      {!shop.verified && (
                        <button
                          onClick={() => handleVerifyShop(shop._id, shop.name)}
                          className="bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-blue-600 flex items-center justify-center gap-2"
                        >
                          <MdVerified className="text-lg" />
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleShopExpand(shop._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedShop === shop._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Details & Actions
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}