import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const bookingData = location.state?.sendData || [];
    setOrderItems(bookingData);
  }, [location.state]);

  if (!location.state || !location.state.sendData) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl p-8 border border-[#B7E892] shadow-lg">
          <div className="text-[#93DC5C] text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Booking Details Not Found
          </h2>
          <p className="text-gray-500 mb-6">Please go back and try again</p>
          <button
            onClick={() => navigate("/product")}
            className="bg-[#32CD32] hover:bg-[#2DB82D] text-white px-6 py-2 rounded-xl font-semibold transition-colors"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const handleProceedToPayment = () => {
    navigate("/payment", {
      state: {
        amount: totalAmount,
        bookingIds: orderItems.map((item) => item.orderId),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20 ">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-[#32CD32] to-[#93DC5C] px-6 py-12 rounded-b-3xl shadow-lg text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-white/90 text-sm">
          Your order has been successfully placed
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="mx-4 mt-6 bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        <h2 className="text-xl font-bold text-[#32CD32] mb-4">Order Summary</h2>

        {/* Customer Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-[#32CD32] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">
                {orderItems[0]?.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#32CD32] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600">Delivery Address</p>
              <p className="font-semibold text-gray-800">
                {orderItems[0]?.address}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Order Items ({orderItems.length})
          </h3>
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-[#DBF3C9]/30 rounded-xl border border-[#B7E892]"
              >
                <img
                  src={item.image}
                  alt={item.Item_name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-[#93DC5C]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm truncate">
                    {item.Item_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                    <span>Qty: {item.quantity}</span>
                    <span>Rs.{item.price?.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Order ID: {item.orderId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Item Total</p>
                  <p className="font-bold text-[#32CD32] text-lg">
                    Rs.{item.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="border-t border-[#B7E892] pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-[#32CD32]">
              Rs.{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-6 space-y-3">
        <button
          onClick={handleProceedToPayment}
          className="w-full bg-[#32CD32] hover:bg-[#2DB82D] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-3"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Proceed to Payment
        </button>

        <button
          onClick={() => navigate("/item")}
          className="w-full bg-[#93DC5C] hover:bg-[#7ED048] text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Continue Shopping
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel Order
        </button>
      </div>

      {/* Order Status */}
      <div className="mx-4 mt-6 bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        <h3 className="text-lg font-semibold text-[#32CD32] mb-3">
          Order Status
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="w-10 h-10 bg-[#32CD32] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <p className="text-xs text-gray-600">Ordered</p>
          </div>

          <div className="flex-1 h-1 bg-[#DBF3C9] mx-2"></div>

          <div className="text-center">
            <div className="w-10 h-10 bg-[#DBF3C9] border-2 border-[#93DC5C] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-400 font-bold text-sm">2</span>
            </div>
            <p className="text-xs text-gray-400">Payment</p>
          </div>

          <div className="flex-1 h-1 bg-[#DBF3C9] mx-2"></div>

          <div className="text-center">
            <div className="w-10 h-10 bg-[#DBF3C9] border-2 border-[#93DC5C] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-400 font-bold text-sm">3</span>
            </div>
            <p className="text-xs text-gray-400">Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
