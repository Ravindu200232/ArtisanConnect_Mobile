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
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-[#32CD32] border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#32CD32]">My Shops</h1>
        <Link
          to="/shopC/shop/add"
          className="flex items-center gap-2 bg-[#32CD32] hover:bg-[#2DB82D] text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Shop
        </Link>
      </div>

      {/* Smaller Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {shop.map((shop) => (
          <div
            key={shop._id}
            className="bg-[#DBF3C9] shadow-md rounded-lg p-3 space-y-2 border border-[#B7E892] hover:shadow-lg transition-all duration-200"
          >
            {/* Shop Image */}
            <button 
              onClick={() => handleItem(shop._id)}
              className="w-full transition-transform hover:scale-105"
            >
              <img
                src={shop.images?.[0] || "/default-shop.jpg"}
                alt={shop.name}
                className="w-full h-32 object-cover rounded-lg border border-[#93DC5C]"
              />
            </button>
            
            {/* Shop Info - Compact */}
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-gray-800 truncate">{shop.name}</h2>
              
              <div className="text-xs text-gray-600 space-y-0.5">
                <p className="truncate"><strong>Owner:</strong> {shop.ownerName}</p>
                <p className="truncate"><strong>Phone:</strong> {shop.phone}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex justify-between items-center">
              
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${shop.verified ? "bg-[#32CD32] text-white" : "bg-yellow-200 text-yellow-800"}`}>
                {shop.verified ? "✓" : "!"}
              </span>
            </div>

            {/* Toggle Button */}
            {shop.isOpen ? (
              <button
                onClick={() => handleToggleShop(shop._id, false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Close
              </button>
            ) : (
              <button
                onClick={() => handleToggleShop(shop._id, true)}
                className="w-full bg-[#32CD32] hover:bg-[#2DB82D] text-white py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Open
              </button>
            )}

            {/* Action Buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={() => handleDeleteShop(shop._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Delete
              </button>

              <button
                onClick={() => handleUpdateShop(shop._id)}
                className="flex-1 bg-[#93DC5C] hover:bg-[#7ED048] text-white py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {shop.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[#93DC5C] text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No shops yet</h3>
          <p className="text-gray-500 mb-4">Create your first shop to get started</p>
          <Link
            to="/shopC/shop/add"
            className="inline-flex items-center gap-2 bg-[#32CD32] hover:bg-[#2DB82D] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Shop
          </Link>
        </div>
      )}
    </div>
  );
}