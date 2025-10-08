import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import toast from "react-hot-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
const geminiApiKey = "AIzaSyCMY7C8g_LSES9IB9BHS8DQVGdrSLXr08I";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Business types for AI image generation with detailed photorealistic prompts
const businessTypes = [
  { 
    value: "bakery", 
    label: "🥖 Bakery", 
    prompt: "A photorealistic interior shot of a warm, inviting artisan bakery shop. Golden-brown fresh baked bread loaves are displayed on rustic wooden shelves. Elegant glass cases showcase colorful pastries, croissants, and decorated cakes. The scene is illuminated by soft, warm overhead lighting that creates a cozy atmosphere. A vintage-style counter with a modern espresso machine is visible in the background. The setting conveys craftsmanship and quality, with flour-dusted surfaces and the ambiance of a bustling neighborhood bakery. Shot with a 35mm wide-angle lens to capture the inviting atmosphere." 
  },
  { 
    value: "traditional_cloth", 
    label: "👘 Traditional Clothing", 
    prompt: "A photorealistic view of an elegant traditional clothing boutique interior. Vibrant ethnic garments in rich colors - deep reds, royal blues, and golden yellows - hang gracefully on polished wooden racks. Intricately embroidered fabrics and silk textiles are artfully displayed. Traditional mannequins showcase complete outfits with cultural accessories. The shop features ornate mirrors with traditional frames and warm ambient lighting that highlights the textures and patterns of the garments. The floor has traditional rugs, creating an authentic cultural shopping experience. Captured with soft, diffused lighting to emphasize fabric details." 
  },
  { 
    value: "modern_fashion", 
    label: "👔 Modern Fashion", 
    prompt: "A photorealistic interior of a contemporary fashion boutique with minimalist design. Sleek white walls with stylish mannequins displaying the latest trendy clothing collections. Modern lighting fixtures create dramatic shadows. Chrome clothing racks hold carefully curated pieces. A central display table features folded designer items. The space has polished concrete floors and large mirrors with LED backlighting. The aesthetic is clean, sophisticated, and Instagram-worthy. Shot with professional retail photography lighting, creating a bright, aspirational shopping environment that appeals to fashion-forward customers." 
  },
  { 
    value: "grocery", 
    label: "🛒 Grocery Store", 
    prompt: "A photorealistic view of a well-organized, modern grocery store interior. Fresh produce section in the foreground displays vibrant fruits and vegetables in wooden crates and refrigerated cases. Neat aisles with organized shelves stocked with products extend into the background. Bright, even overhead LED lighting illuminates the entire space. Clean white floors reflect the lights. Shopping carts are arranged neatly near the entrance. Colorful product packaging and clear price labels create an inviting retail environment. The scene conveys cleanliness, organization, and abundance. Captured with a wide-angle lens to show the spacious, customer-friendly layout." 
  },
  { 
    value: "electronics", 
    label: "📱 Electronics Shop", 
    prompt: "A photorealistic interior of a modern electronics retail store. Sleek display tables showcase the latest smartphones, tablets, and laptops under bright, focused LED spotlights. Large TV screens mounted on the walls display vibrant demos. Glass cases contain accessories like headphones, smartwatches, and charging devices. The aesthetic is futuristic with dark gray walls, white display units, and blue accent lighting. Modern floating shelves display gadgets in an organized, accessible manner. The space feels tech-savvy and cutting-edge. Shot with professional retail photography lighting to make products appear premium and desirable." 
  },
  { 
    value: "coffee_shop", 
    label: "☕ Coffee Shop", 
    prompt: "A photorealistic interior of a cozy, artisan coffee shop. A professional espresso machine gleams on a wooden counter, with a barista craft station visible. Warm Edison bulb string lights create ambient lighting. Rustic wooden tables and comfortable leather chairs invite customers to relax. Exposed brick walls feature local artwork and chalkboard menus. A glass pastry case displays fresh baked goods. Potted plants add greenery. The atmosphere is warm and inviting with soft, golden lighting streaming through large windows. Steam rises from fresh coffee cups. Shot with natural, warm tones that evoke comfort and community." 
  },
  { 
    value: "bookstore", 
    label: "📚 Bookstore", 
    prompt: "A photorealistic interior of a charming independent bookstore. Floor-to-ceiling wooden bookshelves are filled with colorful spines of books organized by genre. A cozy reading nook with a comfortable armchair and floor lamp sits in one corner. Warm overhead lighting creates an inviting glow. A vintage wooden ladder leans against the shelves for reaching high books. A central display table features bestsellers and staff picks. The atmosphere is intellectual and peaceful, with warm wood tones throughout. Captured with soft, library-style lighting that emphasizes the welcoming, literary environment." 
  },
  { 
    value: "jewelry", 
    label: "💎 Jewelry Store", 
    prompt: "A photorealistic interior of an upscale jewelry store. Elegant glass display cases with velvet-lined interiors showcase sparkling diamond rings, necklaces, and watches under precise LED spotlights. The cases are arranged in a sophisticated layout with polished marble countertops. Crystal chandeliers provide luxurious ambient lighting. Mirrors with ornate gold frames line the walls. The color palette is cream, gold, and deep burgundy, creating an atmosphere of luxury and exclusivity. High-end security features are subtly integrated. Shot with professional jewelry photography lighting to make gemstones sparkle and precious metals gleam." 
  },
  { 
    value: "pharmacy", 
    label: "💊 Pharmacy", 
    prompt: "A photorealistic interior of a modern, professional pharmacy. Clean white shelves organized with clearly labeled medicine bottles and healthcare products. A consultation counter with privacy screens is visible in the background. Bright, clinical LED lighting ensures excellent visibility. The floor is spotless white tile. Digital displays show waiting numbers. A section displays vitamins, supplements, and first-aid supplies in organized categories. The atmosphere conveys trust, cleanliness, and healthcare professionalism. Everything is ADA-compliant and accessible. Shot with even, bright lighting that creates a sterile, trustworthy medical environment." 
  },
  { 
    value: "flower_shop", 
    label: "🌸 Flower Shop", 
    prompt: "A photorealistic interior of a beautiful flower shop bursting with color and life. Vibrant fresh flowers in metal buckets and vases line the walls - roses, tulips, lilies, and sunflowers in every color. A central workbench displays floral arrangement supplies. Overhead, hanging plants add greenery. Large windows allow natural daylight to stream in, illuminating the blooms. Wooden shelves hold potted plants and decorative containers. The air seems filled with color and natural beauty. The atmosphere is fresh, vibrant, and artistic. Shot with natural lighting that makes colors pop and creates a garden-like indoor environment." 
  },
  { 
    value: "restaurant", 
    label: "🍽️ Restaurant", 
    prompt: "A photorealistic interior of an upscale, inviting restaurant. Elegant dining tables with white tablecloths, polished silverware, and wine glasses are set throughout the space. Warm pendant lights hang above each table, creating intimate lighting zones. The background shows an open kitchen with chefs at work. Comfortable upholstered chairs in rich colors surround each table. Subtle wall sconces provide ambient lighting. Fresh flowers in vases add color. The atmosphere is sophisticated yet welcoming, perfect for a memorable dining experience. Shot during the golden hour with warm, ambient lighting that creates an inviting, high-end dining atmosphere." 
  },
  { 
    value: "hardware", 
    label: "🔧 Hardware Store", 
    prompt: "A photorealistic interior of a well-stocked hardware store. Organized aisles with clearly labeled signs extend into the background. Shelves are filled with tools, paint cans, lumber, and building supplies arranged in logical categories. The main aisle displays power tools and equipment on secure hooks. Overhead industrial lighting provides bright, even illumination. The floor is polished concrete. A helpful service counter is visible in the background. The environment conveys organization, expertise, and everything a DIY enthusiast or professional would need. Shot with bright, functional lighting that emphasizes the store's comprehensive inventory and helpful layout." 
  }
];

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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // AI Image Generation States
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [customImagePrompt, setCustomImagePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [showAIImageSection, setShowAIImageSection] = useState(false);

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

  // Gemini AI Description Generation (Primary)
  const generateGeminiDescription = async () => {
    if (!shopData.name.trim()) {
      toast.error("Please enter shop name first");
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      // Use Gemini 2.0 Flash for text generation
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const businessInfo = selectedBusinessType 
        ? `This is a ${businessTypes.find(b => b.value === selectedBusinessType)?.label} business.` 
        : '';
      
      const prompt = `Create a compelling and professional shop description (150-200 characters) for a shop called "${shopData.name}" located at "${shopData.address}". ${businessInfo}
      Make it welcoming, highlight quality service, and appeal to customers. Keep it concise and engaging.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiDescription = response.text().trim();
      
      setShopData(prev => ({
        ...prev,
        description: aiDescription
      }));
      
      toast.success("✨ AI description generated with Gemini!");
      
    } catch (error) {
      console.error("Error generating Gemini description:", error);
      toast.error("Gemini unavailable. Trying backup AI...");
      generateGroqDescription(); // Fallback to Groq
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Groq AI Description Generation (Backup)
  const generateGroqDescription = async () => {
    setIsGeneratingDescription(true);
    
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `Create a short shop description (120-180 characters) for a shop called "${shopData.name}" located at "${shopData.address}". Make it welcoming and professional.`
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        },
        {
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      if (response.data.choices && response.data.choices[0]) {
        const aiDescription = response.data.choices[0].message.content.trim();
        setShopData(prev => ({
          ...prev,
          description: aiDescription
        }));
        
        toast.success("AI description generated!");
      }
      
    } catch (error) {
      console.error("Error generating Groq description:", error);
      toast.error("AI service unavailable. Using smart templates.");
      generateSmartDescription();
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Fallback smart description generator
  const generateSmartDescription = () => {
    const locationPart = shopData.address ? ` at ${shopData.address}` : "";
    const city = shopData.address.split(',')[0] || "your area";
    
    const shopName = shopData.name.toLowerCase();
    let shopType = "products";
    
    if (shopName.includes('grocery') || shopName.includes('market')) shopType = "groceries";
    else if (shopName.includes('cloth') || shopName.includes('fashion')) shopType = "clothing";
    else if (shopName.includes('electronic') || shopName.includes('tech')) shopType = "electronics";
    else if (shopName.includes('book') || shopName.includes('stationery')) shopType = "books";
    else if (shopName.includes('pharma') || shopName.includes('medical')) shopType = "health products";
    else if (shopName.includes('hardware') || shopName.includes('tools')) shopType = "hardware";
    else if (shopName.includes('beauty') || shopName.includes('cosmetic')) shopType = "beauty products";
    else if (shopName.includes('coffee') || shopName.includes('cafe')) shopType = "coffee";
    else if (shopName.includes('bakery') || shopName.includes('bread')) shopType = "bakery items";

    const templates = [
      `Welcome to ${shopData.name}${locationPart}! Quality ${shopType} and friendly service. Visit us today!`,
      `${shopData.name} - Your trusted ${shopType} shop in ${city}. Great products, better service!`,
      `Discover ${shopData.name}${locationPart}. Premium ${shopType} and excellent customer care.`,
      `${shopData.name} in ${city} - Quality ${shopType} and exceptional service await you!`
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setShopData(prev => ({
      ...prev,
      description: randomTemplate
    }));
  };

  // Gemini AI Image Generation
  const generateShopImage = async () => {
    if (!selectedBusinessType && !customImagePrompt.trim()) {
      toast.error("Please select a business type or enter a custom prompt");
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      // Use Gemini 2.5 Flash Image model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-image"
      });
      
      const businessType = businessTypes.find(b => b.value === selectedBusinessType);
      
      // Build the prompt - use custom or business type template
      let fullPrompt = "";
      if (customImagePrompt.trim()) {
        // User provided custom prompt - enhance it with photorealistic details
        fullPrompt = `A photorealistic, professional photograph of ${customImagePrompt.trim()}. 
        ${shopData.name ? `This shop is called "${shopData.name}".` : ''} 
        The scene should be well-lit with natural or professional lighting, clean, inviting, and attractive to customers. 
        Shot with professional commercial photography equipment, bright colors, clear details, and an aspirational atmosphere that makes customers want to visit.`;
      } else if (businessType) {
        // Use pre-built detailed prompt
        fullPrompt = businessType.prompt;
        if (shopData.name) {
          fullPrompt += ` A subtle sign or branding element shows the shop name "${shopData.name}".`;
        }
      }

      toast.loading("🎨 Gemini AI is creating your shop image...", { id: 'generating-image' });
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      // Check for image data in response
      if (response.candidates && response.candidates[0]) {
        const parts = response.candidates[0].content.parts;
        
        let imageGenerated = false;
        for (const part of parts) {
          if (part.inlineData) {
            // Convert base64 to blob and create file
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            
            // Convert base64 to blob
            const byteCharacters = atob(imageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            
            // Create file from blob
            const timestamp = Date.now();
            const file = new File([blob], `gemini-generated-${timestamp}.png`, { type: mimeType });
            
            // Add to image files
            setImageFiles(prev => [...prev, file]);
            setGeneratedImages(prev => [...prev, URL.createObjectURL(blob)]);
            
            imageGenerated = true;
            toast.dismiss('generating-image');
            toast.success("✨ AI image generated and added to gallery!");
            break;
          }
        }
        
        if (!imageGenerated) {
          // If no image in response, show text response
          const textContent = parts.find(p => p.text)?.text || "Image generation in progress...";
          console.log("Gemini response:", textContent);
          toast.dismiss('generating-image');
          toast.error("Image generation not supported yet. Please upload images manually.");
        }
      }
      
    } catch (error) {
      console.error("Error generating image:", error);
      
      toast.dismiss('generating-image');
      
      // Check for specific error types
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes("api key") || errorMessage.includes("authentication")) {
        toast.error("Invalid Gemini API key. Please check configuration.");
      } else if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        toast.error("API quota exceeded. Please try again later.");
      } else if (errorMessage.includes("safety") || errorMessage.includes("policy") || errorMessage.includes("blocked")) {
        toast.error("Content policy issue detected. Try rephrasing your prompt or select a business type.", { duration: 5000 });
        console.log("Tip: Use descriptive scene descriptions rather than simple keywords. Example: 'A photorealistic interior of a cozy coffee shop with wooden tables'");
      } else if (errorMessage.includes("model not found")) {
        toast.error("Image generation model unavailable. Feature coming soon!");
      } else {
        toast.error("Image generation unavailable. Please upload images manually.");
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Upload all images (both uploaded and AI-generated)
      const uploadedUrls = await Promise.all(
        imageFiles.map((file) => mediaUpload(file))
      );

      // Send data to backend - unchanged structure
      const response = await axios.post(
        `${backendUrl}/api/v1/owner`,
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
                ✨ Powered by Gemini AI
              </p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Business Type Selection */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-md p-4 border-2 border-purple-200">
          <label htmlFor="businessType" className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Business Type (Helps AI Generate Better Content)
          </label>
          <select
            id="businessType"
            value={selectedBusinessType}
            onChange={(e) => setSelectedBusinessType(e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all duration-200 bg-white text-sm font-medium"
          >
            <option value="">Select your business type...</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-2">
            💡 Selecting a business type helps AI generate relevant images and descriptions
          </p>
        </div>

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

        {/* Description with Gemini AI Generation */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Shop Description <span className="text-[#F85606]">*</span>
            </label>
            <button
              type="button"
              onClick={generateGeminiDescription}
              disabled={isGeneratingDescription || !shopData.name.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-md"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gemini...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Gemini AI
                </>
              )}
            </button>
          </div>
          <textarea
            id="description"
            name="description"
            value={shopData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all duration-200 bg-white resize-none text-sm"
            rows="4"
            placeholder="Describe your shop, products, and services... or use Gemini AI"
            required
          ></textarea>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {shopData.description.length} characters
            </p>
            {shopData.description && (
              <p className="text-xs text-purple-600 font-medium">
                ✨ Description Ready
              </p>
            )}
          </div>
        </div>

        {/* AI Image Generation Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              🎨 Gemini AI Image Generation
            </label>
            <button
              type="button"
              onClick={() => setShowAIImageSection(!showAIImageSection)}
              className="text-blue-600 font-bold text-sm px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {showAIImageSection ? "Hide ▼" : "Show ▶"}
            </button>
          </div>

          {showAIImageSection && (
            <div className="space-y-3">
              <div className="bg-white bg-opacity-70 rounded-xl p-3 border border-blue-200">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Custom Image Prompt (Optional)
                </label>
                <textarea
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 bg-white text-sm resize-none"
                  rows="3"
                  placeholder="Describe the scene in detail... e.g., 'a modern bakery with glass display cases showing fresh pastries, warm lighting, and wooden counters'"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="font-bold text-green-600">✓</span>
                    <span><span className="font-bold">Good:</span> "A cozy coffee shop interior with exposed brick walls, vintage furniture, and warm Edison bulb lighting"</span>
                  </p>
                  <p className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="font-bold text-red-600">✗</span>
                    <span><span className="font-bold">Avoid:</span> "coffee shop, cozy, vintage" (too simple)</span>
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    💡 Describe the scene, don't just list keywords! Be specific about lighting, colors, and atmosphere.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={generateShopImage}
                disabled={isGeneratingImage || (!selectedBusinessType && !customImagePrompt.trim())}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Shop Image...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate Shop Image with Gemini AI
                  </>
                )}
              </button>

              <div className="bg-blue-100 bg-opacity-70 rounded-xl p-3 border border-blue-300">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-bold text-blue-800">✨ Powered by Gemini 2.5 Flash Image:</span> Creates professional shop images based on your business type or detailed custom prompts. Generated images are automatically added to your shop gallery. You can review, edit, or remove them before submitting.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-bold">Pro tip:</span> For best results, describe lighting, colors, materials, and atmosphere in detail!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Image Upload */}
        <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
          <label htmlFor="images" className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Shop Images <span className="text-[#F85606]">*</span>
            {imageFiles.length > 0 && (
              <span className="text-[#F85606] ml-1">({imageFiles.length} selected)</span>
            )}
          </label>
          <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center transition-all duration-200 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-400">
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
                  PNG, JPG, JPEG up to 10MB each
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Image Previews */}
        {imageFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Image Gallery ({imageFiles.length})
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Array.from(imageFiles).map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover rounded-xl border-2 border-orange-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = Array.from(imageFiles);
                      newFiles.splice(idx, 1);
                      setImageFiles(newFiles);
                      toast.success("Image removed");
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg active:scale-95 transition-transform hover:from-red-600 hover:to-red-700"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                    #{idx + 1}
                  </div>
                  {file.name.includes('gemini-generated') && (
                    <div className="absolute top-1 left-1 bg-purple-600 bg-opacity-90 text-white text-xs px-2 py-0.5 rounded-md font-bold">
                      ✨ AI
                    </div>
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
            className="bg-gray-400 text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:bg-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding Shop...
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

        {/* AI Features Info */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm font-bold text-gray-800">✨ Gemini 2.5 Flash Powered Features</p>
          </div>
          <div className="space-y-1.5 text-xs text-gray-700">
            <p className="flex items-start gap-2">
              <span className="text-lg">🎨</span>
              <span><span className="font-bold">AI Image Generation:</span> Photorealistic shop images using Gemini 2.5 Flash Image model</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">📝</span>
              <span><span className="font-bold">Smart Descriptions:</span> Gemini-powered compelling shop descriptions with context</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🏪</span>
              <span><span className="font-bold">Business Templates:</span> 12 pre-optimized photorealistic scene descriptions</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">⚡</span>
              <span><span className="font-bold">Fast Processing:</span> Get professional AI-generated content in seconds</span>
            </p>
          </div>
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