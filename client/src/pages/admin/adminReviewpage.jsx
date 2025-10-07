import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdStar, MdPerson, MdEmail, MdRestaurant, MdFastfood, MdCheckCircle, MdDelete, MdExpandMore } from "react-icons/md";

export function AdminReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load reviews",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, userName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/reviews/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        title: "Approved!",
        text: `Review from ${userName} has been approved.`,
        icon: "success",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to approve review",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleDelete = async (id, userName) => {
    const confirm = await Swal.fire({
      title: "Delete Review?",
      text: `Delete review from ${userName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F85606",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      position: "center"
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://artisanconnect-backend.onrender.com/api/v1/reviews/delete/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire({
          title: "Deleted!",
          text: "The review has been deleted.",
          icon: "success",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the review.",
          icon: "error",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
    }
  };

  const toggleReviewExpand = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MdStar
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
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
                Review Management
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage customer reviews
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdStar className="text-2xl text-white" />
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
              <MdStar className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 text-sm">Customer reviews will appear here</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Review Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative flex-shrink-0">
                    <img
                      src={review.profilePicture}
                      alt={review.name}
                      className="w-14 h-14 object-cover rounded-full border-2 border-orange-200 shadow-sm"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 text-base line-clamp-1">{review.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <MdEmail className="text-gray-400" />
                      <span className="truncate">{review.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        review.isApproved 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                        {review.isApproved ? "✓ Approved" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment Preview */}
                <div className="bg-white rounded-lg p-3 mt-2">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedReview === review._id && (
                <div className="border-t border-orange-100">
                  {/* Full Comment */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <MdStar className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Review Comment</h4>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 mb-3">
                      <p className="text-sm text-gray-800 leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Review Details */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white p-3 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <MdFastfood className="text-[#F85606] text-sm" />
                          <span className="text-xs">Item</span>
                        </div>
                        <p className="font-bold text-sm text-gray-800 truncate">{review.itemName}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <MdRestaurant className="text-[#F85606] text-sm" />
                          <span className="text-xs">Restaurant</span>
                        </div>
                        <p className="font-bold text-sm text-gray-800 truncate">{review.restaurantName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white space-y-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review._id, review.name)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                      >
                        <MdCheckCircle className="text-xl" />
                        Approve Review
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(review._id, review.name)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      <MdDelete className="text-xl" />
                      Delete Review
                    </button>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleReviewExpand(review._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {expandedReview === review._id ? (
                  <>
                    <MdExpandMore className="text-xl transform rotate-180 transition-transform" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <MdExpandMore className="text-xl transition-transform" />
                    View Details & Actions
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}