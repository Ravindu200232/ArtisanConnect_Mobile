import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ShopDetails() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [shop, setShop] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) return setLoading(false);

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/getOne/${id}`
        );
        setShop(res.data);

        const collRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/collection/getAll/${id}`
        );
        setCollections(collRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load shop or collections.");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  useEffect(() => {
    if (!shop?.images?.length) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === shop.images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [shop]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-500 font-semibold text-lg">Shop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Daraz Orange */}
      <div className="bg-gradient-to-r  shadow-md sticky top-0 z-20">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-black flex-1">Shop Details</h1>
          <button className="text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Shop Image Slider */}
      <div className="relative w-full h-72 bg-white">
        <img
          src={shop.images?.[currentImageIndex] || "/default-shop.jpg"}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {shop.images?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {shop.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? "bg-orange-500 w-6" : "bg-white/70 w-2"
                }`}
              ></button>
            ))}
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Shop Info Card */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{shop.name}</h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold text-gray-700">4.5</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">1.2k Reviews</span>
              </div>
            </div>
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
              OFFICIAL
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Owner</p>
                <p className="text-sm font-semibold text-gray-800">{shop.ownerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-800">{shop.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{shop.phone}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {shop.description && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600 leading-relaxed">{shop.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold shadow-md transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat Now
            </button>
            <button className="w-12 h-12 bg-white border-2 border-orange-500 text-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">All Products</h2>
            <span className="text-sm text-gray-500">{collections.length} items</span>
          </div>
          
          {collections.length > 0 ? (
            <div className="space-y-3">
              {collections.map((item) => (
                <Link key={item._id} to={`/product/${item._id}`}>
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-orange-300 transition-colors">
                    <div className="flex gap-3 p-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0 relative">
                        <img
                          src={item.images?.[0] || "/default-food.jpg"}
                          alt={item.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">SOLD OUT</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-orange-600">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </span>
                          </div>
                          
                          {item.available ? (
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                              Add to Cart
                            </button>
                          ) : (
                            <span className="bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium mb-2">No products available</p>
              <p className="text-gray-400 text-sm">This shop hasn't added any products yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}