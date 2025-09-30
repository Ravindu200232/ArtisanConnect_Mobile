import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdStar, MdPerson, MdEmail, MdRestaurant, MdFastfood, MdCheckCircle, MdDelete } from "react-icons/md";

export function AdminReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/v1/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Swal.fire("Error", "Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, userName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/v1/reviews/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire("Approved!", `Review from ${userName} has been approved.`, "success");
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      Swal.fire("Error", "Failed to approve review", "error");
    }
  };

  const handleDelete = async (id, userName) => {
    const confirm = await Swal.fire({
      title: "Delete Review?",
      text: `Delete review from ${userName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:3000/api/v1/reviews/delete/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("Deleted!", "The review has been deleted.", "success");
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire("Error!", "Failed to delete the review.", "error");
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
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Review Management
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage and approve customer reviews
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{reviews.length} reviews total</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdStar className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No reviews found</p>
            <p className="text-sm text-gray-400 mt-1">Customer reviews will appear here</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Review Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <img
                    src={review.profilePicture}
                    alt={review.name}
                    className="w-12 h-12 object-cover rounded-full border-2 border-[#B7E892]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 truncate">{review.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <MdEmail className="text-gray-400" />
                      <span className="truncate">{review.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600 ml-1">({review.rating}/5)</span>
                    </div>
                  </div>
                </div>

                {/* Comment Preview */}
                <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                  {review.comment}
                </p>
              </div>

              {/* Expandable Content */}
              {expandedReview === review._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Full Comment */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Review Comment</h4>
                    <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
                      {review.comment}
                    </div>
                  </div>

                  {/* Review Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <MdFastfood className="text-gray-400" />
                        <span>Item</span>
                      </div>
                      <p className="font-semibold text-gray-800 truncate">{review.itemName}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <MdRestaurant className="text-gray-400" />
                        <span>Restaurant</span>
                      </div>
                      <p className="font-semibold text-gray-800 truncate">{review.restaurantName}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review._id, review.name)}
                        className="bg-[#32CD32] text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-[#2DB82D] flex items-center justify-center gap-2"
                      >
                        <MdCheckCircle className="text-lg" />
                        Approve
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(review._id, review.name)}
                      className="bg-red-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <MdDelete className="text-lg" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleReviewExpand(review._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedReview === review._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Details & Actions
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}