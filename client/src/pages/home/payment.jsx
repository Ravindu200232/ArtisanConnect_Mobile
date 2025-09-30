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
  
      const perBookingAmount = parseFloat((amount / bookingIds.length).toFixed(2));
  
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
      navigate("/");
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
    <div className="min-h-screen bg-gray-50">
      {/* Daraz Header */}
      <div className="bg-[#F85606] px-4 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white">Payment</h1>
        </div>
      </div>

      {/* Amount Summary Card */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Payment</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#F85606]">Rs. {amount?.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{bookingIds?.length} booking(s)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mx-4 mt-4">
        <div className="text-sm font-semibold text-gray-800 mb-3 px-1">Select Payment Method</div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {["Card", "PayPal", "Bank Transfer"].map((method, idx) => (
            <button
              key={method}
              onClick={() => setPaymentType(method)}
              className={`w-full p-4 flex items-center justify-between border-b border-gray-100 transition-colors ${
                paymentType === method ? "bg-orange-50" : "bg-white active:bg-gray-50"
              } ${idx === 2 ? "border-b-0" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  paymentType === method ? "bg-[#F85606]" : "bg-gray-100"
                }`}>
                  <span className="text-xl">
                    {method === "Card" && "💳"}
                    {method === "PayPal" && "🅿️"}
                    {method === "Bank Transfer" && "🏦"}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">{method}</div>
                  <div className="text-xs text-gray-500">
                    {method === "Card" && "Credit/Debit Card"}
                    {method === "PayPal" && "PayPal Account"}
                    {method === "Bank Transfer" && "Direct Bank Transfer"}
                  </div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentType === method ? "border-[#F85606]" : "border-gray-300"
              }`}>
                {paymentType === method && (
                  <div className="w-3 h-3 rounded-full bg-[#F85606]"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card Details Form */}
      {paymentType === "Card" && (
        <div className="mx-4 mt-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-sm font-semibold text-gray-800 mb-4">Card Details</div>
          
          {/* Card Number */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2 font-medium">
              CARD NUMBER
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {cardNumber.replace(/\s/g, '').length > 0 && (
                <div className="absolute right-3 top-3">
                  {cardNumber.replace(/\s/g, '').length === 16 ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-2 font-medium">
                EXPIRY DATE
              </label>
              <input
                type="text"
                value={formatExpiry(expiry)}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-2 font-medium">
                CVV
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                  placeholder="123"
                  maxLength={3}
                />
                {cvv.length > 0 && (
                  <div className="absolute right-3 top-3">
                    {cvv.length === 3 ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-blue-800">
              <div className="font-medium mb-0.5">Secure Payment</div>
              <div className="text-blue-600">Your card information is encrypted and secure</div>
            </div>
          </div>
        </div>
      )}

      {/* Other Payment Methods Info */}
      {paymentType !== "Card" && (
        <div className="mx-4 mt-4 bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-5xl mb-3">
            {paymentType === "PayPal" ? "🅿️" : "🏦"}
          </div>
          <div className="text-sm font-medium text-gray-800 mb-1">
            {paymentType} Payment
          </div>
          <div className="text-xs text-gray-500">
            You'll be redirected to complete your payment securely
          </div>
        </div>
      )}

      {/* Pay Button Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-[#F85606] hover:bg-[#E04D05] disabled:bg-gray-300 text-white py-4 rounded-lg font-semibold text-base transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pay Rs. {amount?.toFixed(2)}</span>
            </>
          )}
        </button>
        
        {/* Security Badges */}
        <div className="flex justify-center items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>SSL Secure</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% Safe</span>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-32"></div>
    </div>
  );
}