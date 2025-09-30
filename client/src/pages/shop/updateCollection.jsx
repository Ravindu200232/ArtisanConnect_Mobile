import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";

export default function UpdateCollection() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  const [itemId] = useState(data.itemId);
  const [itemName, setItemName] = useState(data.name);
  const [itemPrice, setItemPrice] = useState(data.price);
  const [itemCategory, setItemCategory] = useState(data.category);
  const [itemDescription, setItemDescription] = useState(data.description);
  const [itemAvailable, setItemAvailable] = useState(data.available);
  const [itemImages, setItemImages] = useState([]);
  const [existingImages, setExistingImages] = useState(data.images || []);
  const [sellerType, setSellerType] = useState(data.sellerType || "product");
  const [isLoading, setIsLoading] = useState(false);

  // Category options based on seller type
  const productCategories = [
    { value: "bathics", label: "Bathics" },
    { value: "woodenCrafts", label: "Wooden Crafts" },
    { value: "brassCrafts", label: "Brass Crafts" },
    { value: "pottery", label: "Pottery" },
    { value: "jewelry", label: "Traditional Jewelry" },
    { value: "masks", label: "Traditional Masks" },
    { value: "handloom", label: "Handloom Textiles" },
    { value: "lacquerware", label: "Lacquerware" },
    { value: "drums", label: "Traditional Drums" },
    { value: "spices", label: "Spices" },
    { value: "tea", label: "Ceylon Tea" },
    { value: "gems", label: "Gems & Stones" }
  ];

  const materialCategories = [
    { value: "fabric", label: "Fabric Materials" },
    { value: "wood", label: "Wood Materials" },
    { value: "clay", label: "Clay & Pottery Materials" },
    { value: "metal", label: "Metal & Brass Materials" },
    { value: "paint", label: "Paints & Dyes" },
    { value: "thread", label: "Thread & Yarn" },
    { value: "beads", label: "Beads & Stones" },
    { value: "tools", label: "Crafting Tools" },
    { value: "finishing", label: "Finishing Materials" },
    { value: "packaging", label: "Packaging Materials" }
  ];

  async function handleUpdateItem() {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    setIsLoading(true);

    let updatedImages = existingImages;

    if (itemImages.length > 0) {
      try {
        const uploadPromises = Array.from(itemImages).map((img) => mediaUpload(img));
        const uploaded = await Promise.all(uploadPromises);
        updatedImages = uploaded;
      } catch (err) {
        toast.error("Image upload failed");
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await axios.put(
        `https://artisanconnect-backend.onrender.com/api/v1/collection/update/${data._id}`,
        {
          name: itemName,
          price: itemPrice,
          category: itemCategory,
          description: itemDescription,
          available: itemAvailable,
          images: updatedImages,
          sellerType: sellerType // Include seller type in update
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(result.data.message || "Item updated successfully");
      navigate("/shopC/shop");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  }

  const removeExistingImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#B7E892] sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-[#32CD32] text-center">
            Update Item
          </h1>
          <p className="text-gray-600 text-center text-sm mt-1">
            Edit your item details and images
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
          <div className="space-y-6">
            {/* Item ID (Disabled) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Item ID</label>
              <input
                type="text"
                disabled
                value={itemId}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl bg-gray-100 text-gray-600"
              />
            </div>

            {/* Seller Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Seller Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSellerType("product")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    sellerType === "product"
                      ? "border-[#32CD32] bg-[#32CD32]/10"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-[#32CD32] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🛍️</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      sellerType === "product" ? "text-[#32CD32]" : "text-gray-600"
                    }`}>
                      Product Seller
                    </span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSellerType("material")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    sellerType === "material"
                      ? "border-[#32CD32] bg-[#32CD32]/10"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-[#32CD32] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">⚒️</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      sellerType === "material" ? "text-[#32CD32]" : "text-gray-600"
                    }`}>
                      Material Seller
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Item Name *
              </label>
              <input
                type="text"
                placeholder={`Enter ${sellerType === 'product' ? 'product' : 'material'} name`}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>

            {/* Item Price */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Price (Rs.) *
              </label>
              <input
                type="number"
                placeholder="Enter price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Category *
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Select Category</option>
                {(sellerType === "product" ? productCategories : materialCategories).map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <textarea
                placeholder={`Describe this ${sellerType === 'product' ? 'product' : 'material'}`}
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 bg-white resize-none"
                rows="3"
              />
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-[#93DC5C]">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Availability
                </label>
                <p className="text-xs text-gray-600">
                  {itemAvailable ? 'Item is available for sale' : 'Item is currently out of stock'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${itemAvailable ? 'text-[#32CD32]' : 'text-red-500'}`}>
                  {itemAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemAvailable}
                    onChange={() => setItemAvailable(!itemAvailable)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#32CD32]"></div>
                </label>
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Current Images
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={imgUrl}
                        alt="existing"
                        className="w-full h-24 object-cover rounded-lg border-2 border-[#93DC5C]"
                      />
                      <button
                        onClick={() => removeExistingImage(idx)}
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

            {/* New Images Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Upload New Images (Optional)
              </label>
              <div className="border-2 border-dashed border-[#93DC5C] rounded-xl p-6 text-center transition-all duration-200 bg-gray-50">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setItemImages(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  accept="image/*"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
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
                    {itemImages.length > 0 && (
                      <p className="text-[#32CD32] text-sm font-semibold mt-2">
                        {itemImages.length} new file(s) selected
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* New Image Previews */}
            {itemImages.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  New Image Previews
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from(itemImages).map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg border-2 border-[#93DC5C]"
                      />
                      <button
                        onClick={() => {
                          const newImages = Array.from(itemImages);
                          newImages.splice(idx, 1);
                          setItemImages(newImages);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            onClick={handleUpdateItem}
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
                Update Item
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