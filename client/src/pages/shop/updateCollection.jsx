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
  const [isLoading, setIsLoading] = useState(false);

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
        `http://localhost:3000/api/v1/collection/update/${data._id}`,
        {
          name: itemName,
          price: itemPrice,
          category: itemCategory,
          description: itemDescription,
          available: itemAvailable,
          images: updatedImages,
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

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#DBF3C9] p-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#32CD32] mb-2">Update Item</h1>
        <p className="text-gray-600">Edit your item details and images</p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-[#DBF3C9] rounded-2xl shadow-lg p-8 border border-[#B7E892]">
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

          {/* Item Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Item Name *</label>
            <input
              type="text"
              placeholder="Enter item name"
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Item Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Price *</label>
            <input
              type="number"
              placeholder="Enter price"
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Category *</label>
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
            >
              <option value="fastfood">Fast Food</option>
              <option value="familyMeals">Family Meals</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description *</label>
            <textarea
              placeholder="Enter item description"
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 resize-none"
              rows="3"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
            />
          </div>

          {/* Availability */}
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-[#93DC5C]">
            <label className="text-sm font-semibold text-gray-700">Available:</label>
            <input
              type="checkbox"
              checked={itemAvailable}
              onChange={() => setItemAvailable(!itemAvailable)}
              className="w-5 h-5 text-[#32CD32] focus:ring-[#32CD32] border-[#93DC5C] rounded"
            />
            <span className={`text-sm font-semibold ${itemAvailable ? 'text-[#32CD32]' : 'text-red-500'}`}>
              {itemAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* New Images Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Upload New Images (Optional)
            </label>
            <div className="border-2 border-dashed border-[#93DC5C] rounded-xl p-4 text-center transition-all duration-200 hover:border-[#32CD32] hover:bg-[#C3F550]/10">
              <input
                type="file"
                multiple
                onChange={(e) => setItemImages(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-[#93DC5C] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 text-sm">Click to upload new images</p>
                  {itemImages.length > 0 && (
                    <p className="text-[#32CD32] text-sm font-semibold mt-1">
                      {itemImages.length} new file(s) selected
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Current Images</label>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt="existing"
                    className="w-full h-20 object-cover rounded-lg border-2 border-[#93DC5C]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate("/shopC/shop")}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateItem}
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
                  Update Item
                </>
              )}
            </button>
          </div>
        </div>
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