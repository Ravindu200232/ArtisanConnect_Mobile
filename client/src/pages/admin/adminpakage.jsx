import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { MdVerified, MdDelete, MdStore, MdPhone, MdLocationOn, MdExpandMore, MdSearch, MdClear } from "react-icons/md";
import { FaStore, FaUser, FaInfoCircle } from "react-icons/fa";

export default function AdminPackagePage() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedShop, setExpandedShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
      confirmButtonColor: "#F85606",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      position: "center"
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
          timer: 3000,
          showConfirmButton: false,
          position: "bottom",
          toast: true
        });

        setShops((prevShops) => prevShops.filter((shop) => shop._id !== id));
      } catch (error) {
        console.error("Error status:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to delete the shop.",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
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
        timer: 3000,
        showConfirmButton: false,
        position: "bottom",
        toast: true
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
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
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
      setFilteredShops(response.data);
    } catch (error) {
      console.error("Failed to fetch shop:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load shops",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter shops based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredShops(shops);
    } else {
      const filtered = shops.filter((shop) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          shop.name?.toLowerCase().includes(searchLower) ||
          shop.ownerName?.toLowerCase().includes(searchLower) ||
          shop.address?.toLowerCase().includes(searchLower) ||
          shop.phone?.toLowerCase().includes(searchLower) ||
          shop.description?.toLowerCase().includes(searchLower) ||
          (shop.verified && "verified".includes(searchLower)) ||
          (!shop.verified && "pending".includes(searchLower)) ||
          (shop.isOpen && "open".includes(searchLower)) ||
          (!shop.isOpen && "closed".includes(searchLower))
        );
      });
      setFilteredShops(filtered);
    }
  }, [searchTerm, shops]);

  useEffect(() => {
    fetchShop();
  }, []);

  const toggleShopExpand = (shopId) => {
    setExpandedShop(expandedShop === shopId ? null : shopId);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Stats calculation
  const totalShops = shops.length;
  const verifiedShops = shops.filter(shop => shop.verified).length;
  const pendingShops = totalShops - verifiedShops;
  const openShops = shops.filter(shop => shop.isOpen).length;

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
    <div className="min-h-screen bg-gradient-to-br  pb-20">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Shop Management
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Verify & manage shops
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <FaStore className="text-2xl text-white" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search shops by name, owner, address, phone, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-800 pl-10 pr-10 py-3.5 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-white focus:border-white focus:outline-none placeholder-gray-500 text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <MdClear className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium text-sm">Total Shops</span>
              </div>
              <span className="text-white font-bold text-xl">{totalShops}</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-sm">Showing</span>
              </div>
              <span className="text-white font-bold text-xl">{filteredShops.length}</span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Verified</span>
              </div>
              <span className="text-white font-bold text-lg">{verifiedShops}</span>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Pending</span>
              </div>
              <span className="text-white font-bold text-lg">{pendingShops}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shops List */}
      <div className="p-4 space-y-3">
        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchTerm ? (
                <MdSearch className="text-3xl text-[#F85606]" />
              ) : (
                <FaStore className="text-3xl text-[#F85606]" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? "No Shops Found" : "No Shops Yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? `No shops found for "${searchTerm}". Try different search terms.`
                : "Shops will appear here once created"
              }
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div key={shop._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Shop Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative">
                    <img
                      src={shop.images?.[0] || "/default-shop.jpg"}
                      alt={shop.name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-orange-200 shadow-sm"
                    />
                    {shop.verified && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <MdVerified className="text-white text-sm" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 text-base line-clamp-1">{shop.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        shop.isOpen 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {shop.isOpen ? "🟢 Open" : "🔴 Closed"}
                      </span>
                      {shop.verified && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          ✓ Verified
                        </span>
                      )}
                      {!shop.verified && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaUser className="text-gray-400" />
                      <span className="truncate">{shop.ownerName}</span>
                    </div>
                  </div>
                </div>

                {/* Location Row */}
                <div className="flex items-center gap-1 bg-white rounded-lg p-2">
                  <MdLocationOn className="text-[#F85606] text-lg flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate">{shop.address}</span>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedShop === shop._id && (
                <div className="border-t border-orange-100">
                  {/* Shop Details */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <FaInfoCircle className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Shop Details</h4>
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                        <MdPhone className="text-[#F85606] text-lg" />
                        <div className="text-sm">
                          <span className="text-gray-500 text-xs block">Phone</span>
                          <span className="text-gray-800 font-medium">{shop.phone}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                        <FaInfoCircle className="text-[#F85606] text-lg mt-0.5" />
                        <div className="text-sm flex-1">
                          <span className="text-gray-500 text-xs block">Description</span>
                          <span className="text-gray-800 font-medium">{shop.description}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">Shop Status</p>
                        <p className={`font-bold text-sm ${
                          shop.isOpen ? "text-green-600" : "text-red-600"
                        }`}>
                          {shop.isOpen ? "Open Now" : "Closed"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">Verification</p>
                        <p className={`font-bold text-sm ${
                          shop.verified ? "text-blue-600" : "text-amber-600"
                        }`}>
                          {shop.verified ? "Verified" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white space-y-2">
                    <button
                      onClick={() => handleItem(shop._id)}
                      className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                    >
                      <FaStore className="text-xl" />
                      View Shop Items
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDeleteShop(shop._id, shop.name)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <MdDelete className="text-lg" />
                        Delete
                      </button>

                      {!shop.verified && (
                        <button
                          onClick={() => handleVerifyShop(shop._id, shop.name)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                        >
                          <MdVerified className="text-lg" />
                          Verify
                        </button>
                      )}
                      {shop.verified && (
                        <button
                          disabled
                          className="bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3.5 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                        >
                          <MdVerified className="text-lg" />
                          Verified
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleShopExpand(shop._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                {expandedShop === shop._id ? (
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