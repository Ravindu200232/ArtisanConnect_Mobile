import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import toast from "react-hot-toast";

export default function UpdateShop() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state;

  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    images: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) {
        console.error("Shop ID is missing");
        setFetchLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/getOne/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const { name, address, phone, description, images } = response.data;
        setShopData({
          name,
          address,
          phone,
          description,
          images: images || [],
        });
        setExistingImages(images || []);
      } catch (error) {
        console.error("Error fetching shop details:", error);
        toast.error("Failed to fetch shop details");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewImageChange = (e) => {
    setNewImageFiles([...e.target.files]);
  };

  const removeExistingImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const removeNewImage = (index) => {
    const newImages = [...newImageFiles];
    newImages.splice(index, 1);
    setNewImageFiles(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Upload new images if any
      let uploadedNewImages = [];
      if (newImageFiles.length > 0) {
        uploadedNewImages = await Promise.all(
          newImageFiles.map((file) => mediaUpload(file))
        );
      }

      // Combine existing images (after possible removal) with new uploaded images
      const allImages = [...existingImages, ...uploadedNewImages];

      const updateData = {
        ...shopData,
        images: allImages,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/update/${id}`,
        updateData,
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

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading shop details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#B7E892] sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-[#32CD32] text-center">
            Update Shop
          </h1>
          <p className="text-gray-600 text-center text-sm mt-1">
            Edit your shop information and images
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
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
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white"
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
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white resize-none"
                placeholder="Describe your shop, products, and services..."
                required
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Images
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((imgUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imgUrl}
                        alt={`Shop ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-[#93DC5C]"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Tap × to remove images
                </p>
              </div>
            )}

            {/* New Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Upload New Images (Optional)
              </label>
              <div className="border-2 border-dashed border-[#93DC5C] rounded-xl p-6 text-center transition-all duration-200 bg-gray-50">
                <input
                  type="file"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                  id="new-image-upload"
                  accept="image/*"
                />
                <label htmlFor="new-image-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-[#32CD32] rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">
                      Tap to upload new images
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Supports JPG, PNG, WEBP
                    </p>
                    {newImageFiles.length > 0 && (
                      <p className="text-[#32CD32] text-sm font-semibold mt-2">
                        {newImageFiles.length} new file(s) selected
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* New Image Previews */}
            {newImageFiles.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  New Image Previews
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from(newImageFiles).map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg border-2 border-[#93DC5C]"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate("/shopC/shop")}
            className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 active:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-[#32CD32] text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 active:bg-[#2DB82D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Help Text */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            All fields marked with * are required
          </p>
        </div>
      </div>
    </div>
  );
}