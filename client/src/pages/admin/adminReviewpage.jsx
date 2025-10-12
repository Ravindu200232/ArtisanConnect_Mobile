import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdStar, MdPerson, MdEmail, MdRestaurant, MdFastfood, MdCheckCircle, MdDelete, MdExpandMore, MdSearch, MdClear } from "react-icons/md";

export function AdminReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      setFilteredReviews(response.data);
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
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/reviews/delete/${id}`,
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

  // Filter reviews based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter((review) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          review.name?.toLowerCase().includes(searchLower) ||
          review.email?.toLowerCase().includes(searchLower) ||
          review.comment?.toLowerCase().includes(searchLower) ||
          review.itemName?.toLowerCase().includes(searchLower) ||
          review.restaurantName?.toLowerCase().includes(searchLower) ||
          review.rating?.toString().includes(searchTerm) ||
          (review.isApproved && "approved".includes(searchLower)) ||
          (!review.isApproved && "pending".includes(searchLower))
        );
      });
      setFilteredReviews(filtered);
    }
  }, [searchTerm, reviews]);

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

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Stats calculation
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(review => review.isApproved).length;
  const pendingReviews = totalReviews - approvedReviews;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center p-4">
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
          
          {/* Search Bar */}
          <div className="relative mt-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search reviews by name, email, comment, item, restaurant, rating..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-800 pl-10 pr-10 py-3.5 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-white focus:border-white focus:outline-none placeholder-gray-500 text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <MdClear className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium text-sm">Total Reviews</span>
              </div>
              <span className="text-white font-bold text-xl">{totalReviews}</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-sm">Showing</span>
              </div>
              <span className="text-white font-bold text-xl">{filteredReviews.length}</span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Approved</span>
              </div>
              <span className="text-white font-bold text-lg">{approvedReviews}</span>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Pending</span>
              </div>
              <span className="text-white font-bold text-lg">{pendingReviews}</span>
            </div>
          </div>

          {/* Rating Stats */}
          {totalReviews > 0 && (
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Avg Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold text-lg">{averageRating}</span>
                <MdStar className="text-yellow-400 text-sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-4 space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchTerm ? (
                <MdSearch className="text-3xl text-[#F85606]" />
              ) : (
                <MdStar className="text-3xl text-[#F85606]" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? "No Reviews Found" : "No Reviews Yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? `No reviews found for "${searchTerm}". Try different search terms.`
                : "Customer reviews will appear here once they start submitting reviews."
              }
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Review Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative flex-shrink-0">
                    <img
                      src={review.profilePicture || "/default-avatar.png"}
                      alt={review.name}
                      className="w-14 h-14 object-cover rounded-full border-2 border-orange-200 shadow-sm"
                    />
                    {review.isApproved && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <MdCheckCircle className="text-white text-xs" />
                      </div>
                    )}
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
                        <span className="text-xs text-gray-600 ml-1">({review.rating})</span>
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
                <div className="bg-white rounded-lg p-3 mt-2 border border-orange-100">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {review.comment}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MdFastfood className="text-[#F85606]" />
                    <span className="truncate max-w-[120px]">{review.itemName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdRestaurant className="text-[#F85606]" />
                    <span className="truncate max-w-[120px]">{review.restaurantName}</span>
                  </div>
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

                    {/* Rating Details */}
                    <div className="bg-white p-3 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#F85606]">{review.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white space-y-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review._id, review.name)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <MdCheckCircle className="text-xl" />
                        Approve Review
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(review._id, review.name)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
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
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
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