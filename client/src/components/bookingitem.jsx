import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { useEffect, useState } from "react";
import { addToCart, removeFromCart } from "../utils/card";

export default function BookingItem({ itemKey, qty, refresh, isSelected, onSelectChange }) {
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      axios
        .get(`https://artisanconnect-backend.onrender.com/api/v1/collection/getOne/${itemKey}`)
        .then((res) => {
          setItem(res.data);
          setStatus("success");
        })
        .catch((err) => {
          console.log(err);
          setStatus("error");
          removeFromCart(itemKey);
          refresh();
        });
    }
  }, [status, itemKey, refresh]);

  const handleIncrease = () => {
    if (updating) return;
    setUpdating(true);
    addToCart(itemKey, 1);
    setTimeout(() => {
      refresh();
      setUpdating(false);
    }, 200);
  };

  const handleDecrease = () => {
    if (updating) return;
    setUpdating(true);
    
    if (qty === 1) {
      removeFromCart(itemKey);
    } else {
      addToCart(itemKey, -1);
    }
    
    setTimeout(() => {
      refresh();
      setUpdating(false);
    }, 200);
  };

  const handleRemove = () => {
    if (updating) return;
    setUpdating(true);
    removeFromCart(itemKey);
    setTimeout(() => {
      refresh();
      setUpdating(false);
    }, 300);
  };

  const handleCheckboxChange = (e) => {
    onSelectChange(itemKey, e.target.checked);
  };

  if (status === "loading") {
    return (
      <div className="flex items-start p-4 bg-white animate-pulse">
        <div className="flex-shrink-0">
          <input type="checkbox" className="w-5 h-5 mt-2" disabled />
        </div>
        <div className="w-20 h-20 bg-gray-200 rounded ml-3"></div>
        <div className="ml-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return null;
  }

  const originalPrice = (item?.price * 1.25).toFixed(2);
  const discount = Math.round(((originalPrice - item?.price) / originalPrice) * 100);

  return (
    <div className="flex items-start p-4 bg-white">
      {/* Checkbox */}
      <div className="flex-shrink-0">
        <input 
          type="checkbox" 
          className="w-5 h-5 accent-[#F85606] mt-2"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
      </div>

      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 ml-3 rounded overflow-hidden border border-[#E0E0E0]">
        <img
          src={item?.images?.[0] || "/default-product.jpg"}
          alt={item?.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 ml-3 min-w-0">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-[#212121] line-clamp-2 mb-1">
          {item?.name}
        </h3>

        {/* Product Details */}
        <p className="text-xs text-[#757575] mb-2">
          {item?.category ? `${item.category}` : "No Brand"}
        </p>

        {/* Stock Warning */}
        {item?.stock && item.stock < 10 && (
          <p className="text-xs text-[#D0011B] mb-2">
            Only {item.stock} item(s) in stock
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-[#F85606]">
            Rs. {parseFloat(item?.price).toFixed(0)}
          </span>
          <span className="text-xs text-[#9E9E9E] line-through">
            Rs. {originalPrice}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-[#E0E0E0] rounded">
            <button
              onClick={handleDecrease}
              disabled={updating}
              className={`w-8 h-8 flex items-center justify-center text-[#757575] hover:bg-[#F5F5F5] transition-colors ${
                updating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <div className="w-10 text-center border-x border-[#E0E0E0]">
              <span className="text-sm font-medium text-[#212121]">{qty}</span>
            </div>

            <button
              onClick={handleIncrease}
              disabled={updating}
              className={`w-8 h-8 flex items-center justify-center text-[#757575] hover:bg-[#F5F5F5] transition-colors ${
                updating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleRemove}
            disabled={updating}
            className={`p-2 transition-colors ${
              updating ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FFF5F0]"
            } rounded`}
          >
            <svg className="w-5 h-5 text-[#757575] hover:text-[#D0011B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}