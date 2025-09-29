import { CgProfile } from "react-icons/cg"; 
import { MdOutlinePayments, MdRateReview } from "react-icons/md";
import { BsGraphDown } from "react-icons/bs";
import { CiSpeaker, CiBookmarkCheck, CiUser } from "react-icons/ci";
import { Link, Route, Routes } from "react-router-dom";
import { useState } from "react";

import { ShopReview } from "./shopReview";
import CollectionPage from "./collectionPage";
import AddCollection from "./addCollection";
import UpdateCollection from "./updateCollection";
import { Profile } from "./profile";
import AddShop from "./addShop";
import ShopOrder from "./shopOrder";
import ShopCreate from "./shopCreate";
import UpdateShop from "./updateShop";

export default function Shop() {
  const [activeTab, setActiveTab] = useState("booking");

  const [token, setToken] = useState(localStorage.getItem("token"));
  if (!token) {
    window.location.href = "/login";
  }

  const navigationItems = [
    {
      to: "/shopc/booking",
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-lime-50 to-green-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/booking" element={<ShopOrder />} />
          <Route path="/shop/collection" element={<CollectionPage />} />
          <Route path="/shop/collection/add" element={<AddCollection />} />
          <Route path="/shop/collection/update" element={<UpdateCollection />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review" element={<ShopReview />} />
          <Route path="/shop/" element={<ShopCreate />} />
          <Route path="/shop/add" element={<AddShop />} />
          <Route path="/shop/edit" element={<UpdateShop />} />
        </Routes>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex justify-around items-center h-20">
          {navigationItems.map(({ to, id, icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all"
            >
              <div
                className={`flex flex-col items-center justify-center ${
                  activeTab === id ? "text-lime-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-all ${
                    activeTab === id ? "bg-lime-100" : ""
                  }`}
                >
                  {icon}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    activeTab === id ? "text-lime-600" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </div>
              {activeTab === id && (
                <div className="absolute bottom-0 w-12 h-1 bg-lime-500 rounded-t-full"></div>
              )}
            </Link>
          ))}
          
          {/* Logout Button in Navigation */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="flex flex-col items-center justify-center flex-1 h-full transition-all text-gray-500 hover:text-red-600"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-medium">Logout</span>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
}