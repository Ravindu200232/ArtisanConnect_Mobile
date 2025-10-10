import { CgProfile } from "react-icons/cg";
import { MdOutlinePayments, MdRateReview } from "react-icons/md";
import { BsGraphDown } from "react-icons/bs";
import { CiSpeaker, CiBookmarkCheck, CiUser } from "react-icons/ci";
import { IoSend } from "react-icons/io5"; // Add message icon
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { ShopReview } from "./shopReview";
import CollectionPage from "./collectionPage";
import AddCollection from "./addCollection";
import UpdateCollection from "./updateCollection";
import { Profile } from "./profile";
import AddShop from "./addShop";
import ShopOrder from "./shopOrder";
import ShopCreate from "./shopCreate";
import UpdateShop from "./updateShop";
import ShopOwnerMessages from "./ShopOwnerMessages";

export default function Shop() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("booking");
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/booking")) setActiveTab("booking");
    else if (path.includes("/shop")) setActiveTab("shop");
    else if (path.includes("/profile")) setActiveTab("profile");
    else if (path.includes("/review")) setActiveTab("review");
    else if (path.includes("/messages")) setActiveTab("messages"); // Add messages tab
  }, [location]);

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  const navigationItems = [
    {
      to: "/shopC/booking",
      id: "booking",
      icon: <CiBookmarkCheck className="text-2xl" />,
      label: "Orders",
    },
    {
      to: "/shopC/shop",
      id: "shop",
      icon: <CiSpeaker className="text-2xl" />,
      label: "Shop",
    },
    {
      to: "/shopC/messages", // Add messages route
      id: "messages",
      icon: <IoSend className="text-2xl" />, // Message icon
      label: "Messages",
    },
    {
      to: "/shopC/profile",
      id: "profile",
      icon: <CgProfile className="text-2xl" />,
      label: "Profile",
    },
    {
      to: "/shopC/review",
      id: "review",
      icon: <MdRateReview className="text-2xl" />,
      label: "Reviews",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          {/* Main Dashboard Routes */}
          <Route path="/booking" element={<ShopOrder />} />
          <Route path="/shop" element={<ShopCreate />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review" element={<ShopReview />} />
          <Route path="/messages" element={<ShopOwnerMessages />} /> {/* Add messages route */}

          {/* Shop Management Routes */}
          <Route path="/shop/add" element={<AddShop />} />
          <Route path="/shop/edit" element={<UpdateShop />} />

          {/* Collection Management Routes */}
          <Route path="/shop/collection" element={<CollectionPage />} />
          <Route path="/shop/collection/add" element={<AddCollection />} />
          <Route
            path="/shop/collection/update"
            element={<UpdateCollection />}
          />

          {/* Default route - redirect to shop */}
          <Route path="/" element={<ShopOrder />} />
        </Routes>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-100 shadow-2xl z-30">
        <div className="flex justify-around items-center h-20 px-2">
          {navigationItems.map(({ to, id, icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95"
            >
              <div
                className={`flex flex-col items-center justify-center transition-all ${
                  activeTab === id ? "text-[#F85606]" : "text-gray-500"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    activeTab === id ? "bg-orange-100" : ""
                  }`}
                >
                  {icon}
                </div>
                <span
                  className={`text-xs mt-1 font-bold ${
                    activeTab === id ? "text-[#F85606]" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </div>
              {activeTab === id && (
                <div className="absolute bottom-0 w-12 h-1 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-t-full"></div>
              )}
            </Link>
          ))}

          {/* Logout Button */}
          
        </div>

        {/* Decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F85606] to-transparent opacity-50"></div>
      </nav>

      {/* Global Styles */}
      <style>{`
        .Toastify__toast-container,
        .go2072408551 {
          bottom: 90px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }
        
        .Toastify__toast,
        .go685806154 {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          background: white !important;
        }

        .Toastify__toast--success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        }

        .Toastify__toast--error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        }

        .Toastify__toast--warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        }

        .Toastify__toast--info {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        }
        
        .swal2-popup {
          border-radius: 20px !important;
          padding: 2rem 1.5rem !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        .swal2-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
        }
        
        .swal2-html-container {
          font-size: 0.95rem !important;
          color: #6b7280 !important;
        }
        
        .swal2-styled.swal2-confirm {
          background: linear-gradient(to right, #F85606, #FF7420) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 12px 32px !important;
          font-size: 0.95rem !important;
          box-shadow: 0 4px 12px rgba(248, 86, 6, 0.3) !important;
        }
        
        .swal2-styled.swal2-cancel {
          background: #e5e7eb !important;
          color: #374151 !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 12px 32px !important;
          font-size: 0.95rem !important;
        }

        .swal2-icon {
          border-width: 3px !important;
        }

        .swal2-icon.swal2-success {
          border-color: #10b981 !important;
        }

        .swal2-icon.swal2-success [class^='swal2-success-line'] {
          background-color: #10b981 !important;
        }

        .swal2-icon.swal2-success .swal2-success-ring {
          border-color: rgba(16, 185, 129, 0.3) !important;
        }

        .swal2-icon.swal2-error {
          border-color: #ef4444 !important;
        }

        .swal2-icon.swal2-warning {
          border-color: #f59e0b !important;
          color: #f59e0b !important;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #fef3e7;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #F85606, #FF7420);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #F85606;
        }

        .go2072408551 {
          bottom: 90px !important;
        }

        .go685806154 {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          padding: 16px 20px !important;
          font-size: 14px !important;
        }

        .go685806154[data-type="success"] {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: white !important;
        }

        .go685806154[data-type="error"] {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: white !important;
        }

        .go685806154[data-type="loading"] {
          background: linear-gradient(135deg, #F85606 0%, #FF7420 100%) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}