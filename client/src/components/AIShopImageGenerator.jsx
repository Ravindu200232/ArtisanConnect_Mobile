import React, { useState } from 'react';
import mediaUpload from '../utils/mediaUpload'; // Your existing Supabase upload function

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function AIShopImageGenerator({ 
  shopId, 
  shopCategory, 
  onImagesGenerated, 
  currentShop,
  onImagesUploaded // New prop to handle uploaded image URLs
}) {
  const [prompt, setPrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  // Convert base64 to File object for Supabase upload
  const base64ToFile = (base64Data, filename = 'ai-generated-image') => {
    try {
      // Extract the base64 data and MIME type
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      // Create file with proper extension
      const extension = mime.split('/')[1];
      const finalFilename = `${filename}-${Date.now()}.${extension}`;
      
      return new File([u8arr], finalFilename, { type: mime });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      return null;
    }
  };

const generateShopImages = async () => {
  if (!prompt.trim()) {
    setError('Please enter a description for your shop product');
    return;
  }

  setIsGenerating(true);
  setError('');
  setGeneratedImages([]);
  setProgress('Initializing AI image generator for your shop...');

  try {
    setProgress(`Generating ${numberOfImages} shop image${numberOfImages > 1 ? 's' : ''}...`);
    
    const response = await fetch(`${backendUrl}/api/v1/ai-images/generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        numberOfImages: numberOfImages,
        shopCategory: shopCategory || 'artisan',
        style: 'professional e-commerce product photography'
      })
    });

    const data = await response.json();

    if (data.success) {
      setGeneratedImages(data.images);
      setProgress('AI images generated! Uploading to your shop...');
      
      // Automatically upload all generated images to Supabase
      const uploadedUrls = [];
      
      for (let i = 0; i < data.images.length; i++) {
        const image = data.images[i];
        if (image.image) {
          try {
            const file = base64ToFile(image.image, `ai-shop-image-${i + 1}`);
            if (file) {
              const supabaseUrl = await mediaUpload(file);
              uploadedUrls.push(supabaseUrl);
            }
          } catch (uploadError) {
            console.error(`Error uploading image ${i + 1}:`, uploadError);
          }
        }
      }

      // Notify parent component with uploaded URLs
      if (onImagesUploaded && uploadedUrls.length > 0) {
        onImagesUploaded(uploadedUrls);
      }
      
      setProgress('');
      setError('');
      
      showSuccessAlert(
        '✨ AI Images Ready!', 
        `${uploadedUrls.length} images generated and uploaded to your shop!`
      );

      if (onImagesGenerated) {
        onImagesGenerated(data.images);
      }
    } else {
      throw new Error(data.error || 'Generation failed');
    }

  } catch (err) {
    console.error('Generation error:', err);
    setError(err.message || 'Failed to generate images. Please try again.');
    setProgress('');
    showErrorAlert('Generation Failed', 'Could not generate images. Please check your connection and try again.');
  } finally {
    setIsGenerating(false);
  }
};

  // Upload single AI image to Supabase and return URL
  const uploadToSupabase = async (imageData, index) => {
    try {
      setIsUploading(true);
      
      // Convert base64 to File object
      const file = base64ToFile(imageData, `ai-shop-image-${index + 1}`);
      
      if (!file) {
        throw new Error('Failed to convert AI image to file');
      }

      // Upload to Supabase using your existing mediaUpload function
      const loadingAlert = showLoadingAlert('Uploading Image', 'Uploading AI image to your shop...');
      
      const supabaseUrl = await mediaUpload(file);
      
      loadingAlert.close();
      
      showSuccessAlert('✅ Image Uploaded!', 'AI generated image has been uploaded to your shop');
      
      return supabaseUrl;

    } catch (err) {
      console.error('Supabase upload error:', err);
      showErrorAlert('Upload Failed', 'Could not upload image to Supabase. Please try again.');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Add single AI image to shop via Supabase
  const addImageToShop = async (imageData, index) => {
    try {
      const supabaseUrl = await uploadToSupabase(imageData, index);
      
      // Notify parent component with the Supabase URL
      if (onImagesUploaded) {
        onImagesUploaded([supabaseUrl]);
      }
      
      return supabaseUrl;

    } catch (err) {
      console.error('Add image to shop error:', err);
      return null;
    }
  };

  // Add all generated images to shop at once
  const addAllImagesToShop = async () => {
    try {
      setIsUploading(true);
      const loadingAlert = showLoadingAlert('Uploading Images', `Uploading ${generatedImages.length} AI images to your shop...`);
      
      const uploadedUrls = [];
      
      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i];
        if (image.image) {
          const url = await uploadToSupabase(image.image, i);
          if (url) {
            uploadedUrls.push(url);
          }
        }
      }

      loadingAlert.close();
      
      // Notify parent component with all uploaded URLs
      if (onImagesUploaded && uploadedUrls.length > 0) {
        onImagesUploaded(uploadedUrls);
      }
      
      showSuccessAlert('🎉 All Images Uploaded!', `${uploadedUrls.length} AI images uploaded to your shop`);

    } catch (err) {
      console.error('Add all images error:', err);
      showErrorAlert('Upload Failed', 'Could not upload all images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadImage = (imageData, index) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `shop-product-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessAlert('📥 Download Started', 'Image is being downloaded to your device');
  };

  const copyPrompt = (examplePrompt) => {
    setPrompt(examplePrompt);
    setError('');
  };

  // Example prompts for different shop categories
  const shopExamplePrompts = {
    pottery: [
      'Handcrafted ceramic vase with intricate blue patterns, professional product photography',
      'Traditional pottery collection displayed on wooden shelf, natural lighting',
      'Artisan throwing clay on pottery wheel, action shot, workshop environment'
    ],
    batik: [
      'Colorful batik fabric with traditional patterns, flat lay composition',
      'Hand-drawn batik artwork in progress, detailed close-up',
      'Batik clothing collection modeled professionally, studio lighting'
    ],
    wood_carving: [
      'Intricately carved wooden sculpture, highlighting details and craftsmanship',
      'Wood carving tools and finished products arranged artistically',
      'Traditional wooden mask with painted details, cultural artifact style'
    ],
    jewelry_making: [
      'Handmade silver jewelry with gemstones, professional product shot',
      'Jewelry making process with tools and materials, educational style',
      'Beaded necklace collection displayed on velvet background'
    ],
    building_materials: [
      'Stacked building materials organized neatly, construction site',
      'Quality bricks and cement products, industrial photography',
      'Hardware tools arranged professionally, workshop environment'
    ],
    fabric_supply: [
      'Colorful fabric rolls displayed in shop, textile store',
      'Various fabric types and patterns, material samples',
      'Textile supply shop interior, well-organized shelves'
    ]
  };

  const getExamplePrompts = () => {
    return shopExamplePrompts[shopCategory] || [
      'Professional product photography of handmade items, clean background',
      'Artisan workspace with tools and materials, authentic environment',
      'High-quality product display with natural lighting, e-commerce ready',
      'Shop interior with products organized neatly, inviting atmosphere'
    ];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">AI Product Image Generator</h3>
          <p className="text-gray-600 text-sm">Create stunning images for your shop with AI</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Describe Your Product <span className="text-red-500">*</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Handcrafted ceramic vase with blue patterns, professional product shot..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="3"
          />
        </div>

        {/* Number Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Number of Images
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNumberOfImages(num)}
                className={`py-3 rounded-lg font-bold transition-all ${
                  numberOfImages === num
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Progress and Error */}
        {progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-700 text-sm font-medium">{progress}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateShopImages}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Shop Images
            </>
          )}
        </button>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800">
              Generated Images ({generatedImages.length})
            </h4>
            <button
              onClick={addAllImagesToShop}
              disabled={isUploading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload All to Shop
                </>
              )}
            </button>
          </div>
          
          <div className={`grid gap-4 ${
            generatedImages.length === 1 ? 'grid-cols-1' : 
            generatedImages.length === 2 ? 'grid-cols-2' : 
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {generatedImages.map((img, idx) => (
              <div key={img.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="relative mb-3">
                  <img
                    src={img.image}
                    alt={`Generated product ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-bold">
                    #{idx + 1}
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => addImageToShop(img.image, idx)}
                    disabled={isUploading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Upload to Shop
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => downloadImage(img.image, idx)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example Prompts */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Try These Prompts:</h4>
        <div className="grid grid-cols-1 gap-2">
          {getExamplePrompts().map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => copyPrompt(example)}
              className="text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm text-gray-700"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}