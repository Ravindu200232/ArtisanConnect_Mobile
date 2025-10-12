import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import Swal from "sweetalert2";

// Notification Utilities
const showSuccessNotification = (title, message, timer = 3000) => {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#f0fdf4",
    color: "#065f46",
    iconColor: "#10b981",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-green-200",
      title: "text-green-800 font-bold text-sm",
      htmlContainer: "text-green-700 text-xs"
    }
  });
};

const showErrorNotification = (title, message, timer = 4000) => {
  return Swal.fire({
    title,
    text: message,
    icon: "error",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#fef2f2",
    color: "#7f1d1d",
    iconColor: "#ef4444",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-red-200",
      title: "text-red-800 font-bold text-sm",
      htmlContainer: "text-red-700 text-xs"
    }
  });
};

const showWarningNotification = (title, message, timer = 3500) => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#fffbeb",
    color: "#92400e",
    iconColor: "#f59e0b",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-amber-200",
      title: "text-amber-800 font-bold text-sm",
      htmlContainer: "text-amber-700 text-xs"
    }
  });
};

const showConfirmationDialog = (title, text, confirmText = "Yes", cancelText = "Cancel") => {
  return Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#6b7280",
    background: "#fffbeb",
    color: "#92400e",
    iconColor: "#f59e0b",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-amber-200",
      title: "text-amber-800 font-bold text-lg",
      htmlContainer: "text-amber-700",
      confirmButton: "rounded-xl font-bold px-6 py-2",
      cancelButton: "rounded-xl font-bold px-6 py-2"
    }
  });
};

const showLoadingNotification = (title, text) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    background: "#f0f9ff",
    color: "#0c4a6e",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-blue-200",
      title: "text-blue-800 font-bold text-sm",
      htmlContainer: "text-blue-700 text-xs"
    }
  });
};

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

  // Video states
  const [storyVideo, setStoryVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState(data.storyVideo || null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoQuality, setVideoQuality] = useState(null);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);

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

  const tourismCategories = [
    { value: "cultural", label: "Cultural Tours" },
    { value: "adventure", label: "Adventure Tours" },
    { value: "beach", label: "Beach Holidays" },
    { value: "wildlife", label: "Wildlife Safaris" },
    { value: "hillCountry", label: "Hill Country Tours" },
    { value: "ayurveda", label: "Ayurveda & Wellness" },
    { value: "honeymoon", label: "Honeymoon Packages" },
    { value: "family", label: "Family Vacations" },
    { value: "budget", label: "Budget Travel" },
    { value: "luxury", label: "Luxury Experiences" }
  ];

  // Video quality analysis
  const analyzeVideoQuality = async (file) => {
    try {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      if (file.size > 50 * 1024 * 1024) {
        return {
          valid: false,
          error: "Video exceeds 50MB limit",
          fileSize: fileSizeMB + "MB"
        };
      }

      const video = document.createElement('video');
      const videoURL = URL.createObjectURL(file);
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const duration = Math.round(video.duration);
          const width = video.videoWidth;
          const height = video.videoHeight;
          
          URL.revokeObjectURL(videoURL);
          
          let quality = "good";
          let rating = 8;
          let feedback = "Video meets requirements";
          let recommendations = "";

          if (duration > 60) {
            quality = "warning";
            rating = 6;
            feedback = "Video is quite long";
            recommendations = "Consider shorter videos (30-60s) for better engagement";
          }
          
          if (width < 720 || height < 720) {
            quality = "fair";
            rating = 5;
            feedback = "Low resolution video";
            recommendations = "Use 720p or higher for better quality";
          }
          
          if (fileSizeMB > 40) {
            recommendations += (recommendations ? " • " : "") + "Consider compressing to reduce file size";
          }

          resolve({
            valid: true,
            rating,
            duration: duration + "s",
            resolution: `${width}x${height}`,
            fileSize: fileSizeMB + "MB",
            quality,
            feedback,
            recommendations: recommendations || "Excellent video quality"
          });
        };

        video.onerror = () => {
          URL.revokeObjectURL(videoURL);
          resolve({
            valid: false,
            error: "Invalid video file",
            fileSize: fileSizeMB + "MB"
          });
        };

        video.src = videoURL;
      });
    } catch (error) {
      console.error("Video analysis error:", error);
      return {
        valid: false,
        error: "Failed to analyze video"
      };
    }
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showErrorNotification("Invalid File", "Please upload a video file");
      return;
    }

    setIsAnalyzingVideo(true);
    const loadingNotification = showLoadingNotification("Analyzing Video", "AI is analyzing your story video...");

    const quality = await analyzeVideoQuality(file);
    
    Swal.close();

    if (!quality.valid) {
      showErrorNotification("Video Error", quality.error);
      setIsAnalyzingVideo(false);
      return;
    }

    setStoryVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoQuality(quality);
    setRemoveExistingVideo(true); // Mark existing video for removal
    
    if (quality.rating >= 7) {
      showSuccessNotification("Great Video!", `Duration: ${quality.duration}, Quality: ${quality.quality}`);
    } else {
      showWarningNotification("Video Accepted", quality.recommendations);
    }

    setIsAnalyzingVideo(false);
  };

  const removeVideo = async () => {
    const result = await showConfirmationDialog(
      "Remove Video", 
      storyVideo ? "Remove the new video?" : "Remove the existing video?",
      "Remove",
      "Keep"
    );
    
    if (result.isConfirmed) {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setStoryVideo(null);
      setVideoPreview(null);
      setVideoQuality(null);
      
      if (existingVideoUrl) {
        setRemoveExistingVideo(true);
      }
      
      showSuccessNotification("Video Removed", "Story video will be removed on update");
    }
  };

  const keepExistingVideo = () => {
    setRemoveExistingVideo(false);
    setStoryVideo(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setVideoQuality(null);
    showSuccessNotification("Video Restored", "Existing video will be kept");
  };

  async function handleUpdateItem() {
    const token = localStorage.getItem("token");

    if (!token) {
      showErrorNotification("Authentication Required", "Please login first");
      return;
    }

    setIsLoading(true);
    const loadingNotification = showLoadingNotification("Updating Item", "Your item is being updated...");

    let updatedImages = existingImages;

    if (itemImages.length > 0) {
      try {
        Swal.update({
          title: "Uploading Images",
          text: "Uploading new images..."
        });
        const uploadPromises = Array.from(itemImages).map((img) => mediaUpload(img));
        updatedImages = await Promise.all(uploadPromises);
      } catch (err) {
        Swal.close();
        showErrorNotification("Upload Failed", "Image upload failed");
        setIsLoading(false);
        return;
      }
    }

    // Handle video upload
    let videoUrl = existingVideoUrl;
    if (storyVideo) {
      try {
        Swal.update({
          title: "Uploading Video",
          text: "Uploading story video... This may take a moment."
        });
        videoUrl = await mediaUpload(storyVideo);
      } catch (videoError) {
        console.error("Video upload error:", videoError);
        showWarningNotification("Video Upload Failed", "Item will be updated without new video");
      }
    } else if (removeExistingVideo) {
      videoUrl = null; // Remove video
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
          sellerType: sellerType,
          storyVideo: videoUrl
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      Swal.close();
      showSuccessNotification("Success!", result.data.message || "Item updated successfully", 2000);
      
      setTimeout(() => {
        showSuccessNotification("Redirecting...", "Taking you back to your collection", 1000);
        setTimeout(() => navigate("/shopC/shop"), 1200);
      }, 1500);
    } catch (err) {
      Swal.close();
      showErrorNotification("Update Failed", err.response?.data?.error || "Failed to update item");
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
    <div className="min-h-screen bg-gradient-to-br pb-6">
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
              <h1 className="text-xl font-bold text-white">Update Item</h1>
              <p className="text-orange-100 text-xs mt-0.5">✨ Edit item details</p>
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
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSellerType("product")}
              className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                sellerType === "product" ? "border-[#F85606] bg-orange-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                  sellerType === "product" ? "bg-[#F85606]" : "bg-gray-300"
                }`}>
                  <span className="text-white text-lg">🛍️</span>
                </div>
                <span className={`text-xs font-bold block ${
                  sellerType === "product" ? "text-[#F85606]" : "text-gray-600"
                }`}>Products</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setSellerType("material")}
              className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                sellerType === "material" ? "border-[#F85606] bg-orange-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                  sellerType === "material" ? "bg-[#F85606]" : "bg-gray-300"
                }`}>
                  <span className="text-white text-lg">⚒️</span>
                </div>
                <span className={`text-xs font-bold block ${
                  sellerType === "material" ? "text-[#F85606]" : "text-gray-600"
                }`}>Materials</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSellerType("tourism")}
              className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                sellerType === "tourism" ? "border-[#F85606] bg-orange-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                  sellerType === "tourism" ? "bg-[#F85606]" : "bg-gray-300"
                }`}>
                  <span className="text-white text-lg">✈️</span>
                </div>
                <span className={`text-xs font-bold block ${
                  sellerType === "tourism" ? "text-[#F85606]" : "text-gray-600"
                }`}>Tourism</span>
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
            placeholder={`Enter ${sellerType} name`}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
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
              className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Category <span className="text-[#F85606]">*</span>
          </label>
          <select
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm appearance-none"
          >
            {(sellerType === "product" ? productCategories : 
              sellerType === "material" ? materialCategories : tourismCategories).map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Description <span className="text-[#F85606]">*</span>
          </label>
          <textarea
            placeholder={`Describe this ${sellerType}...`}
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white resize-none text-sm"
            rows="4"
          />
          <p className="text-xs text-gray-500 mt-2">{itemDescription.length} characters</p>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Availability Status</label>
              <p className="text-xs text-gray-600">
                {itemAvailable ? 'Item is available for sale' : 'Item is out of stock'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                itemAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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

        {/* Existing Video */}
        {existingVideoUrl && !removeExistingVideo && !storyVideo && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-purple-200">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Current Story Video
            </label>
            <div className="relative rounded-xl overflow-hidden bg-black border-2 border-purple-300">
              <video 
                src={existingVideoUrl}
                controls
                className="w-full max-h-60 object-contain"
              />
              <button 
                type="button"
                onClick={async () => {
                  const result = await showConfirmationDialog(
                    "Remove Video", 
                    "Remove the current story video?",
                    "Remove",
                    "Keep"
                  );
                  if (result.isConfirmed) {
                    setRemoveExistingVideo(true);
                    showSuccessNotification("Video Marked", "Video will be removed on update");
                  }
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-red-600 active:scale-95"
              >
                ×
              </button>
            </div>
            <button 
              type="button"
              onClick={() => document.getElementById('video-upload-update').click()}
              className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Replace Video
            </button>
            <input 
              type="file" 
              onChange={handleVideoChange}
              className="hidden" 
              id="video-upload-update" 
              accept="video/*" 
            />
          </div>
        )}

        {/* New Video Upload */}
        {(!existingVideoUrl || removeExistingVideo || storyVideo) && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Story Video (Optional)
              <span className="text-xs font-normal text-gray-500">Max 50MB</span>
            </label>

            {!storyVideo ? (
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center bg-purple-50/50">
                <input 
                  type="file" 
                  onChange={handleVideoChange}
                  className="hidden" 
                  id="video-upload" 
                  accept="video/*" 
                />
                <label htmlFor="video-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-3 shadow-md">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-800 text-sm font-bold mb-1">Tap to upload story video</p>
                    <p className="text-gray-500 text-xs">Max 50MB • MP4, MOV, AVI supported</p>
                    <p className="text-purple-600 text-xs mt-2">📱 Perfect for product demos!</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video 
                    src={videoPreview} 
                    controls 
                    className="w-full max-h-80 object-contain"
                  />
                  <button 
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-transform"
                  >
                    ×
                  </button>
                </div>

                {videoQuality && (
                  <div className="border-2 border-purple-200 rounded-xl p-3 bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Video Quality Report
                      </label>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            videoQuality.rating >= 7 ? 'bg-green-500' : 
                            videoQuality.rating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${videoQuality.rating * 10}%` }} 
                        />
                      </div>
                      <span className={`text-xs font-bold ${
                        videoQuality.rating >= 7 ? 'text-green-600' : 
                        videoQuality.rating >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {videoQuality.rating}/10
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">Duration</p>
                        <p className="text-sm font-bold text-purple-700">{videoQuality.duration}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">Resolution</p>
                        <p className="text-sm font-bold text-purple-700">{videoQuality.resolution}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">File Size</p>
                        <p className="text-sm font-bold text-purple-700">{videoQuality.fileSize}</p>
                      </div>
                    </div>

                    <div className={`text-center py-2 rounded-lg mb-2 ${
                      videoQuality.rating >= 7 ? 'bg-green-100 text-green-800' : 
                      videoQuality.rating >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <p className="text-xs font-bold">⭐ {videoQuality.quality.toUpperCase()} QUALITY</p>
                    </div>

                    {videoQuality.feedback && (
                      <p className="text-xs text-gray-700 mb-2 bg-white p-2 rounded border border-purple-200">
                        💬 <span className="font-medium">{videoQuality.feedback}</span>
                      </p>
                    )}

                    {videoQuality.recommendations && videoQuality.rating < 7 && (
                      <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded border border-purple-300 font-medium">
                        💡 {videoQuality.recommendations}
                      </p>
                    )}
                  </div>
                )}

                <button 
                  type="button"
                  onClick={() => document.getElementById('video-upload-replace').click()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replace Video
                </button>
                <input 
                  type="file" 
                  onChange={handleVideoChange}
                  className="hidden" 
                  id="video-upload-replace" 
                  accept="video/*" 
                />

                {existingVideoUrl && (
                  <button 
                    type="button"
                    onClick={keepExistingVideo}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Keep Original Video
                  </button>
                )}
              </div>
            )}

            {isAnalyzingVideo && (
              <div className="flex items-center justify-center py-4 mt-3 bg-purple-50 rounded-xl">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                <p className="text-sm text-purple-700 font-medium">Analyzing video...</p>
              </div>
            )}
          </div>
        )}

        {/* Video Removed Notice */}
        {removeExistingVideo && existingVideoUrl && !storyVideo && (
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-red-800">Video Will Be Removed</p>
                  <p className="text-xs text-red-600">The story video will be deleted on update</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={keepExistingVideo}
                className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold active:scale-95"
              >
                Undo
              </button>
            </div>
          </div>
        )}

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
            <p className="text-xs text-gray-500 mt-2">Tap × to remove images</p>
          </div>
        )}

        {/* New Images Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Upload New Images {itemImages.length > 0 && (
              <span className="text-[#F85606] ml-1">({itemImages.length} selected)</span>
            )}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center bg-orange-50/50">
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
                <p className="text-gray-800 text-sm font-bold mb-1">Tap to upload new images</p>
                <p className="text-gray-500 text-xs">Supports JPG, PNG, WEBP</p>
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
            className="bg-gray-400 text-white py-4 px-6 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            onClick={handleUpdateItem}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
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
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold text-gray-800">✨ Update Features</p>
          </div>
          <div className="space-y-1 text-xs text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span><span className="font-bold">Video Management:</span> Replace or remove story videos with quality check</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span><span className="font-bold">Smart Updates:</span> Keep existing media or upload new ones</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span><span className="font-bold">Undo Support:</span> Restore original video if changed by mistake</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}