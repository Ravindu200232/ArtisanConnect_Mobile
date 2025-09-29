import { useEffect, useState } from "react";
import { LoadCart } from "../../utils/card";
import BookingItem from "../../components/bookingitem";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function BookingPage() {
  const [cart, setCart] = useState(LoadCart());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function reloadCart() {
    setCart(LoadCart());
    calculateTotal();
  }

  function calculateTotal() {
    const cartInfo = LoadCart();
    console.log(cartInfo)
    axios
      .post(`http://localhost:3000/api/v1/orders/quote`, cartInfo)
      .then((res) => {
        console.log(res.data.orderItem);
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.log(err);
      });

    console.log("cartsssssssssss", LoadCart())
  }

  useEffect(() => {
    calculateTotal();
  }, []);

  function handleBookingCreation() {
    setLoading(true);
    const cart = LoadCart();
    console.log("load", LoadCart())   

    const token = localStorage.getItem("token");
    console.log(token)
    axios
      .post(`http://localhost:3000/api/v1/orders`, cart, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("res", res.data.orders)
        const sendData = res.data.orders;
        localStorage.removeItem("cart");
        toast.success("Order placed successfully!");
        setCart(LoadCart());
        if (res.data) {
          navigate("/bookingconfirmation", {
            state: { sendData },
          });
        } else {
          toast.error("Invalid booking details received.");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Please login to continue");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20">
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
          <h1 className="text-2xl font-bold text-white text-center flex-1">My Cart</h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        <p className="text-white/90 text-center text-sm">
          {cart.orderItem?.length || 0} items in cart
        </p>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-6">
        {cart.orderItem?.length > 0 ? (
          <div className="space-y-3">
            {cart.orderItem.map((item) => (
              <div key={item.key} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
                <BookingItem
                  itemKey={item.key}
                  qty={item.qty}
                  refresh={reloadCart}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-[#B7E892]">
            <div className="text-[#93DC5C] text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <button
              onClick={() => navigate("/product")}
              className="bg-[#32CD32] hover:bg-[#2DB82D] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {cart.orderItem?.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
          <h2 className="text-xl font-bold text-[#32CD32] mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800 font-semibold">Rs.{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery</span>
              <span className="text-[#32CD32] font-semibold">Free</span>
            </div>
            <div className="border-t border-[#B7E892] pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-[#32CD32]">Rs.{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookingCreation}
            disabled={loading || cart.orderItem.length === 0}
            className="w-full bg-[#32CD32] hover:bg-[#2DB82D] disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Place Order - Rs.{total.toFixed(2)}
              </>
            )}
          </button>
        </div>
      )}

      {/* Update Address Button */}
      {cart.orderItem?.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4">
          <button 
            className="w-full bg-[#93DC5C] hover:bg-[#7ED048] text-white py-4 rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
            onClick={() => navigate("/location")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Update Delivery Address
          </button>
        </div>
      )}

      {/* Bottom spacing for navigation */}
      <div className="h-4"></div>
    </div>
  );
}