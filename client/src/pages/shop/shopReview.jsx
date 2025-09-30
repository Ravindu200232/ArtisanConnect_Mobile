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
      <div className="flex justify-center items-center h-64 bg-[#DBF3C9]">
        <div className="w-16 h-16 border-4 border-[#32CD32] border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#32CD32] mb-2">Customer Reviews</h1>
        <p className="text-gray-600">Manage and view customer feedback</p>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-[#B7E892]">
            <div className="text-[#93DC5C] text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Customer reviews will appear here</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl shadow-lg border border-[#B7E892] p-4"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={review.profilePicture}
                  alt="profile"
                  className="w-12 h-12 rounded-full border-2 border-[#93DC5C]"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{review.name}</h3>
                  <p className="text-sm text-gray-600">{review.email}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  review.isApproved 
                    ? "bg-[#93DC5C] text-white" 
                    : "bg-yellow-200 text-yellow-800"
                }`}>
                  {review.isApproved ? "Approved" : "Pending"}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${
                        index < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {review.rating}/5
                </span>
              </div>

              {/* Comment */}
              <div className="mb-3">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Shop and Item Info */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-[#DBF3C9] rounded-lg p-2">
                  <span className="font-semibold">Shop:</span>
                  <p className="truncate">{review.shopName}</p>
                </div>
                <div className="bg-[#DBF3C9] rounded-lg p-2">
                  <span className="font-semibold">Item:</span>
                  <p className="truncate">{review.itemName}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (Hidden on mobile) */}
      <div className="hidden lg:block mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#32CD32] text-white">
                <th className="py-4 px-4 text-left font-semibold">User</th>
                <th className="py-4 px-4 text-left font-semibold">Email</th>
                <th className="py-4 px-4 text-left font-semibold">Rating</th>
                <th className="py-4 px-4 text-left font-semibold">Comment</th>
                <th className="py-4 px-4 text-left font-semibold">Status</th>
                <th className="py-4 px-4 text-left font-semibold">Item</th>
                <th className="py-4 px-4 text-left font-semibold">Shop</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr
                  key={review._id}
                  className={`border-b transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#DBF3C9]/30'
                  } hover:bg-[#B7E892]/30`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.profilePicture}
                        alt="profile"
                        className="w-10 h-10 rounded-full border-2 border-[#93DC5C]"
                      />
                      <span className="font-medium text-gray-800">{review.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{review.email}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-semibold text-gray-700">{review.rating}/5</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 max-w-xs">
                    {review.comment}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      review.isApproved 
                        ? "bg-[#93DC5C] text-white" 
                        : "bg-yellow-200 text-yellow-800"
                    }`}>
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{review.itemName}</td>
                  <td className="py-4 px-4 text-gray-700">{review.shopName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}