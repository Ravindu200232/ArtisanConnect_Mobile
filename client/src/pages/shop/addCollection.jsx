import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function AddCollection() {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("fastfood");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const [itemAvailable, setItemAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state;

  async function handleAddItem() {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!itemName || !itemPrice || !itemDescription) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const uploadPromises = Array.from(itemImages).map((img) => mediaUpload(img));
      const imageUrls = await Promise.all(uploadPromises);

      const payload = {
        shopId,
        name: itemName,
        price: itemPrice,
        category: itemCategory,
        description: itemDescription,
        available: itemAvailable,
        images: imageUrls,
      };

      const result = await axios.post(
        `http://localhost:3000/api/v1/collection`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(result.data.message || "Item added successfully");
      navigate("/shopC/shop");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#DBF3C9] p-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#32CD32] mb-2">Add New Item</h1>
        <p className="text-gray-600">Create a new item for your shop collection</p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-[#DBF3C9] rounded-2xl shadow-lg p-8 border border-[#B7E892]">
        <div className="space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Item Name *</label>
            <input
              type="text"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Price *</label>
            <input
              type="text"
              placeholder="Enter price"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200"
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
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent transition-all duration-200 resize-none"
              rows="3"
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

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Upload Images</label>
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
                  <p className="text-gray-600 text-sm">Click to upload images</p>
                  {itemImages.length > 0 && (
                    <p className="text-[#32CD32] text-sm font-semibold mt-1">
                      {itemImages.length} file(s) selected
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {itemImages.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Image Previews</label>
              <div className="grid grid-cols-3 gap-3">
                {Array.from(itemImages).map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-20 object-cover rounded-lg border-2 border-[#93DC5C]"
                    />
                  </div>
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
              onClick={handleAddItem}
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
                  Add Item
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