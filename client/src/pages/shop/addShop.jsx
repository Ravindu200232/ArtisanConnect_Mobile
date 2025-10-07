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
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner`,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-6">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/shopC/shop")}
              className="w-9 h-9 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white">
                Add New Shop
              </h1>
              <p className="text-orange-100 text-xs mt-0.5">
                Create your shop profile
              </p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Shop Name */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">
            Shop Name <span className="text-[#F85606]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={shopData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white text-sm"
            placeholder="Enter your shop name"
            required
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label htmlFor="address" className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Shop Address <span className="text-[#F85606]">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={shopData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white text-sm"
            placeholder="Enter shop address"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label htmlFor="phone" className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Number <span className="text-[#F85606]">*</span>
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={shopData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white text-sm"
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Shop Description <span className="text-[#F85606]">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={shopData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white resize-none text-sm"
            rows="4"
            placeholder="Describe your shop, products, and services..."
            required
          ></textarea>
          <p className="text-xs text-gray-500 mt-2">
            {shopData.description.length} characters
          </p>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label htmlFor="images" className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Shop Images <span className="text-[#F85606]">*</span>
            {imageFiles.length > 0 && (
              <span className="text-[#F85606] ml-1">({imageFiles.length} selected)</span>
            )}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center transition-all duration-200 bg-orange-50/50">
            <input
              type="file"
              id="images"
              multiple
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
              required
            />
            <label htmlFor="images" className="cursor-pointer block">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F85606] to-[#FF7420] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-800 text-sm font-bold mb-1">
                  Tap to upload shop images
                </p>
                <p className="text-gray-500 text-xs">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Image Previews */}
        {imageFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Image Previews ({imageFiles.length})
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Array.from(imageFiles).map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover rounded-xl border-2 border-orange-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = Array.from(imageFiles);
                      newFiles.splice(idx, 1);
                      setImageFiles(newFiles);
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/shopC/shop")}
            className="bg-gray-400 text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

        {/* Help Text */}
        <div className="bg-orange-100 rounded-xl p-3 border border-orange-200">
          <p className="text-xs text-gray-700 text-center">
            <span className="text-[#F85606] font-bold">*</span> All fields marked with asterisk are required
          </p>
        </div>
      </form>

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
        }
      `}</style>
    </div>
  );
}