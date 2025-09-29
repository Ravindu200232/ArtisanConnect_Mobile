import { Link } from "react-router-dom";

export default function ProductCard({ item }) {
  const fallbackImage = "/default-food.jpg";
  const imageUrl = item.images?.[0] || fallbackImage;

  // Function to render star ratings if available
  const renderStars = (rating) => {
    if (!rating) return null;

    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Product Image */}
      <div className="relative">
        <img
          className="w-full h-40 object-cover"
          src={imageUrl}
          alt={item.name}
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category Badge */}
        {item.category && (
          <div className="absolute top-2 left-2 bg-[#32CD32] text-white px-2 py-1 rounded-full text-xs font-semibold">
            {item.category}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h2 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1">
          {item.name}
        </h2>

        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {item.description}
        </p>

        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-sm">{renderStars(item.rating)}</div>
            <span className="text-xs text-gray-500">({item.rating})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-[#32CD32]">
            Rs.{parseFloat(item.price).toFixed(2)}
          </p>

          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              item.available
                ? "bg-[#DBF3C9] text-[#32CD32]"
                : "bg-red-100 text-red-600"
            }`}
          >
            {item.available ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* View Details Button */}
        <Link
          to={`/product/${item._id}`}
          className="w-full mt-3 bg-[#32CD32] hover:bg-[#2DB82D] text-white text-center py-2 px-4 rounded-xl font-semibold transition-colors block"
        >
          View Detail
        </Link>
      </div>
    </div>
  );
}
