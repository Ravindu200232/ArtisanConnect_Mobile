import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import toast from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function AddShop() {
  const navigate = useNavigate();

  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => mediaUpload(file))
      );

      const response = await axios.post(
        `https://artisanconnect-backend.onrender.com/api/v1/owner`,
        {
          ...shopData,
          images: uploadedUrls,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Shop added successfully!");
      navigate("/shopC/shop");
    } catch (error) {
      console.error("Error adding shop:", error);
      toast.error("Failed to add shop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#32CD32] mb-2">Add New Shop</h2>
        <p className="text-gray-600">Create your shop profile to start selling</p>
      </div>

      {/* Form Section */}
      <div className="bg-[#DBF3C9] rounded-2xl shadow-lg p-8 border border-[#B7E892]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Shop Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={shopData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              placeholder="Enter your shop name"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
              Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={shopData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              placeholder="Enter shop address"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone Number *
            </label>
            <input
              type="text"
              id="phone"
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
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={shopData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 resize-none"
              rows="4"
              placeholder="Describe your shop, products, and services..."
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label htmlFor="images" className="block text-sm font-semibold text-gray-700">
              Shop Images *
            </label>
            <div className="border-2 border-dashed border-[#93DC5C] rounded-xl p-6 text-center transition-all duration-200 hover:border-[#32CD32] hover:bg-[#C3F550]/10">
              <input
                type="file"
                id="images"
                multiple
                onChange={handleImageChange}
                className="hidden"
                required
              />
              <label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-[#93DC5C] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-1">Click to upload images</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                  {imageFiles.length > 0 && (
                    <p className="text-[#32CD32] text-sm font-semibold mt-2">
                      {imageFiles.length} file(s) selected
                    </p>
                  )}
                </div>
              </label>
            </div>
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
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Shop
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