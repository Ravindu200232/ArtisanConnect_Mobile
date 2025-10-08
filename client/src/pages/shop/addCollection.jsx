import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import { GoogleGenerativeAI } from "@google/generative-ai";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const geminiApiKey = "AIzaSyAVgz2HPFXDfUQLLOaiGVvwbtuqJDisLbA";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(geminiApiKey);

export default function AddCollection() {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("bathics");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const [itemAvailable, setItemAvailable] = useState(true);
  const [sellerType, setSellerType] = useState("product");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showAIImageSection, setShowAIImageSection] = useState(false);
  const [customImagePrompt, setCustomImagePrompt] = useState("");
  const [retryCountdown, setRetryCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state;

  // Category options with AI prompts
  const productCategories = [
    { 
      value: "bathics", 
      label: "Bathics",
      imagePrompt: "A photorealistic product photograph of a traditional Sri Lankan batik fabric item with vibrant, intricate patterns in rich colors. The batik features hand-dyed organic patterns with traditional motifs. Professional studio lighting highlights the detailed wax-resist dyeing technique and flowing textile texture. The fabric is artfully arranged to show the beautiful patterns. Shot with professional product photography lighting against a neutral background.",
      descPrompt: "traditional Sri Lankan batik fabric with hand-dyed patterns"
    },
    { 
      value: "woodenCrafts", 
      label: "Wooden Crafts",
      imagePrompt: "A photorealistic product photograph of a finely crafted traditional wooden craft item. The piece showcases intricate hand-carved details with smooth, polished finish. Natural wood grain is visible, highlighting the craftsmanship. The item is beautifully lit with studio lighting to emphasize texture and detail. The background is clean and neutral, focusing attention on the wooden craft. Shot with professional product photography equipment.",
      descPrompt: "handcrafted wooden craft with intricate carvings"
    },
    { 
      value: "brassCrafts", 
      label: "Brass Crafts",
      imagePrompt: "A photorealistic product photograph of an elegant traditional brass craft item with golden metallic sheen. The piece features detailed embossed patterns and traditional designs. Professional studio lighting creates beautiful highlights and reflections on the polished brass surface. The craftsmanship is evident in the fine details. Shot against a dark or neutral background to make the brass shine. High-end product photography style.",
      descPrompt: "traditional brass craft with detailed embossed work"
    },
    { 
      value: "pottery", 
      label: "Pottery",
      imagePrompt: "A photorealistic product photograph of a handcrafted ceramic pottery piece with traditional glazing. The pottery shows beautiful earthen tones and artisanal texture. The piece has a rustic yet refined appearance with visible craftmanship marks. Professional lighting emphasizes the clay texture, glaze finish, and organic form. Shot with soft, natural-looking light against a complementary background.",
      descPrompt: "handcrafted ceramic pottery with traditional glazing"
    },
    { 
      value: "jewelry", 
      label: "Traditional Jewelry",
      imagePrompt: "A photorealistic luxury product photograph of exquisite traditional jewelry piece with intricate metalwork. The jewelry features detailed filigree work, possibly with gemstone accents. Professional macro photography lighting creates sparkle and highlights the fine craftsmanship. The piece is displayed on a jewelry stand or elegant surface. High-end jewelry photography with perfect focus and lighting.",
      descPrompt: "traditional handcrafted jewelry with intricate designs"
    },
    { 
      value: "masks", 
      label: "Traditional Masks",
      imagePrompt: "A photorealistic product photograph of a colorful traditional ceremonial mask with vibrant hand-painted details. The mask features bold colors, expressive features, and cultural motifs. Professional lighting highlights the three-dimensional carved texture and painted details. The mask is positioned to show its cultural significance and artistic value. Shot with museum-quality photography standards.",
      descPrompt: "traditional ceremonial mask with hand-painted details"
    },
    { 
      value: "handloom", 
      label: "Handloom Textiles",
      imagePrompt: "A photorealistic product photograph of beautiful handloom textile with intricate weaving patterns. The fabric shows traditional weaving techniques with visible texture and natural fibers. The textile is artfully draped or folded to display the weaving pattern and quality. Professional lighting enhances the texture and color richness. Shot with soft, even lighting that shows fabric details.",
      descPrompt: "handloom textile with traditional weaving patterns"
    },
    { 
      value: "lacquerware", 
      label: "Lacquerware",
      imagePrompt: "A photorealistic product photograph of a glossy lacquerware item with traditional designs. The piece features vibrant colors with high-gloss lacquer finish. Intricate painted details or carved patterns are visible. Professional studio lighting creates beautiful reflections on the lacquered surface. The craftsmanship and decorative elements are clearly visible. High-end product photography style.",
      descPrompt: "traditional lacquerware with hand-painted designs"
    },
    { 
      value: "drums", 
      label: "Traditional Drums",
      imagePrompt: "A photorealistic product photograph of a traditional drum with authentic construction. The drum shows natural wood body with leather drumhead stretched and tied with traditional methods. The wood grain and leather texture are visible. Professional lighting highlights the craftsmanship and cultural authenticity. Shot against a neutral background to emphasize the instrument.",
      descPrompt: "traditional handcrafted drum with authentic construction"
    },
    { 
      value: "spices", 
      label: "Spices",
      imagePrompt: "A photorealistic product photograph of aromatic traditional spices artfully displayed. The spices show rich, vibrant colors and authentic texture. They are presented in traditional containers or bowls, arranged to show quality and freshness. Professional food photography lighting brings out the natural colors and textures. The image evokes freshness and authenticity.",
      descPrompt: "premium quality traditional spices"
    },
    { 
      value: "tea", 
      label: "Ceylon Tea",
      imagePrompt: "A photorealistic product photograph of premium Ceylon tea leaves or packaged tea. The tea leaves show rich color and perfect texture indicating high quality. Presentation includes elegant packaging or display of loose leaves. Professional food photography lighting highlights the tea's color and quality. The image conveys luxury and authenticity of Ceylon tea heritage.",
      descPrompt: "premium Ceylon tea with authentic flavor"
    },
    { 
      value: "gems", 
      label: "Gems & Stones",
      imagePrompt: "A photorealistic luxury product photograph of precious gemstones with brilliant clarity and color. The gems are professionally cut and polished, showing natural beauty and sparkle. Macro photography captures the facets, clarity, and vibrant colors. Professional jewelry photography lighting makes the stones sparkle brilliantly. Shot against a neutral or black background to emphasize the gems' beauty.",
      descPrompt: "natural gemstones with brilliant clarity"
    }
  ];

  const materialCategories = [
    { 
      value: "fabric", 
      label: "Fabric Materials",
      imagePrompt: "A photorealistic product photograph of high-quality fabric material rolls or bolts. The fabric shows excellent texture, weave pattern, and natural drape. Multiple colors or patterns may be visible, neatly organized. Professional lighting highlights the fabric quality and texture. Clean, organized presentation suitable for material suppliers.",
      descPrompt: "quality fabric material for crafting"
    },
    { 
      value: "wood", 
      label: "Wood Materials",
      imagePrompt: "A photorealistic product photograph of premium wood materials including planks, blocks, or lumber. The wood shows beautiful natural grain patterns and smooth finish. Different wood types or cuts may be displayed. Professional lighting emphasizes the wood grain and quality. Organized presentation showing materials ready for woodworking.",
      descPrompt: "premium wood materials for woodworking"
    },
    { 
      value: "clay", 
      label: "Clay & Pottery Materials",
      imagePrompt: "A photorealistic product photograph of pottery clay materials including raw clay blocks or prepared clay. The clay shows smooth, workable texture and natural earthy colors. Materials are presented cleanly, possibly with tools nearby. Professional lighting shows the clay's quality and consistency. The image conveys readiness for pottery creation.",
      descPrompt: "quality clay materials for pottery"
    },
    { 
      value: "metal", 
      label: "Metal & Brass Materials",
      imagePrompt: "A photorealistic product photograph of metal materials including brass sheets, rods, or metalworking supplies. The metals show polished surfaces with natural metallic sheen. Materials are organized and clearly visible. Professional lighting creates attractive reflections on metal surfaces. Clean industrial presentation showing material quality.",
      descPrompt: "quality metal and brass materials"
    },
    { 
      value: "paint", 
      label: "Paints & Dyes",
      imagePrompt: "A photorealistic product photograph of vibrant paints and dyes in containers or bottles. The colors are rich and clearly visible, showing variety and quality. Products are neatly organized with visible labels. Professional lighting brings out the true colors and product quality. Clean, organized presentation suitable for art supply materials.",
      descPrompt: "vibrant paints and dyes for crafts"
    },
    { 
      value: "thread", 
      label: "Thread & Yarn",
      imagePrompt: "A photorealistic product photograph of colorful thread and yarn spools or skeins. The threads show various colors neatly organized, demonstrating variety and quality. The texture and sheen of the threads are visible. Professional lighting highlights the color richness and thread quality. Artistic arrangement showcasing the materials.",
      descPrompt: "quality thread and yarn materials"
    },
    { 
      value: "beads", 
      label: "Beads & Stones",
      imagePrompt: "A photorealistic product photograph of assorted beads and decorative stones in various colors and sizes. The beads show sparkle, color variety, and quality. They are organized in containers or displays showing the assortment. Professional lighting makes beads sparkle and shows color accuracy. Attractive presentation for craft materials.",
      descPrompt: "decorative beads and stones for jewelry making"
    },
    { 
      value: "tools", 
      label: "Crafting Tools",
      imagePrompt: "A photorealistic product photograph of professional crafting tools neatly arranged. The tools show quality construction with clean, well-maintained appearance. Various tools for different crafts are visible. Professional lighting highlights the tool quality and details. Organized presentation on a clean surface or tool board.",
      descPrompt: "professional crafting tools"
    },
    { 
      value: "finishing", 
      label: "Finishing Materials",
      imagePrompt: "A photorealistic product photograph of finishing materials including varnishes, polishes, or protective coatings. The products are in labeled containers, neatly organized. The quality and variety of finishing products are evident. Professional lighting shows product details clearly. Clean, professional presentation for craft finishing supplies.",
      descPrompt: "quality finishing materials for crafts"
    },
    { 
      value: "packaging", 
      label: "Packaging Materials",
      imagePrompt: "A photorealistic product photograph of various packaging materials including boxes, wrapping, and protective materials. The materials are clean, organized, and show quality. Different sizes and types are visible. Professional lighting shows material quality and options. Organized presentation suitable for craft packaging supplies.",
      descPrompt: "quality packaging materials"
    }
  ];

  // Gemini AI Description Generation
  const generateAIDescription = async () => {
    if (!itemName.trim()) {
      toast.error("Please enter item name first");
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const categories = sellerType === "product" ? productCategories : materialCategories;
      const categoryInfo = categories.find(c => c.value === itemCategory);
      
      const prompt = `Create a compelling product description (150-200 characters) for a ${sellerType === 'product' ? 'handcrafted product' : 'crafting material'} called "${itemName}". 
      ${categoryInfo ? `Category: ${categoryInfo.label}. ${categoryInfo.descPrompt}` : ''}
      ${itemPrice ? `Price: Rs. ${itemPrice}` : ''}
      
      The description should:
      - Highlight quality and craftsmanship
      - Mention traditional or authentic aspects if applicable
      - Appeal to buyers looking for ${sellerType === 'product' ? 'finished products' : 'quality materials'}
      - Be concise, engaging, and professional
      
      Keep it under 200 characters and make it compelling.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiDescription = response.text().trim();
      
      setItemDescription(aiDescription);
      toast.success("✨ AI description generated!");
      
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("AI unavailable. Try manual description.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Gemini AI Image Generation
  const generateItemImage = async () => {
    if (!itemCategory && !customImagePrompt.trim()) {
      toast.error("Please select a category or enter a custom prompt");
      return;
    }

    if (retryCountdown > 0) {
      toast.error(`Please wait ${retryCountdown} seconds before trying again`);
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-image"
      });
      
      const categories = sellerType === "product" ? productCategories : materialCategories;
      const categoryInfo = categories.find(c => c.value === itemCategory);
      
      let fullPrompt = "";
      if (customImagePrompt.trim()) {
        fullPrompt = `A photorealistic, professional product photograph of ${customImagePrompt.trim()}. 
        ${itemName ? `Product name: "${itemName}".` : ''} 
        High-quality product photography with professional lighting, clean background, and clear details. 
        The image should be attractive to online buyers and showcase the ${sellerType === 'product' ? 'product' : 'material'} quality.`;
      } else if (categoryInfo) {
        fullPrompt = categoryInfo.imagePrompt;
        if (itemName) {
          fullPrompt += ` The item is called "${itemName}".`;
        }
      }

      toast.loading("🎨 Gemini AI is creating product image...", { id: 'generating-image' });
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content.parts;
        
        let imageGenerated = false;
        for (const part of parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            
            const byteCharacters = atob(imageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            
            const timestamp = Date.now();
            const file = new File([blob], `ai-product-${timestamp}.png`, { type: mimeType });
            
            const newImages = itemImages.length > 0 ? [...itemImages, file] : [file];
            setItemImages(newImages);
            
            imageGenerated = true;
            toast.dismiss('generating-image');
            toast.success("✨ AI product image added to gallery!");
            break;
          }
        }
        
        if (!imageGenerated) {
          toast.dismiss('generating-image');
          toast.error("Image generation not available. Please upload manually.");
        }
      }
      
    } catch (error) {
      console.error("Error generating image:", error);
      toast.dismiss('generating-image');
      
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes("quota") || errorMessage.includes("429")) {
        const retryMatch = errorMessage.match(/retry in (\d+)/i);
        const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 30;
        
        setRetryCountdown(retrySeconds);
        const interval = setInterval(() => {
          setRetryCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast.error(`API Quota Exceeded! Wait ${retrySeconds}s or upload manually.`, { duration: 6000 });
      } else {
        toast.error("Image generation unavailable. Please upload manually.");
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

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

    if (itemImages.length === 0) {
      toast.error("Please add at least one image");
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
        sellerType: sellerType
      };

      const result = await axios.post(
        `${backendUrl}/api/v1/collection`,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-6">
      {/* Header */}
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
              <h1 className="text-xl font-bold text-white">Add New Item</h1>
              <p className="text-orange-100 text-xs mt-0.5">✨ Powered by Gemini AI</p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        {/* Seller Type */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Seller Type <span className="text-[#F85606]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSellerType("product");
                setItemCategory("bathics");
              }}
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
                }`}>Product Seller</span>
                <p className="text-xs text-gray-500 mt-1">Finished goods</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setSellerType("material");
                setItemCategory("fabric");
              }}
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
                }`}>Material Seller</span>
                <p className="text-xs text-gray-500 mt-1">Raw materials</p>
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

        {/* Description with AI */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-gray-800">
              Description <span className="text-[#F85606]">*</span>
            </label>
            <button
              type="button"
              onClick={generateAIDescription}
              disabled={isGeneratingDescription || !itemName.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-sm"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  AI...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Generate
                </>
              )}
            </button>
          </div>
          <textarea
            placeholder={`Describe this ${sellerType === 'product' ? 'product' : 'material'} in detail...`}
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white resize-none text-sm"
            rows="4"
          />
          <p className="text-xs text-gray-500 mt-2">{itemDescription.length} characters</p>
        </div>

        {/* AI Image Generation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              🎨 AI Image Generation
            </label>
            <button
              type="button"
              onClick={() => setShowAIImageSection(!showAIImageSection)}
              className="text-blue-600 font-bold text-xs px-2 py-1 rounded-lg hover:bg-blue-100"
            >
              {showAIImageSection ? "Hide ▼" : "Show ▶"}
            </button>
          </div>

          {showAIImageSection && (
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3 border border-blue-200">
                <label className="block text-xs font-bold text-gray-700 mb-2">Custom Prompt (Optional)</label>
                <textarea
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-xs resize-none"
                  rows="2"
                  placeholder="e.g., traditional batik fabric with blue and gold patterns"
                />
                <p className="text-xs text-gray-600 mt-1">💡 Describe your product's appearance in detail</p>
              </div>

              <button
                type="button"
                onClick={generateItemImage}
                disabled={isGeneratingImage || retryCountdown > 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : retryCountdown > 0 ? (
                  <>Wait {retryCountdown}s</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate Product Image
                  </>
                )}
              </button>
            </div>
          )}
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
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F85606] shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Manual Image Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Upload Images {itemImages.length > 0 && (
              <span className="text-[#F85606] ml-1">({itemImages.length} selected)</span>
            )}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center bg-orange-50/50">
            <input
              type="file"
              multiple
              onChange={(e) => setItemImages([...itemImages, ...Array.from(e.target.files)])}
              className="hidden"
              id="image-upload"
              accept="image/*"
            />
            <label htmlFor="image-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F85606] to-[#FF7420] rounded-2xl flex items-center justify-center mb-3 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-800 text-sm font-bold mb-1">Tap to upload images</p>
                <p className="text-gray-500 text-xs">JPG, PNG, WEBP</p>
              </div>
            </label>
          </div>
        </div>

        {/* Image Previews */}
        {itemImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <label className="block text-sm font-bold text-gray-800 mb-3">Image Previews</label>
            <div className="grid grid-cols-3 gap-3">
              {Array.from(itemImages).map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-xl border-2 border-orange-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = Array.from(itemImages);
                      newImages.splice(idx, 1);
                      setItemImages(newImages);
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg active:scale-95 transition-transform"
                  >×</button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">{idx + 1}</div>
                  {file.name.includes('ai-product') && (
                    <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-bold">✨ AI</div>
                  )}
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
            type="button"
            onClick={handleAddItem}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
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
                Add Item
              </>
            )}
          </button>
        </div>

        {/* AI Info */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-xs font-bold text-gray-800">✨ Gemini AI Features</p>
          </div>
          <p className="text-xs text-gray-700">
            • AI-powered descriptions • Product image generation • 12+ categories
          </p>
        </div>
      </div>
    </div>
  );
}