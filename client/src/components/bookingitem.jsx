import { MdDeleteForever } from "react-icons/md";
import { AiFillDownSquare, AiFillUpSquare } from "react-icons/ai";
import axios from "axios";
import { useEffect, useState } from "react";
import { addToCart, removeFromCart } from "../utils/card";

export default function BookingItem({ itemKey, qty, refresh }) {
  console.log("itemkey", itemKey);
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      axios
        .get(`http://localhost:3000/api/v1/collection/getOne/${itemKey}`)
        .then((res) => {
          setItem(res.data);
          setStatus("success");
          console.log(res.data);
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

  if (status === "loading") {
    return (
      <div className="flex items-center p-4 bg-white rounded-2xl border border-[#B7E892] animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-center">
        Failed to load item.
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 bg-white rounded-2xl shadow-lg border border-[#B7E892] hover:shadow-xl transition-all duration-300">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[#93DC5C]">
        <img
          src={item?.images?.[0] || "/default-food.jpg"}
          alt={item?.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate">{item?.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item?.description}</p>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleRemove}
            disabled={updating}
            className={`ml-3 flex-shrink-0 transition-all duration-200 ${
              updating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
            }`}
          >
            <MdDeleteForever className="size-6 text-red-400 hover:text-red-600" />
          </button>
        </div>

        {/* Price and Category */}
        <div className="flex items-center gap-3 mb-3">
          <p className="text-lg font-bold text-[#32CD32]">
            Rs.{parseFloat(item?.price).toFixed(2)}
          </p>
          {item?.category && (
            <span className="bg-[#DBF3C9] text-[#32CD32] px-2 py-1 rounded-full text-xs font-semibold">
              {item.category}
            </span>
          )}
        </div>

        {/* Quantity Controls and Total */}
        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-3 bg-[#DBF3C9] rounded-full px-3 py-2 border border-[#93DC5C]">
            {/* Decrease Button */}
            <button
              onClick={handleDecrease}
              disabled={updating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                updating 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-[#32CD32] hover:bg-[#32CD32] hover:text-white shadow-sm active:scale-95"
              }`}
            >
              <AiFillDownSquare className="size-4" />
            </button>

            {/* Quantity Display */}
            <div className="min-w-8 text-center">
              <span className="font-bold text-gray-800 text-base">{qty}</span>
            </div>

            {/* Increase Button */}
            <button
              onClick={handleIncrease}
              disabled={updating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                updating 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-[#32CD32] hover:bg-[#32CD32] hover:text-white shadow-sm active:scale-95"
              }`}
            >
              <AiFillUpSquare className="size-4" />
            </button>
          </div>

          {/* Total Price */}
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Item Total</p>
            <p className="text-lg font-bold text-[#32CD32]">
              Rs.{((item?.price || 0) * qty).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}