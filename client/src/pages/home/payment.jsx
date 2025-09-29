import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, bookingIds } = location.state || {};
  const [paymentType, setPaymentType] = useState("Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  console.log(location.state.bookingIds)

  const validateCardInputs = () => {
    const cardPattern = /^\d{16}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^\d{3}$/;

    if (!cardPattern.test(cardNumber.replace(/\s/g, ""))) {
      toast.error("Invalid card number");
      return false;
    }
    if (!expiryPattern.test(expiry)) {
      toast.error("Invalid expiry (MM/YY)");
      return false;
    }
    if (!cvvPattern.test(cvv)) {
      toast.error("Invalid CVV");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (paymentType === "Card" && !validateCardInputs()) {
      return;
    }
  
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
  
      // Divide total amount evenly and round to 2 decimals
      const perBookingAmount = parseFloat((amount / bookingIds.length).toFixed(2));
  
      // Make separate requests for each bookingId
      for (const bookingId of bookingIds) {
        await axios.post(
          `http://localhost:3000/api/payment`,
          {
            bookingId,
            amount: perBookingAmount,
            paymentType,
            cardNumber,
            expiry,
            cvv,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
  
      toast.success("Payment successful!");
      navigate("/"); // 👈 Redirect after all successful
    } catch (err) {
      console.error(err);
      toast.error("Payment failed.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20 pt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#32CD32] to-[#93DC5C] px-6 py-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">Secure Payment</h1>
          <div className="w-10"></div>
        </div>
        <p className="text-white/90 text-center text-sm">Complete your purchase securely</p>
      </div>

      {/* Payment Card */}
      <div className="mx-4 mt-6 bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        {/* Amount Display */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-[#32CD32]">Rs.{amount?.toFixed(2)}</p>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {["Card", "PayPal", "Bank Transfer"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentType(method)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  paymentType === method
                    ? "border-[#32CD32] bg-[#DBF3C9] text-[#32CD32] font-semibold"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#93DC5C]"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">
                    {method === "Card" && "💳"}
                    {method === "PayPal" && "🔵"}
                    {method === "Bank Transfer" && "🏦"}
                  </div>
                  <span className="text-xs">{method}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Card Details */}
        {paymentType === "Card" && (
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                  className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  {cardNumber.replace(/\s/g, '').length > 0 && 
                    (cardNumber.replace(/\s/g, '').length === 16 ? "✅" : "❌")}
                </div>
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={formatExpiry(expiry)}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
                    placeholder="123"
                    maxLength={3}
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    {cvv.length > 0 && (cvv.length === 3 ? "✅" : "❌")}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Security Info */}
            <div className="bg-[#DBF3C9] rounded-xl p-3 border border-[#93DC5C]">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#32CD32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your payment details are secure and encrypted</span>
              </div>
            </div>
          </div>
        )}

        {/* Other Payment Methods */}
        {paymentType !== "Card" && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">
              {paymentType === "PayPal" ? "🔵" : "🏦"}
            </div>
            <p className="text-gray-600">
              You will be redirected to {paymentType} to complete your payment
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-6 space-y-3">
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-[#32CD32] hover:bg-[#2DB82D] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-3"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay Rs.{amount?.toFixed(2)}
            </>
          )}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel Payment
        </button>
      </div>

      {/* Security Badges */}
      <div className="mx-4 mt-6 text-center">
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#32CD32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-[#32CD32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}