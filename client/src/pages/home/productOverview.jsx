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

  // Calculate average rating from reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/collection/getOne/${key}`
      )
      .then((res) => {
        setArtisanItem(res.data);
        setLoadingStatus("Loaded");

        if (res.data.shopId) {
          axios
            .get(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/owner/getOne/${
                res.data.shopId
              }`
            )
            .then((shopRes) => setShop(shopRes.data))
            .catch((err) => console.error("Failed to load shop", err));
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadingStatus("error");
      });

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/reviews/${key}`)
      .then((res) => {
        setReviews(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [refresh, key]);

  const handleAddReview = async () => {
    setRefresh(false);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to submit a review.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/reviews`,
        {
          productId: key,
          rating: userRating,
          comment: userComment,
          ownerId: shop.ownerId,
          shopName: shop.name,
          itemName: artisanItem.name,
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
      <div className="min-h-screen bg-[#F5F5F5] flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadingStatus === "error") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex justify-center items-center px-4">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <div className="text-[#F85606] text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-[#212121] mb-2">
            Item Not Found
          </h2>
          <p className="text-[#757575] mb-4">Failed to load item details.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#F85606] hover:bg-[#E85000] text-white px-6 py-2 rounded font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-32">
      {/* Header */}
      {/* Image Slider */}
      <div className="bg-white">
        <ImageSlider images={artisanItem.images} />
      </div>
      {/* // Add this section AFTER the Image Slider section and BEFORE Product Info
      (around line 150) */}
      {/* Story Video Section */}
      {artisanItem.storyVideo && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-8 h-8 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  📱 Story Video
                </h3>
                <p className="text-xs text-gray-600">
                  Watch product demonstration
                </p>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-purple-300 bg-black">
              <video
                src={artisanItem.storyVideo}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-96 object-contain"
                poster={artisanItem.images?.[0]}
              >
                Your browser does not support the video tag.
              </video>

              {/* Video Overlay Badge */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Story
              </div>
            </div>

            <p className="text-xs text-center text-purple-700 mt-2 font-medium">
              🎬 See this product in action
            </p>
          </div>
        </div>
      )}
      {/* Product Info */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-lg font-semibold text-[#212121] flex-1 pr-3 leading-tight">
            {artisanItem.name}
          </h1>
          <button className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-[#757575]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Average Rating Display */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Rating style={{ maxWidth: 80 }} value={averageRating} readOnly />
          </div>
          <span className="text-sm font-semibold text-[#F85606]">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-[#757575]">
            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-[#F85606]">
            Rs.{parseFloat(artisanItem.price).toFixed(2)}
          </span>
          <span className="text-sm text-[#9E9E9E] line-through">
            Rs.{(parseFloat(artisanItem.price) * 1.2).toFixed(2)}
          </span>
          <span className="bg-[#FFE5DB] text-[#F85606] px-2 py-0.5 rounded text-xs font-bold">
            -17%
          </span>
        </div>

        {artisanItem.category && (
          <div className="inline-block bg-[#F9F9F9] border border-[#E0E0E0] px-3 py-1 rounded text-sm text-[#757575]">
            {artisanItem.category}
          </div>
        )}
      </div>
      {/* Vouchers Section with Add to Cart */}
      <div className="bg-white px-4 py-3 mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFC839] w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#212121]">Vouchers</p>
              <p className="text-xs text-[#757575]">Collect vouchers</p>
            </div>
          </div>
          <button className="bg-[#F85606] text-white px-4 py-1.5 rounded text-sm font-semibold">
            Collect
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          className="w-full bg-[#F85606] hover:bg-[#E85000] text-white py-3 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
      {/* Product Details */}
      <div className="bg-white px-4 py-4 mb-2">
        <h3 className="text-base font-bold text-[#212121] mb-3">
          Product Details
        </h3>
        <div className="space-y-3">
          <div className="flex">
            <span className="text-sm text-[#757575] w-28 flex-shrink-0">
              Category
            </span>
            <span className="text-sm text-[#212121] font-medium">
              {artisanItem.category || "General"}
            </span>
          </div>
          <div className="flex">
            <span className="text-sm text-[#757575] w-28 flex-shrink-0">
              Stock
            </span>
            <span
              className={`text-sm font-medium ${
                artisanItem.available ? "text-[#0ABF53]" : "text-[#D0011B]"
              }`}
            >
              {artisanItem.available ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>
      {/* Description */}
      <div className="bg-white px-4 py-4 mb-2">
        <h3 className="text-base font-bold text-[#212121] mb-2">Description</h3>
        <p className="text-sm text-[#757575] leading-relaxed">
          {artisanItem.description}
        </p>
      </div>
      {/* Shop Information */}
      {shop && (
        <div className="bg-white px-4 py-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#212121]">Sold by</h3>
            <button
              onClick={() => {
                if (shop?._id) {
                  navigate(`/shop/${shop._id}`, {
                    state: { packageDetails: shop },
                  });
                }
              }}
              className="text-[#F85606] text-sm font-semibold"
            >
              Visit Store
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            {shop.images?.[0] && (
              <img
                src={shop.images[0]}
                alt={shop.name}
                className="w-12 h-12 rounded-lg object-cover border border-[#E0E0E0]"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-[#212121] text-sm">
                {shop.name}
              </h4>
              <p className="text-xs text-[#757575]">{shop.ownerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#757575]">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-[#FFC839]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-[#212121]">92%</span>
              <span>Positive Ratings</span>
            </div>
          </div>
        </div>
      )}
      {/* Ratings & Reviews */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#212121]">
            Ratings & Reviews ({reviews.length})
          </h3>
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-[#212121]">
                {averageRating.toFixed(1)}
              </span>
              <svg
                className="w-5 h-5 text-[#FFC839]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-6 bg-[#F9F9F9] rounded">
            <p className="text-sm text-[#757575]">
              No reviews yet. Be the first to review!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div
                key={review._id}
                className="border-b border-[#E0E0E0] pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={review.profilePicture}
                    alt={review.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-[#212121] text-sm">
                        {review.name}
                      </p>
                      <p className="text-xs text-[#9E9E9E]">
                        {new Date(review.data).toLocaleDateString()}
                      </p>
                    </div>
                    <Rating
                      style={{ maxWidth: 70 }}
                      value={review.rating}
                      readOnly
                    />
                    <p className="text-sm text-[#757575] mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length > 3 && (
          <button className="w-full mt-4 text-[#F85606] text-sm font-semibold py-2 border border-[#F85606] rounded">
            View All {reviews.length} Reviews
          </button>
        )}
      </div>
      {/* Write Review */}
      <div className="bg-white px-4 py-4 mb-2">
        <h3 className="text-base font-bold text-[#212121] mb-3">
          Write a Review
        </h3>

        <div className="mb-3">
          <Rating
            style={{ maxWidth: 100 }}
            value={userRating}
            onChange={setUserRating}
          />
        </div>

        <textarea
          className="w-full border border-[#E0E0E0] p-3 rounded text-sm resize-none focus:outline-none focus:border-[#F85606]"
          rows="4"
          placeholder="Share your experience..."
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
        />

        <button
          className="w-full bg-[#F85606] hover:bg-[#E85000] text-white py-3 rounded font-semibold mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddReview}
          disabled={!userRating}
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
