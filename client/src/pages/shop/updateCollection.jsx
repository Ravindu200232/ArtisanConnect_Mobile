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
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/collection/update/${data._id}`,
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
    <div className="min-h-screen bg-gradient-to-br  pb-6">
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
                Update Item
              </h1>
              <p className="text-orange-100 text-xs mt-0.5">
                Edit item details
              </p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="p-4 space-y-3">
        {/* Item ID (Disabled) */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">Item ID</label>
          <input
            type="text"
            disabled
            value={itemId}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 text-sm"
          />
        </div>

        {/* Seller Type Selection */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Seller Type <span className="text-[#F85606]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSellerType("product")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                sellerType === "product"
                  ? "border-[#F85606] bg-orange-50 shadow-sm"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${
                  sellerType === "product" ? "bg-[#F85606]" : "bg-gray-300"
                }`}>
                  <span className="text-white text-xl">🛍️</span>
                </div>
                <span className={`text-sm font-bold block ${
                  sellerType === "product" ? "text-[#F85606]" : "text-gray-600"
                }`}>
                  Product Seller
                </span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setSellerType("material")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                sellerType === "material"
                  ? "border-[#F85606] bg-orange-50 shadow-sm"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${
                  sellerType === "material" ? "bg-[#F85606]" : "bg-gray-300"
                }`}>
                  <span className="text-white text-xl">⚒️</span>
                </div>
                <span className={`text-sm font-bold block ${
                  sellerType === "material" ? "text-[#F85606]" : "text-gray-600"
                }`}>
                  Material Seller
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Item Name */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Item Name <span className="text-[#F85606]">*</span>
          </label>
          <input
            type="text"
            placeholder={`Enter ${sellerType === 'product' ? 'product' : 'material'} name`}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white text-sm"
          />
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Price (Rs.) <span className="text-[#F85606]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Rs.</span>
            <input
              type="number"
              placeholder="0.00"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white text-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Category <span className="text-[#F85606]">*</span>
          </label>
          <div className="relative">
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white text-sm appearance-none"
            >
              <option value="">Select Category</option>
              {(sellerType === "product" ? productCategories : materialCategories).map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Description <span className="text-[#F85606]">*</span>
          </label>
          <textarea
            placeholder={`Describe this ${sellerType === 'product' ? 'product' : 'material'} in detail...`}
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white resize-none text-sm"
            rows="4"
          />
          <p className="text-xs text-gray-500 mt-2">
            {itemDescription.length} characters
          </p>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Availability Status
              </label>
              <p className="text-xs text-gray-600">
                {itemAvailable ? 'Item is available for sale' : 'Item is out of stock'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                itemAvailable 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {itemAvailable ? '✓ In Stock' : '✗ Out of Stock'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemAvailable}
                  onChange={() => setItemAvailable(!itemAvailable)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F85606] shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Current Images ({existingImages.length})
            </label>
            <div className="grid grid-cols-3 gap-3">
              {existingImages.map((imgUrl, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={imgUrl}
                    alt="existing"
                    className="w-full h-24 object-cover rounded-xl border-2 border-orange-200"
                  />
                  <button
                    onClick={() => removeExistingImage(idx)}
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
            <p className="text-xs text-gray-500 mt-2">
              Tap × to remove images
            </p>
          </div>
        )}

        {/* New Images Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Upload New Images {itemImages.length > 0 && (
              <span className="text-[#F85606] ml-1">({itemImages.length} selected)</span>
            )}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center transition-all duration-200 bg-orange-50/50">
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
                <div className="w-16 h-16 bg-gradient-to-br from-[#F85606] to-[#FF7420] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-800 text-sm font-bold mb-1">
                  Tap to upload new images
                </p>
                <p className="text-gray-500 text-xs">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* New Image Previews */}
        {itemImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <label className="block text-sm font-bold text-gray-800 mb-3">
              New Image Previews ({itemImages.length})
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Array.from(itemImages).map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-xl border-2 border-orange-200"
                  />
                  <button
                    onClick={() => {
                      const newImages = Array.from(itemImages);
                      newImages.splice(idx, 1);
                      setItemImages(newImages);
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    New {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate("/shopC/shop")}
            className="bg-gray-400 text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            onClick={handleUpdateItem}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        <div className="bg-orange-100 rounded-xl p-3 border border-orange-200">
          <p className="text-xs text-gray-700 text-center">
            <span className="text-[#F85606] font-bold">*</span> All fields marked with asterisk are required
          </p>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}