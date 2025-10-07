import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export function ShopReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Reviews
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Customer feedback & ratings
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Reviews</span>
            </div>
            <span className="text-white font-bold text-xl">{reviews.length}</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-4 space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#F85606]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 text-sm">Customer reviews will appear here</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100"
            >
              {/* User Info Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={review.profilePicture}
                    alt="profile"
                    className="w-14 h-14 rounded-full border-2 border-orange-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base">{review.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{review.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    review.isApproved 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {review.isApproved ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-orange-100">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-6 h-6 ${
                          index < review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="ml-auto bg-[#F85606] text-white px-3 py-1 rounded-lg">
                    <span className="text-sm font-bold">{review.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div className="p-4 bg-white border-t border-orange-100">
                <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Review Comment
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 border border-orange-100">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>

              {/* Shop and Item Info */}
              <div className="p-4 bg-gray-50 border-t border-orange-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs text-gray-500 font-bold">Shop</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 truncate">{review.shopName}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-xs text-gray-500 font-bold">Item</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 truncate">{review.itemName}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Bottom Toast Position */}
      <style>{`
        .swal2-popup {
          border-radius: 20px !important;
          padding: 2rem 1.5rem !important;
        }
        
        .swal2-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
        }
        
        .swal2-styled.swal2-confirm {
          background: linear-gradient(to right, #F85606, #FF7420) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 12px 32px !important;
          box-shadow: 0 4px 12px rgba(248, 86, 6, 0.3) !important;
        }
      `}</style>
    </div>
  );
}