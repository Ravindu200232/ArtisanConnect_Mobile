import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Notification Utilities for Booking Confirmation
const showSuccessNotification = (title, message, timer = 3000) => {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#f0fdf4",
    color: "#065f46",
    iconColor: "#10b981",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-green-200",
      title: "text-green-800 font-bold text-sm",
      htmlContainer: "text-green-700 text-xs"
    }
  });
};

const showErrorNotification = (title, message, timer = 4000) => {
  return Swal.fire({
    title,
    text: message,
    icon: "error",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#fef2f2",
    color: "#7f1d1d",
    iconColor: "#ef4444",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-red-200",
      title: "text-red-800 font-bold text-sm",
      htmlContainer: "text-red-700 text-xs"
    }
  });
};

const showWarningNotification = (title, message, timer = 3500) => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#fffbeb",
    color: "#92400e",
    iconColor: "#f59e0b",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-amber-200",
      title: "text-amber-800 font-bold text-sm",
      htmlContainer: "text-amber-700 text-xs"
    }
  });
};

const showInfoNotification = (title, message, timer = 3000) => {
  return Swal.fire({
    title,
    text: message,
    icon: "info",
    timer,
    showConfirmButton: false,
    position: "top-end",
    toast: true,
    background: "#f0f9ff",
    color: "#0c4a6e",
    iconColor: "#3b82f6",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-blue-200",
      title: "text-blue-800 font-bold text-sm",
      htmlContainer: "text-blue-700 text-xs"
    }
  });
};

const showConfirmationDialog = (title, text, confirmText = "Yes", cancelText = "Cancel") => {
  return Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#6b7280",
    background: "#fffbeb",
    color: "#92400e",
    iconColor: "#f59e0b",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-amber-200",
      title: "text-amber-800 font-bold text-lg",
      htmlContainer: "text-amber-700",
      confirmButton: "rounded-xl font-bold px-6 py-2",
      cancelButton: "rounded-xl font-bold px-6 py-2"
    }
  });
};

const showPaymentSuccessNotification = (title, message) => {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    timer: 4000,
    showConfirmButton: true,
    confirmButtonText: "View Orders",
    confirmButtonColor: "#f97316",
    background: "#f0fdf4",
    color: "#065f46",
    iconColor: "#10b981",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-green-200",
      title: "text-green-800 font-bold text-xl",
      htmlContainer: "text-green-700 text-base",
      confirmButton: "rounded-xl font-bold px-6 py-3 text-base"
    }
  });
};

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const bookingData = location.state?.sendData || [];
    
    if (bookingData.length > 0) {
      setOrderItems(bookingData);
      // Show success notification when booking data is loaded
      showSuccessNotification(
        "Order Confirmed!", 
        `${bookingData.length} item${bookingData.length > 1 ? 's' : ''} added to your order`
      );
    } else {
      showErrorNotification("No Booking Data", "Please go back and try again");
    }
  }, [location.state]);

  const handleProceedToPayment = async () => {
    if (orderItems.length === 0) {
      showErrorNotification("No Items", "Please add items to proceed with payment");
      return;
    }

    setIsProcessing(true);
    
    // Show loading state
    const loadingNotification = Swal.fire({
      title: "Processing...",
      text: "Preparing your payment details",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
      background: "#f0f9ff",
      color: "#0c4a6e",
      customClass: {
        popup: "rounded-2xl shadow-2xl border-2 border-blue-200",
        title: "text-blue-800 font-bold text-lg",
        htmlContainer: "text-blue-700"
      }
    });

    try {
      // Simulate API call or processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Swal.close();
      
      // Show payment confirmation before navigating
      const result = await showConfirmationDialog(
        "Proceed to Payment", 
        `Total amount: Rs.${totalAmount.toFixed(2)}\nContinue to payment gateway?`,
        "Pay Now",
        "Review Order"
      );

      if (result.isConfirmed) {
        showInfoNotification("Redirecting", "Taking you to payment gateway...");
        
        // Navigate to payment page after a brief delay
        setTimeout(() => {
          navigate("/payment", {
            state: {
              amount: totalAmount,
              bookingIds: orderItems.map((item) => item.orderId),
              items: orderItems
            },
          });
        }, 1000);
      } else {
        showInfoNotification("Payment Cancelled", "You can proceed when ready");
      }
    } catch (error) {
      Swal.close();
      showErrorNotification("Payment Error", "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = async () => {
    const result = await showConfirmationDialog(
      "Continue Shopping", 
      "Are you sure you want to leave? Your order will be saved in cart.",
      "Yes, Continue",
      "Stay Here"
    );

    if (result.isConfirmed) {
      showInfoNotification("Redirecting", "Taking you back to shopping...");
      setTimeout(() => navigate("/product"), 800);
    }
  };

  const handleBackToHome = async () => {
    const result = await showConfirmationDialog(
      "Leave Order Confirmation", 
      "Your order details will be lost. Are you sure you want to go back?",
      "Yes, Go Back",
      "Stay Here"
    );

    if (result.isConfirmed) {
      navigate("/");
    }
  };

  if (!location.state || !location.state.sendData) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <div className="w-20 h-20 bg-[#FFF5F0] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#212121] mb-2">
            Booking Details Not Found
          </h2>
          <p className="text-[#757575] mb-6">Please go back and try again</p>
          <button
            onClick={() => navigate("/product")}
            className="bg-[#F85606] hover:bg-[#E85000] text-white px-6 py-3 rounded font-semibold transition-colors"
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToHome}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-[#212121]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#212121]">Order Confirmation</h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-white px-4 py-6 text-center border-b border-[#E0E0E0]">
        <div className="w-16 h-16 bg-[#0ABF53] rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#212121] mb-1">Order Placed Successfully!</h2>
        <p className="text-sm text-[#757575]">
          Thank you for your purchase
        </p>
      </div>

      {/* Order Tracking Steps */}
      <div className="bg-white mt-2 px-4 py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 bg-[#0ABF53] rounded-full flex items-center justify-center mb-2 relative">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-[#212121] font-semibold">Ordered</p>
          </div>

          <div className="flex-1 h-0.5 bg-[#E0E0E0] -mt-8"></div>

          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 ${
              isProcessing ? 'bg-[#FFF5F0] border-[#F85606] animate-pulse' : 'bg-[#F5F5F5] border-[#E0E0E0]'
            }`}>
              <svg className={`w-5 h-5 ${isProcessing ? 'text-[#F85606]' : 'text-[#9E9E9E]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-xs ${isProcessing ? 'text-[#F85606] font-semibold' : 'text-[#9E9E9E]'}`}>
              {isProcessing ? 'Processing...' : 'Payment'}
            </p>
          </div>

          <div className="flex-1 h-0.5 bg-[#E0E0E0] -mt-8"></div>

          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 bg-[#F5F5F5] border-2 border-[#E0E0E0] rounded-full flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-[#9E9E9E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <p className="text-xs text-[#9E9E9E]">Delivery</p>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="text-base font-bold text-[#212121] mb-3">Delivery Information</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#757575] flex-shrink-0 mt-0.5"
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
            <div className="flex-1">
              <p className="text-xs text-[#757575]">Email</p>
              <p className="text-sm font-medium text-[#212121]">
                {orderItems[0]?.email || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#757575] flex-shrink-0 mt-0.5"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-[#757575]">Delivery Address</p>
              <p className="text-sm font-medium text-[#212121]">
                {orderItems[0]?.address || "Address not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="text-base font-bold text-[#212121] mb-3">
          Order Items ({orderItems.length})
        </h3>
        
        <div className="space-y-3">
          {orderItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 pb-3 border-b border-[#F5F5F5] last:border-0"
            >
              <img
                src={item.image}
                alt={item.Item_name}
                className="w-16 h-16 rounded object-cover border border-[#E0E0E0] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[#212121] text-sm line-clamp-2">
                  {item.Item_name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#757575]">
                  <span>Qty: {item.quantity}</span>
                  <span>×</span>
                  <span>Rs.{item.price?.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#9E9E9E] mt-1">
                  Order ID: #{item.orderId?.slice(0, 8) || "N/A"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#F85606] text-base">
                  Rs.{item.totalAmount?.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="text-base font-bold text-[#212121] mb-3">Order Summary</h3>
        
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#757575]">Subtotal</span>
            <span className="text-[#212121] font-medium">Rs.{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#757575]">Shipping Fee</span>
            <span className="text-[#0ABF53] font-medium">FREE</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#757575]">Tax</span>
            <span className="text-[#212121] font-medium">Included</span>
          </div>
        </div>

        <div className="border-t border-[#E0E0E0] pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-[#212121]">Total</span>
            <span className="text-xl font-bold text-[#F85606]">
              Rs.{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] px-4 py-3">
        <div className="space-y-2">
          <button
            onClick={handleProceedToPayment}
            disabled={isProcessing || orderItems.length === 0}
            className="w-full bg-[#F85606] hover:bg-[#E85000] disabled:bg-[#E0E0E0] disabled:text-[#9E9E9E] text-white py-3 rounded font-bold text-base transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Proceed to Payment
              </>
            )}
          </button>

          <button
            onClick={handleContinueShopping}
            disabled={isProcessing}
            className="w-full bg-white hover:bg-[#F5F5F5] disabled:bg-[#F5F5F5] text-[#F85606] border-2 border-[#F85606] disabled:border-[#E0E0E0] disabled:text-[#9E9E9E] py-3 rounded font-semibold text-base transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
        </div>
      </div>

      {/* Order Tips */}
      <div className="px-4 py-3">
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Order Tips
          </p>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Your order will be processed within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Free shipping on all orders over Rs. 1000</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You can track your order in your profile</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}