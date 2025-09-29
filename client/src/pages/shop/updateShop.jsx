import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function UpdateShop() {
  const location = useLocation();
  const navigate = useNavigate();
  console.log(location.state)
  const id = location.state;

  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    images: [""],
  });

  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) {
        console.error("Shop ID is missing");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/v1/owner/getOne/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response)
        const { name, address, phone, description, images } = response.data;
        setShopData({
          name,
          address,
          phone,
          description,
          images: images.length ? images : [""],
        });
      } catch (error) {
        console.error("Error fetching shop details:", error);
        toast.error("Failed to fetch shop");
      }
    };

    fetchShop();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...shopData.images];
    newImages[index] = value;
    setShopData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setShopData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const removeImageField = (index) => {
    const newImages = shopData.images.filter((_, i) => i !== index);
    setShopData((prev) => ({
      ...prev,
      images: newImages.length ? newImages : [""],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3000/api/v1/owner/update/${id}`,
        shopData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Shop updated successfully!");
      navigate("/shopC/shop");
    } catch (error) {
      console.error("Error updating Shop:", error);
      toast.error("Update failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#32CD32] mb-2">Update Shop</h2>
        <p className="text-gray-600">Edit your shop information and images</p>
      </div>

      {/* Form Section */}
      <div className="bg-[#DBF3C9] rounded-2xl shadow-lg p-8 border border-[#B7E892]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Shop Name *
            </label>
            <input
              type="text"
              name="name"
              value={shopData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              placeholder="Enter shop name"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={shopData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              placeholder="Enter shop address"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              value={shopData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              placeholder="Enter phone number"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description *
            </label>
            <textarea
              name="description"
              rows="4"
              value={shopData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe your shop, products, and services..."
              required
            />
          </div>

          {/* Image URLs */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Shop Images
            </label>
            <div className="space-y-3">
              {shopData.images.map((img, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
                    placeholder="Paste image URL here"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center gap-2 bg-[#93DC5C] hover:bg-[#7ED048] text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Image
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/shopC/shop")}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#32CD32] hover:bg-[#2DB82D] text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-dashed rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Shop
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          All fields marked with * are required
        </p>
      </div>
    </div>
  );
}