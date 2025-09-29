import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImageSlider from "../../components/imageSlider";
import { addToCart, LoadCart } from "../../utils/card";
import toast from "react-hot-toast";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

export default function ArtisanItemOverview() {
  const { key } = useParams();
  const navigate = useNavigate();

  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [artisanItem, setArtisanItem] = useState({});
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // Fetch artisan item details
    axios
      .get(`http://localhost:3000/api/v1/collection/getOne/${key}`)
      .then((res) => {
        setArtisanItem(res.data);
        setLoadingStatus("Loaded");
        console.log(res.data.shopId)

        if (res.data.shopId) {
          axios
            .get(
              `http://localhost:3000/api/v1/owner/getOne/${res.data.shopId}`
            )
            .then((shopRes) => setShop(shopRes.data))
            .catch((err) => console.error("Failed to load shop", err));
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadingStatus("error");
      });

    // Fetch reviews
    axios
      .get(`http://localhost:3000/api/v1/reviews/${key}`)
      .then((res) => {
        setReviews(res.data);
        console.log(res.data)
      })
      .catch((err) => {
        console.error(err);
      });
  }, [refresh]);

  const handleAddReview = async () => {
    setRefresh(false);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to submit a review.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/reviews`,
        {
          productId: key,
          rating: userRating,
          comment: userComment,
          ownerId: shop.ownerId,
          shopName: shop.name,
          itemName: artisanItem.name
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setReviews((prev) => [...prev, response.data]);
      setUserRating(0);
      setUserComment("");
      toast.success("Review submitted successfully.");
      setRefresh(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    }
  };

  if (loadingStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex justify-center items-center pt-16">
        <div className="w-16 h-16 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadingStatus === "error") {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex justify-center items-center px-4 pt-16">
        <div className="text-center bg-white rounded-2xl p-8 border border-[#B7E892] shadow-lg">
          <div className="text-[#93DC5C] text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Item Not Found</h2>
          <p className="text-gray-500 mb-4">Failed to load item details. Please try again later.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#32CD32] hover:bg-[#2DB82D] text-white px-6 py-2 rounded-xl font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20 pt-4">
      {/* Top Spacing */}
      <div className="h-4"></div>

      {/* Product Details Section */}
      <div className="bg-white rounded-3xl shadow-lg mx-4 mb-6 overflow-hidden">
        {/* Image Slider with proper spacing */}
        <div className="relative">
          <div className="p-2"> {/* Added padding around image */}
            <ImageSlider images={artisanItem.images} />
          </div>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg border border-gray-200"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Product Info with better spacing */}
        <div className="p-6 pt-4">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex-1 pr-3 leading-tight">
              {artisanItem.name}
            </h1>
            <span className={`px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              artisanItem.available 
                ? "bg-[#93DC5C] text-white" 
                : "bg-red-100 text-red-600"
            }`}>
              {artisanItem.available ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="mb-5">
            <p className="text-3xl font-bold text-[#32CD32] mb-2">
              Rs.{parseFloat(artisanItem.price).toFixed(2)}
            </p>

            {artisanItem.category && (
              <div className="mb-3">
                <span className="bg-[#DBF3C9] text-[#32CD32] px-3 py-1 rounded-full text-sm font-semibold">
                  {artisanItem.category}
                </span>
              </div>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6 text-sm">
            {artisanItem.description}
          </p>

          <button
            className="w-full bg-[#32CD32] hover:bg-[#2DB82D] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => {
              if (artisanItem.available) {
                addToCart(artisanItem._id, 1);
                toast.success("Added to Cart!");
                console.log(LoadCart());
              }
            }}
            disabled={!artisanItem.available}
          >
            {artisanItem.available ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* Shop Information */}
      {shop && (
        <div className="mx-4 mb-6 bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
          <h2 className="text-xl font-bold text-[#32CD32] mb-4">Shop Information</h2>
          
          <div className="flex items-center gap-4 mb-4">
            {shop.images?.[0] && (
              <div className="flex-shrink-0">
                <img
                  src={shop.images[0]}
                  alt={shop.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-[#93DC5C]"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-lg truncate">{shop.name}</h3>
              <p className="text-gray-600 text-sm">{shop.ownerName}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-5">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#32CD32] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="flex-1">{shop.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#32CD32] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{shop.phone}</span>
            </div>
          </div>

          <button
            className="w-full bg-[#93DC5C] hover:bg-[#7ED048] text-white py-3 rounded-xl font-semibold transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => {
              if (shop?._id) {
                navigate(`/shop/${shop._id}`, {
                  state: { packageDetails: shop },
                });
              } else {
                toast.error("Shop details are not available.");
              }
            }}
          >
            Visit Shop
          </button>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mx-4 mb-6 bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#32CD32]">Customer Reviews</h2>
          <span className="bg-[#DBF3C9] text-[#32CD32] px-3 py-1 rounded-full text-sm font-semibold">
            {reviews.length} reviews
          </span>
        </div>

        {/* Existing Reviews */}
        <div className="space-y-4 mb-8">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-[#93DC5C] text-4xl mb-3">💬</div>
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="border border-[#B7E892] rounded-xl p-4 bg-[#DBF3C9]/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={review.profilePicture}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#93DC5C] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">{review.name}</p>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(review.data).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2">
                      <Rating
                        style={{ maxWidth: 80 }}
                        value={review.rating}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Write Review Section */}
        <div className="border-t border-[#B7E892] pt-6">
          <h3 className="text-lg font-bold text-[#32CD32] mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <Rating
              style={{ maxWidth: 120 }}
              value={userRating}
              onChange={setUserRating}
            />
          </div>
          
          <textarea
            className="w-full border border-[#93DC5C] p-3 rounded-xl mb-4 text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
            rows="4"
            placeholder="Share your experience with this product..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
          />
          
          <button
            className="w-full bg-[#32CD32] hover:bg-[#2DB82D] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleAddReview}
            disabled={!userRating}
          >
            Submit Review
          </button>
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-4"></div>
    </div>
  );
}