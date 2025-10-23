import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Contact from "./contacts";
import Item from "./item";

import ErrorNotFound from "./error";
import ProductOverview from "./productOverview";
import { BookingPage } from "./bookingpage";
import { Profile } from "./profile";
import { Location } from "./location";
import ShopDetails from "./shopDetails";
import Main from "./main";
import { LoadCart } from "../../utils/card";
import Messages from "./messages";
import CustomerMessages from "./CustomerMessages";
import CustomerConversation from "./CustomerConversation";

// Splash Screen Component
export function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      }}
    >
      {/* Background Image - Full opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/screenspalch.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "zoomIn 5s ease-out",
        }}
      />

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8">
        {/* Logo with Animation */}
        <div
          className="mb-8"
          style={{
            animation: "fadeInScale 1.5s ease-out",
          }}
        >
          <img
            src="/logo3r.png"
            alt="ArtisanConnect Logo"
            className="w-32 h-32 object-contain drop-shadow-2xl"
          />
        </div>

        {/* App Name */}
        <h1
          className="text-4xl font-bold text-white mb-3 tracking-wide"
          style={{
            animation: "fadeInUp 1.5s ease-out 0.3s both",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          ArtisanConnect
        </h1>
      </div>

      {/* Bottom Section - Tagline and Loading */}
      <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center px-8">
        {/* Tagline */}
        <p
          className="text-lg text-white/95 text-center font-medium mb-6"
          style={{
            animation: "fadeInUp 1.5s ease-out 0.6s both",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          Empowering Artisans. Enriching Culture
        </p>

        {/* Loading Spinner */}
        <div
          style={{
            animation: "fadeIn 1s ease-out 1s both",
          }}
        >
          <div className="flex space-x-2">
            <div
              className="w-3 h-3 bg-white rounded-full"
              style={{
                animation: "bounce 1.4s infinite ease-in-out",
              }}
            />
            <div
              className="w-3 h-3 bg-white rounded-full"
              style={{
                animation: "bounce 1.4s infinite ease-in-out 0.2s",
              }}
            />
            <div
              className="w-3 h-3 bg-white rounded-full"
              style={{
                animation: "bounce 1.4s infinite ease-in-out 0.4s",
              }}
            />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Daraz-style Bottom Navigation Component
function BottomNav() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }

    // Update cart count
    const cart = LoadCart();
    const count = cart.orderItem?.reduce((sum, item) => sum + item.qty, 0) || 0;
    setCartCount(count);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] shadow-lg z-40">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive("/") ? "text-[#F85606]" : "text-[#757575]"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill={isActive("/") ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span
            className={`text-xs ${
              isActive("/") ? "font-semibold" : "font-medium"
            }`}
          >
            Home
          </span>
        </Link>

        {/* Categories */}
        <Link
          to="/product"
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive("/product") ? "text-[#F85606]" : "text-[#757575]"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill={isActive("/product") ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span
            className={`text-xs ${
              isActive("/product") ? "font-semibold" : "font-medium"
            }`}
          >
            Categories
          </span>
        </Link>

        {/* Cart with Badge */}
        <Link
          to="/cart"
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors relative ${
            isActive("/cart") ? "text-[#F85606]" : "text-[#757575]"
          }`}
        >
          <div className="relative">
            <svg
              className="w-6 h-6 mb-1"
              fill={isActive("/cart") ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#F85606] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <span
            className={`text-xs ${
              isActive("/cart") ? "font-semibold" : "font-medium"
            }`}
          >
            Cart
          </span>
        </Link>

        {/* Messages */}
        <Link
          to="/my-messages"
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive("/messages") ? "text-[#F85606]" : "text-[#757575]"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill={isActive("/messages") ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span
            className={`text-xs ${
              isActive("/messages") ? "font-semibold" : "font-medium"
            }`}
          >
            Messages
          </span>
        </Link>

        {/* Account */}
        <Link
          to={user ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive("/profile") || isActive("/login")
              ? "text-[#F85606]"
              : "text-[#757575]"
          }`}
        >
          {user && user.image ? (
            <div className="relative mb-1">
              <img
                src={user.image}
                alt="profile"
                className={`w-6 h-6 rounded-full object-cover ${
                  isActive("/profile") ? "ring-2 ring-[#F85606]" : ""
                }`}
              />
            </div>
          ) : (
            <svg
              className="w-6 h-6 mb-1"
              fill={
                isActive("/profile") || isActive("/login")
                  ? "currentColor"
                  : "none"
              }
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
          )}
          <span
            className={`text-xs ${
              isActive("/profile") || isActive("/login")
                ? "font-semibold"
                : "font-medium"
            }`}
          >
            Account
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (user) {
    if (user.role === "admin") {
      window.location.href = "/admin/";
    } else if (user.role === "artisan") {
      window.location.href = "/shopC/";
    } else if (user.role === "supplier") {
      window.location.href = "/shopC/";
    } else if (user.role === "delivery") {
      window.location.href = "/driver/";
    } else {
      window.location.href = "/";
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <div className="w-screen h-screen flex flex-col bg-[#F5F5F5]">
        {/* Main Content Area */}
        <div className="flex-grow overflow-auto pb-20">
          <Routes>
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Main />} />
            <Route path="/product" element={<Item />} />
            <Route path="/product/:key" element={<ProductOverview />} />
            <Route path="/cart" element={<BookingPage />} />
            <Route path="/location" element={<Location />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shop/:id" element={<ShopDetails />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/*" element={<ErrorNotFound />} />
            <Route path="/my-messages" element={<CustomerMessages />} />
            <Route
              path="/messages/customer/:customerId/shop/:shopId"
              element={<CustomerConversation />}
            />
          </Routes>
        </div>

        {/* Daraz-style Bottom Navigation */}
        <BottomNav />
      </div>
    </>
  );
}
