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
          `http://localhost:3000/api/v1/owner/getOne/${id}`
        );
        setShop(res.data);

        const collRes = await axios.get(
          `http://localhost:3000/api/v1/collection/getAll/${id}`
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
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
          <p className="text-red-500 font-medium">Shop not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#B7E892] sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-[#32CD32] text-center">
            Shop Details
          </h1>
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
          {/* Image Slider */}
          <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden">
            <img
              src={shop.images?.[currentImageIndex] || "/default-shop.jpg"}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
            
            {shop.images?.length > 1 && (
              <>
                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {shop.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${
                        idx === currentImageIndex ? "bg-[#32CD32]" : "bg-white/70"
                      }`}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Shop Details */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 bg-[#32CD32] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">👤</span>
                </span>
                <span>Owner: <strong>{shop.ownerName}</strong></span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 bg-[#32CD32] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📍</span>
                </span>
                <span>{shop.address}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-5 h-5 bg-[#32CD32] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📞</span>
                </span>
                <span>{shop.phone}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-gray-700 text-sm leading-relaxed">{shop.description}</p>
            </div>
          </div>
        </div>

        {/* Collections Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892]">
          <h2 className="text-lg font-bold text-[#32CD32] mb-4">Available Dishes</h2>
          
          {collections.length > 0 ? (
            <div className="space-y-4">
              {collections.map((item) => (
                <Link key={item._id} to={`/product/${item._id}`}>
                  <div className="bg-gray-50 rounded-xl p-3 border border-[#B7E892] active:bg-[#F0F8E7] transition-colors">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={item.images?.[0] || "/default-food.jpg"}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-semibold text-gray-800 truncate">
                            {item.name}
                          </h3>
                          <span className="text-[#32CD32] font-bold text-sm">
                            ₹{parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          {item.available ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span>
                              Not Available
                            </span>
                          )}
                          
                          <span className="text-[#32CD32] text-xs font-medium">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-gray-500 text-sm">No food items found for this shop.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-4"></div>
    </div>
  );
}