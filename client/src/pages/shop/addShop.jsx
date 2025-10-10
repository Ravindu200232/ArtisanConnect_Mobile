import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import toast from "react-hot-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const geminiApiKey = "AIzaSyCMY7C8g_LSES9IB9BHS8DQVGdrSLXr08I";
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Enhanced business types for artisan and material suppliers
const businessCategories = {
  artisan: [
    { value: "pottery", label: "🏺 Pottery & Ceramics" },
    { value: "batik", label: "🎨 Batik & Textile Art" },
    { value: "wood_carving", label: "🪵 Wood Carving" },
    { value: "basket_weaving", label: "🧺 Basket Weaving" },
    { value: "jewelry_making", label: "💎 Jewelry Making" },
    { value: "blacksmith", label: "🔥 Blacksmithing" },
    { value: "leather_work", label: "👜 Leather Work" },
    { value: "weaving", label: "🧵 Weaving & Spinning" },
    { value: "carpentry", label: "🪑 Carpentry & Woodwork" },
    { value: "metalwork", label: "🔨 Metalwork & Welding" },
    { value: "tailoring", label: "✂️ Tailoring & Sewing" },
    { value: "furniture_making", label: "🛋️ Furniture Making" },
    { value: "glass_aluminum", label: "🪟 Glass & Aluminum Work" },
    { value: "tile_marble", label: "⬜ Tiles & Marble Work" },
    { value: "painting", label: "🎨 Painting & Decoration" }
  ],
  material: [
    { value: "building_materials", label: "🏗️ Building Materials" },
    { value: "hardware", label: "🔩 Hardware & Tools" },
    { value: "fabric_supply", label: "🧵 Fabric & Textile Supply" },
    { value: "clay_supply", label: "🪨 Clay & Pottery Materials" },
    { value: "wood_supply", label: "🪵 Wood & Timber Supply" },
    { value: "metal_supply", label: "🔩 Metal & Raw Materials" },
    { value: "paint_supply", label: "🎨 Paint & Coating Supply" },
    { value: "electrical_supply", label: "⚡ Electrical Supplies" },
    { value: "plumbing_supply", label: "🔧 Plumbing Supplies" },
    { value: "auto_parts", label: "🚗 Auto Parts & Accessories" }
  ]
};

export default function AddShop() {
  const navigate = useNavigate();
  const [shopData, setShopData] = useState({
    name: "", address: "", phone: "", description: "", images: []
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imageQualityScores, setImageQualityScores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [selectedCategoryType, setSelectedCategoryType] = useState("artisan");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [aiDescriptionOptions, setAiDescriptionOptions] = useState([]);
  const [selectedDescriptionOption, setSelectedDescriptionOption] = useState(null);
  const [showDescriptionOptions, setShowDescriptionOptions] = useState(false);
  const [useManualDescription, setUseManualDescription] = useState(false);
  const [isNarratorEnabled, setIsNarratorEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const speechSynthesis = window.speechSynthesis;

  // Mobile-style notification system
  const showNotification = (message, type = "info", duration = 4000) => {
    const id = Date.now().toString();
    const notification = {
      id,
      message,
      type,
      visible: true
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    setTimeout(() => {
      hideNotification(id);
    }, duration);
    
    return id;
  };

  const hideNotification = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, visible: false } : notif
      )
    );
    
    // Remove from array after fade out
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShopData(prev => ({ ...prev, [name]: value }));
  };

  const speakText = (text) => {
    if (!isNarratorEnabled || !text?.trim()) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleFieldFocus = (fieldName) => {
    if (isNarratorEnabled) speakText(`${fieldName} field focused`);
  };

  const analyzeImageQuality = async (file) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const img = new Image();
      const dimensionsPromise = new Promise((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(file);
      });
      const dimensions = await dimensionsPromise;

      const prompt = `Analyze this image for shop listing quality. Rate 1-10.
Consider: resolution (${dimensions.width}x${dimensions.height}), lighting, professional appearance, focus, sharpness.
Respond in JSON: {"rating": <1-10>, "resolution": "${dimensions.width}x${dimensions.height}", "fileSize": "${(file.size/1024).toFixed(1)}KB", "quality": "<excellent/good/fair/poor>", "feedback": "<brief assessment>", "recommendations": "<suggestions>"}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: file.type, data: base64Data } }
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      
      return {
        rating: dimensions.width >= 1024 && dimensions.height >= 768 ? 8 : 6,
        resolution: `${dimensions.width}x${dimensions.height}`,
        fileSize: `${(file.size/1024).toFixed(1)}KB`,
        quality: dimensions.width >= 1024 ? "good" : "fair",
        feedback: "Image uploaded successfully",
        recommendations: dimensions.width < 1024 ? "Use higher resolution (1024x768+)" : "Good quality"
      };
    } catch (error) {
      console.error("Image analysis error:", error);
      return null;
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsAnalyzingImage(true);
    const notifId = showNotification("🔍 AI analyzing image quality...", "info");
    if (isNarratorEnabled) speakText(`Analyzing ${files.length} image${files.length > 1 ? 's' : ''}`);

    const qualities = await Promise.all(files.map(f => analyzeImageQuality(f)));
    setImageFiles(prev => [...prev, ...files]);
    setImageQualityScores(prev => [...prev, ...qualities]);
    hideNotification(notifId);
    
    const avgRating = qualities.reduce((sum, q) => sum + (q?.rating || 0), 0) / qualities.length;
    const excellentCount = qualities.filter(q => q?.rating >= 8).length;
    const poorCount = qualities.filter(q => q?.rating < 6).length;
    
    if (avgRating >= 8) {
      showNotification(`✨ Excellent! ${excellentCount} image${excellentCount > 1 ? 's' : ''} rated 8+`, "success");
      if (isNarratorEnabled) speakText(`Excellent image quality. Average rating ${avgRating.toFixed(1)} out of 10`);
    } else if (avgRating >= 6) {
      showNotification("✓ Good quality images", "success");
      if (isNarratorEnabled) speakText(`Good image quality. Average rating ${avgRating.toFixed(1)} out of 10`);
    } else {
      showNotification(`⚠️ ${poorCount} low quality image${poorCount > 1 ? 's' : ''} detected`, "warning");
      if (isNarratorEnabled) speakText(`Warning: Low quality images. Average rating ${avgRating.toFixed(1)} out of 10`);
    }
    setIsAnalyzingImage(false);
  };

  const generateDescriptionOptions = async () => {
    if (!shopData.name.trim()) {
      showNotification("Please enter shop name first", "warning");
      return;
    }

    setIsGeneratingDescription(true);
    setShowDescriptionOptions(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const businessInfo = selectedBusinessType 
        ? `This is a ${businessCategories[selectedCategoryType].find(b => b.value === selectedBusinessType)?.label} business.` 
        : '';
      
      const prompt = `Create 3 professional shop descriptions for "${shopData.name}" at "${shopData.address}". ${businessInfo}
Generate: 1. Professional (150-180 chars), 2. Friendly (150-180 chars), 3. Detailed (150-180 chars)
JSON format: {"options": [{"style": "Professional", "description": "..."}, {"style": "Friendly", "description": "..."}, {"style": "Detailed", "description": "..."}]}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiDescriptionOptions(parsed.options);
        showNotification("✨ 3 AI description options generated!", "success");
      }
    } catch (error) {
      console.error("Description generation error:", error);
      showNotification("Failed to generate options. Try manual.", "error");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const selectDescriptionOption = (option) => {
    setSelectedDescriptionOption(option);
    setShopData(prev => ({ ...prev, description: option.description }));
    showNotification(`${option.style} description selected!`, "success");
  };

  const removeLowQualityImages = () => {
    const lowIndices = imageQualityScores
      .map((q, idx) => q && q.rating < 5 ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (lowIndices.length === 0) {
      showNotification("No low quality images to remove", "info");
      return;
    }
    
    showNotification(
      `Remove ${lowIndices.length} low quality image(s)?`,
      "confirm",
      5000
    );
    
    // In a real app, you'd use a proper confirmation dialog
    if (window.confirm(`Remove ${lowIndices.length} low quality image(s) (rating < 5)?`)) {
      setImageFiles(imageFiles.filter((_, idx) => !lowIndices.includes(idx)));
      setImageQualityScores(imageQualityScores.filter((_, idx) => !lowIndices.includes(idx)));
      showNotification(`Removed ${lowIndices.length} low quality image(s)`, "success");
      if (isNarratorEnabled) speakText(`Removed ${lowIndices.length} low quality images`);
    }
  };

  const clearAllImages = () => {
    if (imageFiles.length === 0) return;
    showNotification(
      `Remove all ${imageFiles.length} image(s)?`,
      "confirm",
      5000
    );
    
    if (window.confirm(`Remove all ${imageFiles.length} image(s)?`)) {
      setImageFiles([]);
      setImageQualityScores([]);
      showNotification("All images cleared", "success");
      if (isNarratorEnabled) speakText("All images cleared");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const lowQuality = imageQualityScores.filter(q => q && q.rating < 5);
    if (lowQuality.length > 0) {
      showNotification(
        `${lowQuality.length} image(s) have low quality. Continue?`,
        "warning",
        5000
      );
      if (!window.confirm(`${lowQuality.length} image(s) have low quality. Continue?`)) return;
    }

    setIsLoading(true);
    if (isNarratorEnabled) speakText("Submitting your shop details. Please wait.");

    try {
      const token = localStorage.getItem("token");
      const uploadedUrls = await Promise.all(imageFiles.map(f => mediaUpload(f)));

      await axios.post(`${backendUrl}/api/v1/owner`, {
        ...shopData, 
        images: uploadedUrls,
        businessType: showCustomCategory ? customCategory : selectedBusinessType,
        categoryType: selectedCategoryType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showNotification("Shop added successfully!", "success");
      if (isNarratorEnabled) speakText("Shop added successfully! Redirecting.");
      setTimeout(() => navigate("/shopC/shop"), 1500);
    } catch (error) {
      console.error("Error:", error);
      showNotification("Failed to add shop. Please try again.", "error");
      if (isNarratorEnabled) speakText("Failed to add shop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-6">
      {/* Mobile-style Notifications */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 space-y-2 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center justify-between p-4 rounded-2xl shadow-lg border-2 transform transition-all duration-300 pointer-events-auto ${
              notification.visible 
                ? 'translate-y-0 opacity-100 scale-100' 
                : 'translate-y-2 opacity-0 scale-95'
            } ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : notification.type === 'warning' 
                ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-800'
                : notification.type === 'confirm'
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                notification.type === 'success' 
                  ? 'bg-green-100 text-green-600' 
                  : notification.type === 'warning' 
                  ? 'bg-yellow-100 text-yellow-600'
                  : notification.type === 'error'
                  ? 'bg-red-100 text-red-600'
                  : notification.type === 'confirm'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {notification.type === 'success' && '✓'}
                {notification.type === 'warning' && '⚠'}
                {notification.type === 'error' && '✕'}
                {notification.type === 'confirm' && '?'}
                {notification.type === 'info' && '💡'}
              </div>
              <p className="text-sm font-medium flex-1">{notification.message}</p>
            </div>
            <button
              onClick={() => hideNotification(notification.id)}
              className="ml-2 w-6 h-6 rounded-full bg-black bg-opacity-10 flex items-center justify-center text-xs font-bold hover:bg-opacity-20 transition-all"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/shopC/shop")}
              className="w-9 h-9 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white">Add Artisan Shop</h1>
              <p className="text-orange-100 text-xs mt-0.5">✨ AI-Powered Quality Check</p>
            </div>
            <button onClick={() => {
                setIsNarratorEnabled(!isNarratorEnabled);
                if (!isNarratorEnabled) {
                  speakText("Narrator enabled. I will read important updates for you.");
                  showNotification("Narrator enabled", "success");
                } else {
                  stopSpeaking();
                  showNotification("Narrator disabled", "info");
                }
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isNarratorEnabled ? 'bg-green-500' : 'bg-white bg-opacity-20'
              }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Narrator Status */}
        {isNarratorEnabled && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-green-600 ${isSpeaking ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="text-sm font-bold text-green-800">
                {isSpeaking ? "🔊 Speaking..." : "✓ Narrator Active"}
              </span>
            </div>
            {isSpeaking && (
              <button type="button" onClick={stopSpeaking}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                Stop
              </button>
            )}
          </div>
        )}

        {/* Business Category Type */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 border-2 border-blue-200">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Business Category Type <span className="text-blue-600">*</span>
          </label>
          
          {/* Category Type Selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryType("artisan");
                setSelectedBusinessType("");
                setShowCustomCategory(false);
                if (isNarratorEnabled) speakText("Artisan category selected");
              }}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                selectedCategoryType === "artisan"
                  ? "border-blue-600 bg-blue-100 text-blue-800"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
              }`}
            >
              🎨 Artisan
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryType("material");
                setSelectedBusinessType("");
                setShowCustomCategory(false);
                if (isNarratorEnabled) speakText("Material supplier category selected");
              }}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                selectedCategoryType === "material"
                  ? "border-blue-600 bg-blue-100 text-blue-800"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
              }`}
            >
              🏗️ Material Supplier
            </button>
          </div>

          {/* Business Type Selection */}
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Specific Business Type <span className="text-blue-600">*</span>
          </label>
          
          {!showCustomCategory ? (
            <>
              <select 
                value={selectedBusinessType}
                onChange={(e) => {
                  setSelectedBusinessType(e.target.value);
                  const selected = businessCategories[selectedCategoryType].find(b => b.value === e.target.value);
                  if (isNarratorEnabled && selected) speakText(`Selected: ${selected.label}`);
                }}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-sm font-medium mb-2"
                required
              >
                <option value="">Select your {selectedCategoryType} category...</option>
                {businessCategories[selectedCategoryType].map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
                <option value="other">➕ Other (Specify your own)</option>
              </select>
            </>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter your custom business category..."
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-sm"
                required
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomCategory(false);
                  setCustomCategory("");
                  setSelectedBusinessType("");
                }}
                className="text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                ← Back to category list
              </button>
            </div>
          )}

          {selectedBusinessType === "other" && !showCustomCategory && (
            <button
              type="button"
              onClick={() => {
                setShowCustomCategory(true);
                setSelectedBusinessType("");
                if (isNarratorEnabled) speakText("Custom category field opened");
              }}
              className="w-full mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg"
            >
              ✨ Add Custom Category
            </button>
          )}
        </div>

        {/* Shop Name */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Shop/Business Name <span className="text-[#F85606]">*</span>
          </label>
          <input type="text" name="name" value={shopData.name} onChange={handleChange}
            onFocus={() => handleFieldFocus("Shop name")}
            onBlur={() => isNarratorEnabled && shopData.name && speakText(`Shop name entered: ${shopData.name}`)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
            placeholder="Enter your shop/business name" required />
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Address <span className="text-[#F85606]">*</span>
          </label>
          <input type="text" name="address" value={shopData.address} onChange={handleChange}
            onFocus={() => handleFieldFocus("Address")}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
            placeholder="Enter business address" required />
        </div>

        {/* Phone */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Number <span className="text-[#F85606]">*</span>
          </label>
          <input type="text" name="phone" value={shopData.phone} onChange={handleChange}
            onFocus={() => handleFieldFocus("Phone number")}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
            placeholder="Enter contact number" required />
        </div>

        {/* AI Description Options - Keep existing code */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-md p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-gray-800">
              Shop Description <span className="text-[#F85606]">*</span>
            </label>
            <button type="button"
              onClick={() => {
                setUseManualDescription(!useManualDescription);
                setShowDescriptionOptions(false);
                if (isNarratorEnabled) speakText(useManualDescription ? "Switched to AI mode" : "Switched to manual mode");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                useManualDescription ? 'bg-gray-500 text-white' : 'bg-purple-600 text-white'
              }`}>
              {useManualDescription ? "📝 Manual" : "🤖 AI"}
            </button>
          </div>

          {!useManualDescription && (
            <>
              <button type="button" onClick={generateDescriptionOptions}
                disabled={isGeneratingDescription || !shopData.name.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-50 mb-3">
                {isGeneratingDescription ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate 3 AI Description Options
                  </>
                )}
              </button>

              {showDescriptionOptions && aiDescriptionOptions.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-bold text-purple-800">Choose your preferred style:</p>
                  {aiDescriptionOptions.map((option, idx) => (
                    <button key={idx} type="button"
                      onClick={() => {
                        selectDescriptionOption(option);
                        if (isNarratorEnabled) speakText(`Selected ${option.style} description`);
                      }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedDescriptionOption?.style === option.style
                          ? 'border-purple-600 bg-purple-100'
                          : 'border-purple-200 bg-white hover:border-purple-400'
                      }`}>
                      <p className="text-xs font-bold text-purple-700 mb-1">{idx + 1}. {option.style}</p>
                      <p className="text-xs text-gray-700">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <textarea name="description" value={shopData.description} onChange={handleChange}
            onFocus={() => isNarratorEnabled && speakText("Description field focused")}
            readOnly={!useManualDescription && selectedDescriptionOption}
            className={`w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none text-sm ${
              !useManualDescription && selectedDescriptionOption ? 'bg-purple-50' : 'bg-white'
            }`}
            rows="4"
            placeholder={useManualDescription ? "Write your shop description manually..." : "Generated description will appear here"}
            required />
          <p className="text-xs text-gray-600 mt-2">{shopData.description.length} characters</p>
        </div>

        {/* Image Upload Section - Keep existing code */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Shop Images <span className="text-[#F85606]">*</span>
            {imageFiles.length > 0 && <span className="text-[#F85606]">({imageFiles.length})</span>}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center bg-orange-50/50 hover:bg-orange-50 transition-all">
            <input type="file" id="images" multiple onChange={handleImageChange}
              className="hidden" accept="image/*" />
            <label htmlFor="images" className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F85606] to-[#FF7420] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-800 text-sm font-bold mb-1">Tap to upload shop images</p>
                <p className="text-gray-500 text-xs">AI will analyze quality • 1024x768+ recommended</p>
              </div>
            </label>
          </div>
        </div>

        {/* Image Quality Report - Keep existing code */}
        {imageFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Image Quality Report ({imageFiles.length})
              </label>
              <div className="flex gap-2">
                {imageQualityScores.filter(q => q && q.rating < 5).length > 0 && (
                  <button type="button" onClick={removeLowQualityImages}
                    className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold active:scale-95 transition-all"
                    title="Remove images with rating < 5">
                    Remove Poor
                  </button>
                )}
                <button type="button" onClick={clearAllImages}
                  className="text-xs bg-gray-500 text-white px-3 py-1.5 rounded-lg font-bold active:scale-95 transition-all">
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {imageFiles.map((file, idx) => {
                const quality = imageQualityScores[idx];
                return (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                    <div className="flex gap-3">
                      <img src={URL.createObjectURL(file)} alt={`preview-${idx}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-gray-800 truncate">Image {idx + 1}</p>
                          <button type="button"
                            onClick={() => {
                              setImageFiles(imageFiles.filter((_, i) => i !== idx));
                              setImageQualityScores(imageQualityScores.filter((_, i) => i !== idx));
                              showNotification("Image removed", "success");
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            ×
                          </button>
                        </div>
                        
                        {quality ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className={`h-2 rounded-full transition-all duration-500 ${
                                    quality.rating >= 8 ? 'bg-green-500' : 
                                    quality.rating >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} style={{ width: `${quality.rating * 10}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${
                                  quality.rating >= 8 ? 'text-green-600' : 
                                  quality.rating >= 6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {quality.rating}/10
                              </span>
                            </div>
                            
                            <div className="space-y-0.5">
                              <p className="text-xs text-gray-600">
                                <span className="font-bold">📐 Resolution:</span> {quality.resolution}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-bold">💾 Size:</span> {quality.fileSize}
                              </p>
                              <p className={`text-xs font-medium ${
                                  quality.rating >= 8 ? 'text-green-700' : 
                                  quality.rating >= 6 ? 'text-yellow-700' : 'text-red-700'
                                }`}>
                                <span className="font-bold">⭐ Quality:</span> {quality.quality.toUpperCase()}
                              </p>
                              {quality.feedback && (
                                <p className="text-xs text-gray-700 mt-1 italic">💬 {quality.feedback}</p>
                              )}
                              {quality.recommendations && quality.rating < 8 && (
                                <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 p-2 rounded border border-orange-200">
                                  💡 <span className="font-bold">Tip:</span> {quality.recommendations}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500">Analyzing...</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Overall Quality Summary */}
            <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border-2 border-blue-200">
              <p className="text-xs font-bold text-gray-800 mb-2 flex items-center justify-between">
                <span>📊 Overall Quality Analysis</span>
                {isNarratorEnabled && (
                  <button type="button"
                    onClick={() => {
                      const avgRating = (imageQualityScores.reduce((sum, q) => sum + (q?.rating || 0), 0) / imageQualityScores.filter(q => q).length).toFixed(1);
                      const excellent = imageQualityScores.filter(q => q?.rating >= 8).length;
                      const good = imageQualityScores.filter(q => q?.rating >= 6 && q?.rating < 8).length;
                      const poor = imageQualityScores.filter(q => q?.rating < 6).length;
                      speakText(`Quality summary: Average rating ${avgRating} out of 10. ${excellent} excellent, ${good} good, ${poor} poor quality images`);
                    }}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Read
                  </button>
                )}
              </p>
              {imageQualityScores.filter(q => q).length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <p className="text-2xl font-bold text-green-600">
                        {imageQualityScores.filter(q => q?.rating >= 8).length}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Excellent</p>
                      <p className="text-xs text-green-600">8-10★</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                      <p className="text-2xl font-bold text-yellow-600">
                        {imageQualityScores.filter(q => q?.rating >= 6 && q?.rating < 8).length}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Good</p>
                      <p className="text-xs text-yellow-600">6-7★</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                      <p className="text-2xl font-bold text-red-600">
                        {imageQualityScores.filter(q => q?.rating < 6).length}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Poor</p>
                      <p className="text-xs text-red-600">1-5★</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-700">
                        Average Rating: <span className="font-bold text-blue-600 text-sm">
                          {(imageQualityScores.reduce((sum, q) => sum + (q?.rating || 0), 0) / imageQualityScores.filter(q => q).length).toFixed(1)}/10
                        </span>
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${
                              i < Math.round((imageQualityScores.reduce((sum, q) => sum + (q?.rating || 0), 0) / imageQualityScores.filter(q => q).length))
                                ? 'bg-blue-600' : 'bg-gray-300'
                            }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <p className="text-xs text-gray-600">Quality analysis in progress...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button type="button"
            onClick={() => {
              if (isNarratorEnabled) speakText("Canceling and going back");
              navigate("/shopC/shop");
            }}
            className="bg-gray-400 text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:bg-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button type="submit" disabled={isLoading || imageFiles.length === 0}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 hover:shadow-lg">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Shop
              </>
            )}
          </button>
        </div>

        {/* Feature Info Card */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm font-bold text-gray-800">✨ Gemini AI-Powered Features</p>
          </div>
          <div className="space-y-1.5 text-xs text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <span><span className="font-bold">Smart Descriptions:</span> Generate 3 AI description options (Professional, Friendly, Detailed) - choose your favorite or write manually</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">📸</span>
              <span><span className="font-bold">Image Quality Check:</span> AI analyzes resolution, clarity, lighting & provides quality ratings (1-10) with recommendations</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🔊</span>
              <span><span className="font-bold">Voice Narrator:</span> Enable narrator for audio feedback on your actions and form updates</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🏗️</span>
              <span><span className="font-bold">Dual Categories:</span> Choose between Artisan (pottery, batik, wood carving) or Material Supplier categories</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span><span className="font-bold">Quality Assurance:</span> System warns about low-quality images before submission</span>
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm font-bold text-blue-900 mb-2">💡 Pro Tips for Best Results</p>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Upload images with <span className="font-bold">1024x768 resolution or higher</span> for best quality ratings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use <span className="font-bold">well-lit, clear photos</span> of your workspace, products, or services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Try all 3 AI description options before choosing or creating manually</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Enable narrator mode for <span className="font-bold">hands-free guidance</span> through the form</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Review AI quality feedback and improve low-rated images before submitting</span>
            </li>
          </ul>
        </div>
      </form>

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
        
        /* Color utility classes for dynamic ratings */
        .bg-green-500 { background-color: #10b981; }
        .bg-yellow-500 { background-color: #f59e0b; }
        .bg-red-500 { background-color: #ef4444; }
        .text-green-600 { color: #059669; }
        .text-yellow-600 { color: #d97706; }
        .text-red-600 { color: #dc2626; }
        .text-green-700 { color: #047857; }
        .text-yellow-700 { color: #b45309; }
        .text-red-700 { color: #b91c1c; }
      `}</style>
    </div>
  );
}