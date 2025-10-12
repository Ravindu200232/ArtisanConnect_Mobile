import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Swal from "sweetalert2";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const geminiApiKey = "AIzaSyAVgz2HPFXDfUQLLOaiGVvwbtuqJDisLbA";
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Category configurations
const productCategories = [
  {
    value: "bathics",
    label: "Bathics",
    descPrompt: "traditional Sri Lankan batik fabric",
  },
  {
    value: "woodenCrafts",
    label: "Wooden Crafts",
    descPrompt: "handcrafted wooden item",
  },
  {
    value: "brassCrafts",
    label: "Brass Crafts",
    descPrompt: "traditional brass craft",
  },
  {
    value: "pottery",
    label: "Pottery",
    descPrompt: "handcrafted ceramic pottery",
  },
  {
    value: "jewelry",
    label: "Traditional Jewelry",
    descPrompt: "traditional jewelry",
  },
  {
    value: "masks",
    label: "Traditional Masks",
    descPrompt: "traditional ceremonial mask",
  },
  {
    value: "handloom",
    label: "Handloom Textiles",
    descPrompt: "handloom textile",
  },
  {
    value: "lacquerware",
    label: "Lacquerware",
    descPrompt: "traditional lacquerware",
  },
  {
    value: "drums",
    label: "Traditional Drums",
    descPrompt: "traditional drum",
  },
  { value: "spices", label: "Spices", descPrompt: "premium spices" },
  { value: "tea", label: "Ceylon Tea", descPrompt: "Ceylon tea" },
  { value: "gems", label: "Gems & Stones", descPrompt: "natural gemstones" },
];

const materialCategories = [
  {
    value: "fabric",
    label: "Fabric Materials",
    descPrompt: "quality fabric material",
  },
  {
    value: "wood",
    label: "Wood Materials",
    descPrompt: "premium wood material",
  },
  {
    value: "clay",
    label: "Clay & Pottery Materials",
    descPrompt: "pottery clay",
  },
  {
    value: "metal",
    label: "Metal & Brass Materials",
    descPrompt: "metal materials",
  },
  { value: "paint", label: "Paints & Dyes", descPrompt: "paints and dyes" },
  { value: "thread", label: "Thread & Yarn", descPrompt: "thread and yarn" },
  { value: "beads", label: "Beads & Stones", descPrompt: "decorative beads" },
  { value: "tools", label: "Crafting Tools", descPrompt: "crafting tools" },
  {
    value: "finishing",
    label: "Finishing Materials",
    descPrompt: "finishing materials",
  },
  {
    value: "packaging",
    label: "Packaging Materials",
    descPrompt: "packaging materials",
  },
];

const tourismCategories = [
  {
    value: "cultural",
    label: "Cultural Tours",
    descPrompt: "cultural heritage tour",
  },
  {
    value: "adventure",
    label: "Adventure Tours",
    descPrompt: "adventure experience",
  },
  { value: "beach", label: "Beach Holidays", descPrompt: "beach vacation" },
  {
    value: "wildlife",
    label: "Wildlife Safaris",
    descPrompt: "wildlife safari",
  },
  {
    value: "hillCountry",
    label: "Hill Country Tours",
    descPrompt: "hill country exploration",
  },
  {
    value: "ayurveda",
    label: "Ayurveda & Wellness",
    descPrompt: "wellness retreat",
  },
  {
    value: "honeymoon",
    label: "Honeymoon Packages",
    descPrompt: "romantic getaway",
  },
  {
    value: "family",
    label: "Family Vacations",
    descPrompt: "family-friendly tour",
  },
  {
    value: "budget",
    label: "Budget Travel",
    descPrompt: "affordable travel package",
  },
  {
    value: "luxury",
    label: "Luxury Experiences",
    descPrompt: "premium luxury tour",
  },
];

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
      htmlContainer: "text-green-700 text-xs",
    },
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
      htmlContainer: "text-red-700 text-xs",
    },
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
      htmlContainer: "text-amber-700 text-xs",
    },
  });
};

const showInfoNotification = (title, message, timer = 3000) => {
  return Swal.fire({
    title,
    text: message,
    icon: "info",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#f0f9ff",
    color: "#0c4a6e",
    iconColor: "#3b82f6",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-blue-200",
      title: "text-blue-800 font-bold text-sm",
      htmlContainer: "text-blue-700 text-xs",
    },
  });
};

const showConfirmationDialog = (
  title,
  text,
  confirmText = "Yes",
  cancelText = "Cancel"
) => {
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
      cancelButton: "rounded-xl font-bold px-6 py-2",
    },
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
      htmlContainer: "text-blue-700 text-xs",
    },
  });
};

export default function AddCollection() {
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state;

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("bathics");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const [imageQualityScores, setImageQualityScores] = useState([]);
  const [itemAvailable, setItemAvailable] = useState(true);
  const [sellerType, setSellerType] = useState("product");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isNarratorEnabled, setIsNarratorEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiDescriptionOptions, setAiDescriptionOptions] = useState([]);
  const [selectedDescriptionOption, setSelectedDescriptionOption] =
    useState(null);
  const [showDescriptionOptions, setShowDescriptionOptions] = useState(false);
  const [useManualDescription, setUseManualDescription] = useState(false);

  // Tourism Package Specific Fields
  const [packageDuration, setPackageDuration] = useState("");
  const [packageInclusions, setPackageInclusions] = useState("");
  const [packageExclusions, setPackageExclusions] = useState("");
  const [packageItinerary, setPackageItinerary] = useState("");
  const [packageHighlights, setPackageHighlights] = useState("");
  const [packageAccommodation, setPackageAccommodation] = useState("");
  const [packageTransport, setPackageTransport] = useState("");
  const [packageMeals, setPackageMeals] = useState("");
  const [packageGroupSize, setPackageGroupSize] = useState("");
  const [packageDifficulty, setPackageDifficulty] = useState("easy");

  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);

  const speechSynthesis = window.speechSynthesis;

  const speakText = (text) => {
    if (!isNarratorEnabled || !text?.trim()) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";
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

  // Generate Complete Tourism Package with AI
  const generateTourismPackage = async () => {
    if (!itemName.trim()) {
      showErrorNotification(
        "Package Name Required",
        "Please enter package name first"
      );
      return;
    }

    setIsGeneratingPackage(true);
    const loadingNotification = showLoadingNotification(
      "Generating Package",
      "AI is creating your complete tourism package..."
    );

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const categoryInfo = tourismCategories.find(
        (c) => c.value === itemCategory
      );

      const prompt = `Create a comprehensive tourism package for "${itemName}" in Sri Lanka. Category: ${
        categoryInfo?.label || "General Tour"
      }.
Price: ${itemPrice ? `Rs. ${itemPrice}` : "Not specified"}

Generate a complete package with:
1. Package Description (200-250 chars)
2. Duration (e.g., "3 days 2 nights")
3. Key Highlights (3-5 bullet points)
4. Detailed Itinerary (day-by-day)
5. Inclusions (what's included)
6. Exclusions (what's not included)
7. Accommodation details
8. Transport details
9. Meals included
10. Recommended group size
11. Difficulty level (easy/moderate/difficult)

Respond in JSON format:
{
  "description": "comprehensive package description",
  "duration": "package duration",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "itinerary": "detailed day-by-day itinerary",
  "inclusions": ["inclusion1", "inclusion2", "inclusion3"],
  "exclusions": ["exclusion1", "exclusion2"],
  "accommodation": "accommodation details",
  "transport": "transport details", 
  "meals": "meals included",
  "groupSize": "recommended group size",
  "difficulty": "easy/moderate/difficult"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const packageData = JSON.parse(jsonMatch[0]);

        // Set all package fields
        setItemDescription(packageData.description);
        setPackageDuration(packageData.duration);
        setPackageHighlights(packageData.highlights?.join("\n• ") || "");
        setPackageItinerary(packageData.itinerary);
        setPackageInclusions(packageData.inclusions?.join("\n• ") || "");
        setPackageExclusions(packageData.exclusions?.join("\n• ") || "");
        setPackageAccommodation(packageData.accommodation);
        setPackageTransport(packageData.transport);
        setPackageMeals(packageData.meals);
        setPackageGroupSize(packageData.groupSize);
        setPackageDifficulty(packageData.difficulty || "easy");

        Swal.close();
        showSuccessNotification(
          "Package Generated!",
          "Complete tourism package created successfully!"
        );
        if (isNarratorEnabled)
          speakText(
            "AI has generated a complete tourism package with itinerary, inclusions, and all details"
          );
      }
    } catch (error) {
      console.error("Package generation error:", error);
      Swal.close();
      showErrorNotification(
        "Generation Failed",
        "Failed to generate package. Please fill manually."
      );
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  // Image quality analysis
  const analyzeImageQuality = async (file) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const img = new Image();
      const dimensionsPromise = new Promise((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(file);
      });
      const dimensions = await dimensionsPromise;

      const prompt = `Analyze this ${
        sellerType === "tourism" ? "tourism destination" : "product"
      } image for quality. Rate 1-10.
Consider: resolution (${dimensions.width}x${
        dimensions.height
      }), lighting, clarity, professional appearance.
Respond JSON: {"rating": <1-10>, "resolution": "${dimensions.width}x${
        dimensions.height
      }", "fileSize": "${(file.size / 1024).toFixed(
        1
      )}KB", "quality": "<excellent/good/fair/poor>", "feedback": "<brief assessment>", "recommendations": "<suggestions>"}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType: file.type, data: base64Data } },
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);

      return {
        rating: dimensions.width >= 800 && dimensions.height >= 600 ? 8 : 6,
        resolution: `${dimensions.width}x${dimensions.height}`,
        fileSize: `${(file.size / 1024).toFixed(1)}KB`,
        quality: dimensions.width >= 800 ? "good" : "fair",
        feedback: "Image uploaded",
        recommendations:
          dimensions.width < 800
            ? "Use 800x600+ for better quality"
            : "Good quality",
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
    const loadingNotification = showLoadingNotification(
      "Analyzing Images",
      `AI is analyzing ${files.length} image${
        files.length > 1 ? "s" : ""
      } for quality...`
    );
    if (isNarratorEnabled)
      speakText(
        `Analyzing ${files.length} image${files.length > 1 ? "s" : ""}`
      );

    const qualities = await Promise.all(
      files.map((f) => analyzeImageQuality(f))
    );
    setItemImages((prev) => [...prev, ...files]);
    setImageQualityScores((prev) => [...prev, ...qualities]);

    Swal.close();

    const avgRating =
      qualities.reduce((sum, q) => sum + (q?.rating || 0), 0) /
      qualities.length;
    const excellentCount = qualities.filter((q) => q?.rating >= 8).length;
    const poorCount = qualities.filter((q) => q?.rating < 6).length;

    if (avgRating >= 8) {
      showSuccessNotification(
        "Excellent Quality!",
        `${excellentCount} image${excellentCount > 1 ? "s" : ""} rated 8+`
      );
      if (isNarratorEnabled)
        speakText(
          `Excellent image quality. Average rating ${avgRating.toFixed(
            1
          )} out of 10`
        );
    } else if (avgRating >= 6) {
      showInfoNotification("Good Quality", "Images meet quality standards");
      if (isNarratorEnabled)
        speakText(
          `Good image quality. Average rating ${avgRating.toFixed(1)} out of 10`
        );
    } else {
      showWarningNotification(
        "Quality Warning",
        `${poorCount} low quality image${poorCount > 1 ? "s" : ""} detected`
      );
      if (isNarratorEnabled)
        speakText(
          `Warning: Low quality images. Average rating ${avgRating.toFixed(
            1
          )} out of 10`
        );
    }
    setIsAnalyzingImage(false);
  };

  // Generate 3 AI description options
  const generateDescriptionOptions = async () => {
    if (!itemName.trim()) {
      showErrorNotification(
        "Item Name Required",
        "Please enter item name first"
      );
      return;
    }

    setIsGeneratingDescription(true);
    setShowDescriptionOptions(true);
    const loadingNotification = showLoadingNotification(
      "Generating Descriptions",
      "AI is creating 3 description options for you..."
    );

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const categories =
        sellerType === "product"
          ? productCategories
          : sellerType === "material"
          ? materialCategories
          : tourismCategories;
      const categoryInfo = categories.find((c) => c.value === itemCategory);

      const prompt = `Create 3 professional ${sellerType} descriptions for "${itemName}". ${
        categoryInfo
          ? `Category: ${categoryInfo.label}. ${categoryInfo.descPrompt}`
          : ""
      }
${itemPrice ? `Price: Rs. ${itemPrice}` : ""}

Generate: 1. Professional (150-180 chars), 2. Friendly (150-180 chars), 3. Detailed (150-180 chars)
JSON format: {"options": [{"style": "Professional", "description": "..."}, {"style": "Friendly", "description": "..."}, {"style": "Detailed", "description": "..."}]}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiDescriptionOptions(parsed.options);
        Swal.close();
        showSuccessNotification(
          "Descriptions Ready!",
          "3 AI description options generated successfully!"
        );
        if (isNarratorEnabled)
          speakText("Three AI description options generated successfully");
      }
    } catch (error) {
      console.error("Description generation error:", error);
      Swal.close();
      showErrorNotification(
        "Generation Failed",
        "Failed to generate options. Try manual."
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const selectDescriptionOption = (option) => {
    setSelectedDescriptionOption(option);
    setItemDescription(option.description);
    showSuccessNotification(
      "Description Selected!",
      `${option.style} description applied`
    );
    if (isNarratorEnabled) speakText(`${option.style} description selected`);
  };

  const removeLowQualityImages = async () => {
    const lowIndices = imageQualityScores
      .map((q, idx) => (q && q.rating < 5 ? idx : -1))
      .filter((idx) => idx !== -1);

    if (lowIndices.length === 0) {
      showInfoNotification(
        "No Action Needed",
        "No low quality images to remove"
      );
      return;
    }

    const result = await showConfirmationDialog(
      "Remove Low Quality Images",
      `Remove ${lowIndices.length} low quality image${
        lowIndices.length > 1 ? "s" : ""
      }?`,
      "Remove Now",
      "Keep Them"
    );

    if (result.isConfirmed) {
      setItemImages(itemImages.filter((_, idx) => !lowIndices.includes(idx)));
      setImageQualityScores(
        imageQualityScores.filter((_, idx) => !lowIndices.includes(idx))
      );
      showSuccessNotification(
        "Images Removed",
        `${lowIndices.length} low quality image${
          lowIndices.length > 1 ? "s" : ""
        } removed`
      );
      if (isNarratorEnabled)
        speakText(`Removed ${lowIndices.length} low quality images`);
    }
  };

  const clearAllImages = async () => {
    if (itemImages.length === 0) {
      showInfoNotification("No Images", "No images to clear");
      return;
    }

    const result = await showConfirmationDialog(
      "Clear All Images",
      `Remove all ${itemImages.length} image${
        itemImages.length > 1 ? "s" : ""
      }?`,
      "Clear All",
      "Cancel"
    );

    if (result.isConfirmed) {
      setItemImages([]);
      setImageQualityScores([]);
      showSuccessNotification("Cleared All", "All images removed successfully");
      if (isNarratorEnabled) speakText("All images cleared");
    }
  };

  // Add these new state variables after the existing useState declarations (around line 155)

  const [storyVideo, setStoryVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoQuality, setVideoQuality] = useState(null);

  // Add this video validation and analysis function after analyzeImageQuality function

  const analyzeVideoQuality = async (file) => {
    try {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return {
          valid: false,
          error: "Video exceeds 50MB limit",
          fileSize: fileSizeMB + "MB",
        };
      }

      // Get video duration and dimensions
      const video = document.createElement("video");
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

          // Quality assessment
          if (duration > 60) {
            quality = "warning";
            rating = 6;
            feedback = "Video is quite long";
            recommendations =
              "Consider shorter videos (30-60s) for better engagement";
          }

          if (width < 720 || height < 720) {
            quality = "fair";
            rating = 5;
            feedback = "Low resolution video";
            recommendations = "Use 720p or higher for better quality";
          }

          if (fileSizeMB > 40) {
            recommendations +=
              (recommendations ? " • " : "") +
              "Consider compressing to reduce file size";
          }

          resolve({
            valid: true,
            rating,
            duration: duration + "s",
            resolution: `${width}x${height}`,
            fileSize: fileSizeMB + "MB",
            quality,
            feedback,
            recommendations: recommendations || "Excellent video quality",
          });
        };

        video.onerror = () => {
          URL.revokeObjectURL(videoURL);
          resolve({
            valid: false,
            error: "Invalid video file",
            fileSize: fileSizeMB + "MB",
          });
        };

        video.src = videoURL;
      });
    } catch (error) {
      console.error("Video analysis error:", error);
      return {
        valid: false,
        error: "Failed to analyze video",
      };
    }
  };

  // Add this video upload handler

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      showErrorNotification("Invalid File", "Please upload a video file");
      return;
    }

    setIsAnalyzingVideo(true);
    const loadingNotification = showLoadingNotification(
      "Analyzing Video",
      "AI is analyzing your story video..."
    );
    if (isNarratorEnabled) speakText("Analyzing video");

    const quality = await analyzeVideoQuality(file);

    Swal.close();

    if (!quality.valid) {
      showErrorNotification("Video Error", quality.error);
      if (isNarratorEnabled) speakText("Video upload failed: " + quality.error);
      setIsAnalyzingVideo(false);
      return;
    }

    setStoryVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoQuality(quality);

    if (quality.rating >= 7) {
      showSuccessNotification(
        "Great Video!",
        `Duration: ${quality.duration}, Quality: ${quality.quality}`
      );
      if (isNarratorEnabled)
        speakText(
          `Excellent video quality. Rating ${quality.rating} out of 10`
        );
    } else {
      showWarningNotification("Video Accepted", quality.recommendations);
      if (isNarratorEnabled)
        speakText(`Video accepted with rating ${quality.rating} out of 10`);
    }

    setIsAnalyzingVideo(false);
  };

  const removeVideo = async () => {
    const result = await showConfirmationDialog(
      "Remove Video",
      "Remove the story video?",
      "Remove",
      "Keep"
    );

    if (result.isConfirmed) {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setStoryVideo(null);
      setVideoPreview(null);
      setVideoQuality(null);
      showSuccessNotification("Video Removed", "Story video removed");
      if (isNarratorEnabled) speakText("Video removed");
    }
  };

  // Update the handleAddItem function to include video upload (replace the existing function around line 600)

  async function handleAddItem() {
    const token = localStorage.getItem("token");

    if (!token) {
      showErrorNotification("Authentication Required", "Please login first");
      return;
    }

    if (!itemName || !itemPrice || !itemDescription) {
      showErrorNotification(
        "Missing Information",
        "Please fill all required fields"
      );
      return;
    }

    if (itemImages.length === 0) {
      showErrorNotification("Images Required", "Please add at least one image");
      return;
    }

    // Tourism package validation
    if (sellerType === "tourism") {
      if (!packageDuration || !packageInclusions || !packageItinerary) {
        showErrorNotification(
          "Package Details Required",
          "Please fill all tourism package required fields"
        );
        return;
      }
    }

    const lowQuality = imageQualityScores.filter((q) => q && q.rating < 5);
    if (lowQuality.length > 0) {
      const result = await showConfirmationDialog(
        "Low Quality Images",
        `${lowQuality.length} image${
          lowQuality.length > 1 ? "s" : ""
        } have low quality. Continue anyway?`,
        "Continue Anyway",
        "Cancel"
      );
      if (!result.isConfirmed) return;
    }

    setIsLoading(true);
    const loadingNotification = showLoadingNotification(
      "Adding Item",
      `${
        sellerType === "tourism" ? "Package" : "Item"
      } is being added to your collection...`
    );

    if (isNarratorEnabled) speakText("Submitting your item. Please wait.");

    try {
      // Upload images
      const uploadPromises = itemImages.map((img) => mediaUpload(img));
      const imageUrls = await Promise.all(uploadPromises);

      // Upload video if present
      let videoUrl = null;
      if (storyVideo) {
        try {
          Swal.update({
            title: "Uploading Video",
            text: "Uploading story video... This may take a moment.",
          });
          videoUrl = await mediaUpload(storyVideo);
          if (isNarratorEnabled) speakText("Video uploaded successfully");
        } catch (videoError) {
          console.error("Video upload error:", videoError);
          showWarningNotification(
            "Video Upload Failed",
            "Item will be added without story video"
          );
        }
      }

      const payload = {
        shopId,
        name: itemName,
        price: itemPrice,
        category: itemCategory,
        description: itemDescription,
        available: itemAvailable,
        images: imageUrls,
        sellerType: sellerType,
        storyVideo: videoUrl,
      };

      // Add tourism package specific fields
      if (sellerType === "tourism") {
        payload.tourismPackage = {
          duration: packageDuration,
          inclusions: packageInclusions,
          exclusions: packageExclusions,
          itinerary: packageItinerary,
          highlights: packageHighlights,
          accommodation: packageAccommodation,
          transport: packageTransport,
          meals: packageMeals,
          groupSize: packageGroupSize,
          difficulty: packageDifficulty,
        };
      }

      const result = await axios.post(
        `${backendUrl}/api/v1/collection`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.close();
      showSuccessNotification(
        "Success!",
        `${sellerType === "tourism" ? "Package" : "Item"} added successfully!`,
        2000
      );

      if (isNarratorEnabled) speakText("Item added successfully! Redirecting.");

      // Show success confirmation before redirecting
      setTimeout(() => {
        showSuccessNotification(
          "Redirecting...",
          `Taking you back to your ${sellerType} collection`,
          1000
        );
        setTimeout(() => navigate("/shopC/shop"), 1200);
      }, 1500);
    } catch (err) {
      Swal.close();
      const errorMessage =
        err.response?.data?.error || "Failed to add item. Please try again.";
      showErrorNotification("Failed to Add", errorMessage);
      if (isNarratorEnabled) speakText("Failed to add item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when seller type changes
  const handleSellerTypeChange = (type) => {
    setSellerType(type);
    if (type === "product") {
      setItemCategory("bathics");
    } else if (type === "material") {
      setItemCategory("fabric");
    } else if (type === "tourism") {
      setItemCategory("cultural");
    }

    // Clear tourism specific fields when switching away from tourism
    if (type !== "tourism") {
      setPackageDuration("");
      setPackageInclusions("");
      setPackageExclusions("");
      setPackageItinerary("");
      setPackageHighlights("");
      setPackageAccommodation("");
      setPackageTransport("");
      setPackageMeals("");
      setPackageGroupSize("");
      setPackageDifficulty("easy");
    }

    showInfoNotification(
      "Mode Changed",
      `${type.charAt(0).toUpperCase() + type.slice(1)} seller mode activated`
    );
    if (isNarratorEnabled) speakText(`${type} seller selected`);
  };

  // Handle narrator toggle with notification
  const handleNarratorToggle = () => {
    const newState = !isNarratorEnabled;
    setIsNarratorEnabled(newState);

    if (newState) {
      showSuccessNotification(
        "Narrator Enabled",
        "Voice guidance is now active"
      );
      speakText(
        "Narrator enabled. You will now receive audio feedback for your actions."
      );
    } else {
      stopSpeaking();
      showInfoNotification("Narrator Disabled", "Voice guidance turned off");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (isNarratorEnabled) speakText("Returning to shop");
                navigate("/shopC/shop");
              }}
              className="w-9 h-9 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white">Add New Item</h1>
              <p className="text-orange-100 text-xs mt-0.5">
                ✨ AI Quality Check
              </p>
            </div>
            <button
              onClick={handleNarratorToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isNarratorEnabled ? "bg-green-500" : "bg-white bg-opacity-20"
              }`}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Narrator Status */}
        {isNarratorEnabled && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className={`w-5 h-5 text-green-600 ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <span className="text-sm font-bold text-green-800">
                {isSpeaking ? "🔊 Speaking..." : "✓ Narrator Active"}
              </span>
            </div>
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-bold"
              >
                Stop
              </button>
            )}
          </div>
        )}
        {/* Seller Type */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Seller Type <span className="text-[#F85606]">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSellerTypeChange("product")}
              className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                sellerType === "product"
                  ? "border-[#F85606] bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div
                  className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                    sellerType === "product" ? "bg-[#F85606]" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-lg">🛍️</span>
                </div>
                <span
                  className={`text-xs font-bold block ${
                    sellerType === "product"
                      ? "text-[#F85606]"
                      : "text-gray-600"
                  }`}
                >
                  Products
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSellerTypeChange("material")}
              className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                sellerType === "material"
                  ? "border-[#F85606] bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div
                  className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                    sellerType === "material" ? "bg-[#F85606]" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-lg">⚒️</span>
                </div>
                <span
                  className={`text-xs font-bold block ${
                    sellerType === "material"
                      ? "text-[#F85606]"
                      : "text-gray-600"
                  }`}
                >
                  Materials
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSellerTypeChange("tourism")}
              className={`p-3 rounded-xl border-2 transition-all active:scale-95 ${
                sellerType === "tourism"
                  ? "border-[#F85606] bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="text-center">
                <div
                  className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                    sellerType === "tourism" ? "bg-[#F85606]" : "bg-gray-300"
                  }`}
                >
                  <span className="text-white text-lg">✈️</span>
                </div>
                <span
                  className={`text-xs font-bold block ${
                    sellerType === "tourism"
                      ? "text-[#F85606]"
                      : "text-gray-600"
                  }`}
                >
                  Tourism
                </span>
              </div>
            </button>
          </div>
        </div>
        {/* Item Name */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {sellerType === "tourism" ? "Package Name" : "Item Name"}{" "}
            <span className="text-[#F85606]">*</span>
          </label>
          <input
            type="text"
            placeholder={
              sellerType === "tourism"
                ? "Enter tour package name"
                : `Enter ${sellerType} name`
            }
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onFocus={() =>
              handleFieldFocus(
                sellerType === "tourism" ? "Package name" : "Item name"
              )
            }
            onBlur={() =>
              isNarratorEnabled &&
              itemName &&
              speakText(
                `${
                  sellerType === "tourism" ? "Package" : "Item"
                } name entered: ${itemName}`
              )
            }
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
          />
        </div>
        {/* Price */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Price (Rs.) <span className="text-[#F85606]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
              Rs.
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              onFocus={() => handleFieldFocus("Price")}
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
            {(sellerType === "product"
              ? productCategories
              : sellerType === "material"
              ? materialCategories
              : tourismCategories
            ).map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        {/* Tourism Package Generator */}
        {sellerType === "tourism" && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-md p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="text-lg">✨</span>
                AI Tourism Package Generator
              </label>
              <button
                type="button"
                onClick={generateTourismPackage}
                disabled={isGeneratingPackage || !itemName.trim()}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingPackage ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    Generate Package
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              AI will create complete package with itinerary, inclusions,
              accommodation, and all details automatically.
            </p>
          </div>
        )}
        {/* Tourism Package Specific Fields */}
        {sellerType === "tourism" && (
          <div className="space-y-3">
            {/* Package Duration */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Package Duration <span className="text-[#F85606]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 3 days 2 nights"
                value={packageDuration}
                onChange={(e) => setPackageDuration(e.target.value)}
                onFocus={() => handleFieldFocus("Package duration")}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
              />
            </div>

            {/* Package Highlights */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Key Highlights
              </label>
              <textarea
                placeholder="• Visit ancient temples&#10;• Wildlife safari experience&#10;• Beach relaxation"
                value={packageHighlights}
                onChange={(e) => setPackageHighlights(e.target.value)}
                onFocus={() => handleFieldFocus("Package highlights")}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm resize-none"
                rows="3"
              />
            </div>

            {/* Package Itinerary */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Detailed Itinerary <span className="text-[#F85606]">*</span>
              </label>
              <textarea
                placeholder="Day 1: Arrival and city tour...&#10;Day 2: Cultural sites visit...&#10;Day 3: Departure..."
                value={packageItinerary}
                onChange={(e) => setPackageItinerary(e.target.value)}
                onFocus={() => handleFieldFocus("Package itinerary")}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm resize-none"
                rows="4"
              />
            </div>

            {/* Package Inclusions & Exclusions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Inclusions <span className="text-[#F85606]">*</span>
                </label>
                <textarea
                  placeholder="• Accommodation&#10;• Meals&#10;• Transport"
                  value={packageInclusions}
                  onChange={(e) => setPackageInclusions(e.target.value)}
                  onFocus={() => handleFieldFocus("Package inclusions")}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm resize-none"
                  rows="3"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Exclusions
                </label>
                <textarea
                  placeholder="• Airfare&#10;• Personal expenses&#10;• Travel insurance"
                  value={packageExclusions}
                  onChange={(e) => setPackageExclusions(e.target.value)}
                  onFocus={() => handleFieldFocus("Package exclusions")}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm resize-none"
                  rows="3"
                />
              </div>
            </div>

            {/* Additional Package Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Accommodation
                </label>
                <input
                  type="text"
                  placeholder="3-star hotels, resorts"
                  value={packageAccommodation}
                  onChange={(e) => setPackageAccommodation(e.target.value)}
                  onFocus={() => handleFieldFocus("Accommodation")}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Transport
                </label>
                <input
                  type="text"
                  placeholder="Private AC vehicle"
                  value={packageTransport}
                  onChange={(e) => setPackageTransport(e.target.value)}
                  onFocus={() => handleFieldFocus("Transport")}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Meals
                </label>
                <input
                  type="text"
                  placeholder="Breakfast & dinner"
                  value={packageMeals}
                  onChange={(e) => setPackageMeals(e.target.value)}
                  onFocus={() => handleFieldFocus("Meals")}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Group Size
                </label>
                <input
                  type="text"
                  placeholder="2-15 people"
                  value={packageGroupSize}
                  onChange={(e) => setPackageGroupSize(e.target.value)}
                  onFocus={() => handleFieldFocus("Group size")}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Difficulty
                </label>
                <select
                  value={packageDifficulty}
                  onChange={(e) => setPackageDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] bg-white text-sm appearance-none"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
            </div>
          </div>
        )}
        {/* AI Description Options */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-md p-4 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-gray-800">
              Description <span className="text-[#F85606]">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setUseManualDescription(!useManualDescription);
                setShowDescriptionOptions(false);
                showInfoNotification(
                  "Mode Changed",
                  useManualDescription
                    ? "Switched to AI description mode"
                    : "Switched to manual description mode"
                );
                if (isNarratorEnabled)
                  speakText(
                    useManualDescription
                      ? "Switched to AI mode"
                      : "Switched to manual mode"
                  );
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                useManualDescription
                  ? "bg-gray-500 text-white"
                  : "bg-purple-600 text-white"
              }`}
            >
              {useManualDescription ? "📝 Manual" : "🤖 AI"}
            </button>
          </div>

          {!useManualDescription && (
            <>
              <button
                type="button"
                onClick={generateDescriptionOptions}
                disabled={isGeneratingDescription || !itemName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-50 mb-3"
              >
                {isGeneratingDescription ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate 3 AI Options
                  </>
                )}
              </button>

              {showDescriptionOptions && aiDescriptionOptions.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs font-bold text-purple-800">
                    Choose your preferred style:
                  </p>
                  {aiDescriptionOptions.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectDescriptionOption(option)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedDescriptionOption?.style === option.style
                          ? "border-purple-600 bg-purple-100"
                          : "border-purple-200 bg-white hover:border-purple-400"
                      }`}
                    >
                      <p className="text-xs font-bold text-purple-700 mb-1">
                        {idx + 1}. {option.style}
                      </p>
                      <p className="text-xs text-gray-700">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <textarea
            placeholder={
              sellerType === "tourism"
                ? "Describe this tour package..."
                : `Describe this ${sellerType}...`
            }
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            onFocus={() =>
              isNarratorEnabled && speakText("Description field focused")
            }
            readOnly={!useManualDescription && selectedDescriptionOption}
            className={`w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none text-sm ${
              !useManualDescription && selectedDescriptionOption
                ? "bg-purple-50"
                : "bg-white"
            }`}
            rows="4"
          />
          <p className="text-xs text-gray-600 mt-2">
            {itemDescription.length} characters
          </p>
        </div>
        {/* Manual Image Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#F85606]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upload {sellerType === "tourism" ? "Tour" : "Product"} Images{" "}
            <span className="text-[#F85606]">*</span>
            {itemImages.length > 0 && (
              <span className="text-[#F85606]">({itemImages.length})</span>
            )}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center bg-orange-50/50">
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
              accept="image/*"
            />
            <label htmlFor="image-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F85606] to-[#FF7420] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-800 text-sm font-bold mb-1">
                  Tap to upload images
                </p>
                <p className="text-gray-500 text-xs">
                  AI will analyze quality • 800x600+ recommended
                </p>
              </div>
            </label>
          </div>
        </div>
        {/* Image Quality Report */}
        {itemImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#F85606]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Image Quality Report ({itemImages.length})
              </label>
              <div className="flex gap-2">
                {imageQualityScores.filter((q) => q && q.rating < 5).length >
                  0 && (
                  <button
                    type="button"
                    onClick={removeLowQualityImages}
                    className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold active:scale-95"
                  >
                    Remove Poor
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-xs bg-gray-500 text-white px-3 py-1.5 rounded-lg font-bold active:scale-95"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {itemImages.map((file, idx) => {
                const quality = imageQualityScores[idx];
                return (
                  <div
                    key={idx}
                    className="border-2 border-gray-200 rounded-xl p-3 bg-gray-50"
                  >
                    <div className="flex gap-3">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            Image {idx + 1}
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              const result = await showConfirmationDialog(
                                "Remove Image",
                                "Remove this image from your uploads?",
                                "Remove",
                                "Keep"
                              );
                              if (result.isConfirmed) {
                                setItemImages(
                                  itemImages.filter((_, i) => i !== idx)
                                );
                                setImageQualityScores(
                                  imageQualityScores.filter((_, i) => i !== idx)
                                );
                                showSuccessNotification(
                                  "Image Removed",
                                  "Image removed from uploads"
                                );
                              }
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>

                        {quality ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    quality.rating >= 8
                                      ? "bg-green-500"
                                      : quality.rating >= 6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${quality.rating * 10}%` }}
                                />
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  quality.rating >= 8
                                    ? "text-green-600"
                                    : quality.rating >= 6
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {quality.rating}/10
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <p className="text-xs text-gray-600">
                                <span className="font-bold">📐</span>{" "}
                                {quality.resolution}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-bold">💾</span>{" "}
                                {quality.fileSize}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  quality.rating >= 8
                                    ? "text-green-700"
                                    : quality.rating >= 6
                                    ? "text-yellow-700"
                                    : "text-red-700"
                                }`}
                              >
                                <span className="font-bold">⭐</span>{" "}
                                {quality.quality.toUpperCase()}
                              </p>
                              {quality.feedback && (
                                <p className="text-xs text-gray-700 mt-1 italic">
                                  💬 {quality.feedback}
                                </p>
                              )}
                              {quality.recommendations &&
                                quality.rating < 8 && (
                                  <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 p-2 rounded border border-orange-200">
                                    💡 {quality.recommendations}
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
                <span>📊 Overall Quality</span>
                {isNarratorEnabled &&
                  imageQualityScores.filter((q) => q).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const avgRating = (
                          imageQualityScores.reduce(
                            (sum, q) => sum + (q?.rating || 0),
                            0
                          ) / imageQualityScores.filter((q) => q).length
                        ).toFixed(1);
                        const excellent = imageQualityScores.filter(
                          (q) => q?.rating >= 8
                        ).length;
                        const good = imageQualityScores.filter(
                          (q) => q?.rating >= 6 && q?.rating < 8
                        ).length;
                        const poor = imageQualityScores.filter(
                          (q) => q?.rating < 6
                        ).length;
                        speakText(
                          `Quality summary: Average rating ${avgRating} out of 10. ${excellent} excellent, ${good} good, ${poor} poor images`
                        );
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                      Read
                    </button>
                  )}
              </p>
              {imageQualityScores.filter((q) => q).length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center mb-2">
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <p className="text-xl font-bold text-green-600">
                        {
                          imageQualityScores.filter((q) => q?.rating >= 8)
                            .length
                        }
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Excellent
                      </p>
                      <p className="text-xs text-green-600">8-10★</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                      <p className="text-xl font-bold text-yellow-600">
                        {
                          imageQualityScores.filter(
                            (q) => q?.rating >= 6 && q?.rating < 8
                          ).length
                        }
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Good</p>
                      <p className="text-xs text-yellow-600">6-7★</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                      <p className="text-xl font-bold text-red-600">
                        {imageQualityScores.filter((q) => q?.rating < 6).length}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Poor</p>
                      <p className="text-xs text-red-600">1-5★</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-300">
                    <p className="text-xs text-gray-700 text-center">
                      Average:{" "}
                      <span className="font-bold text-blue-600">
                        {(
                          imageQualityScores.reduce(
                            (sum, q) => sum + (q?.rating || 0),
                            0
                          ) / imageQualityScores.filter((q) => q).length
                        ).toFixed(1)}
                        /10
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <p className="text-xs text-gray-600">Analyzing...</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Story Video Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#F85606]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
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
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-800 text-sm font-bold mb-1">
                    Tap to upload story video
                  </p>
                  <p className="text-gray-500 text-xs">
                    Max 50MB • MP4, MOV, AVI supported
                  </p>
                  <p className="text-purple-600 text-xs mt-2">
                    📱 Perfect for product demos & tours!
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Video Preview */}
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-80 object-contain"
                  onFocus={() => handleFieldFocus("Story video preview")}
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-transform"
                >
                  ×
                </button>
              </div>

              {/* Video Quality Report */}
              {videoQuality && (
                <div className="border-2 border-purple-200 rounded-xl p-3 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Video Quality Report
                    </label>
                    {isNarratorEnabled && (
                      <button
                        type="button"
                        onClick={() =>
                          speakText(
                            `Video quality: ${videoQuality.feedback}. Duration ${videoQuality.duration}, resolution ${videoQuality.resolution}, file size ${videoQuality.fileSize}`
                          )
                        }
                        className="text-xs bg-purple-500 text-white px-2 py-1 rounded flex items-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                        Read
                      </button>
                    )}
                  </div>

                  {/* Rating Bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          videoQuality.rating >= 7
                            ? "bg-green-500"
                            : videoQuality.rating >= 5
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${videoQuality.rating * 10}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        videoQuality.rating >= 7
                          ? "text-green-600"
                          : videoQuality.rating >= 5
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {videoQuality.rating}/10
                    </span>
                  </div>

                  {/* Video Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="text-sm font-bold text-purple-700">
                        {videoQuality.duration}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Resolution</p>
                      <p className="text-sm font-bold text-purple-700">
                        {videoQuality.resolution}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">File Size</p>
                      <p className="text-sm font-bold text-purple-700">
                        {videoQuality.fileSize}
                      </p>
                    </div>
                  </div>

                  {/* Quality Badge */}
                  <div
                    className={`text-center py-2 rounded-lg mb-2 ${
                      videoQuality.rating >= 7
                        ? "bg-green-100 text-green-800"
                        : videoQuality.rating >= 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <p className="text-xs font-bold">
                      ⭐ {videoQuality.quality.toUpperCase()} QUALITY
                    </p>
                  </div>

                  {/* Feedback */}
                  {videoQuality.feedback && (
                    <p className="text-xs text-gray-700 mb-2 bg-white p-2 rounded border border-purple-200">
                      💬{" "}
                      <span className="font-medium">
                        {videoQuality.feedback}
                      </span>
                    </p>
                  )}

                  {/* Recommendations */}
                  {videoQuality.recommendations && videoQuality.rating < 7 && (
                    <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded border border-purple-300 font-medium">
                      💡 {videoQuality.recommendations}
                    </p>
                  )}
                </div>
              )}

              {/* Replace Video Button */}
              <button
                type="button"
                onClick={() =>
                  document.getElementById("video-upload-replace").click()
                }
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
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
            </div>
          )}

          {isAnalyzingVideo && (
            <div className="flex items-center justify-center py-4 mt-3 bg-purple-50 rounded-xl">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
              <p className="text-sm text-purple-700 font-medium">
                Analyzing video...
              </p>
            </div>
          )}
        </div>
        {/* Video Features Info */}
        {storyVideo && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-bold text-gray-800">
                📱 Story Video Benefits
              </p>
            </div>
            <div className="space-y-1 text-xs text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  <span className="font-bold">3x More Engagement:</span> Videos
                  attract more customers
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  <span className="font-bold">Product Showcase:</span>{" "}
                  Demonstrate features & quality
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  <span className="font-bold">Build Trust:</span> Show authentic
                  product experience
                </span>
              </p>
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={async () => {
              if (isNarratorEnabled) speakText("Canceling");
              const result = await showConfirmationDialog(
                "Cancel Creation",
                "Are you sure you want to cancel? All unsaved changes will be lost.",
                "Yes, Cancel",
                "Continue Editing"
              );
              if (result.isConfirmed) {
                showInfoNotification("Cancelled", "Item creation cancelled");
                navigate("/shopC/shop");
              }
            }}
            className="bg-gray-400 text-white py-4 px-6 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={isLoading || itemImages.length === 0}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Add {sellerType === "tourism" ? "Package" : "Item"}
              </>
            )}
          </button>
        </div>
        {/* Feature Info Card */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="text-sm font-bold text-gray-800">
              ✨ Gemini AI Features
            </p>
          </div>
          <div className="space-y-1.5 text-xs text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <span>
                <span className="font-bold">Smart Descriptions:</span> Generate
                3 AI styles - choose best or write manually
              </span>
            </p>
            {sellerType === "tourism" && (
              <p className="flex items-start gap-2">
                <span className="text-lg">✈️</span>
                <span>
                  <span className="font-bold">Tourism Package AI:</span>{" "}
                  Complete package generation with itinerary, inclusions &
                  details
                </span>
              </p>
            )}
            <p className="flex items-start gap-2">
              <span className="text-lg">📸</span>
              <span>
                <span className="font-bold">Image Quality Check:</span> AI
                analyzes resolution, clarity & provides ratings with tips
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🔊</span>
              <span>
                <span className="font-bold">Voice Narrator:</span> Audio
                feedback for form updates & quality reports
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🛍️</span>
              <span>
                <span className="font-bold">Triple Mode:</span> Product seller,
                material supplier, or tourism package provider
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <span>
                <span className="font-bold">Quality Control:</span> Remove poor
                images & get warnings before submit
              </span>
            </p>
          </div>
        </div>
        {/* Tips Section */}
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm font-bold text-blue-900 mb-2">💡 Pro Tips</p>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Upload <span className="font-bold">800x600+ resolution</span>{" "}
                photos for best ratings
              </span>
            </li>
            {sellerType === "tourism" && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Use <span className="font-bold">AI Package Generator</span>{" "}
                  for complete tourism packages with itinerary
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Use <span className="font-bold">well-lit, clear images</span>{" "}
                with neutral backgrounds
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Try all 3 AI description styles before choosing or writing
                manually
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Enable narrator for{" "}
                <span className="font-bold">hands-free guidance</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Review quality feedback & improve low-rated images before
                submitting
              </span>
            </li>
          </ul>
        </div>
      </div>

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
