import { MdOutlinePayments, MdRateReview, MdShop, MdPeople, MdPerson } from "react-icons/md";
import { IoHomeOutline, IoSettingsOutline, IoBookOutline } from "react-icons/io5";
import { FaChartBar, FaQuestionCircle } from "react-icons/fa";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import AdminItemPage from "./adminItemPage";
import User from "./users";
import AdminBookingPage from "./adminbookingpage";
import { AdminReviewPage } from "./adminReviewpage";
import { AdminInquiryPage } from "./adminInquirypage";
import AdminPackagePage from "./adminpakage";
import { AdminPayment } from "./adminPayment";
import { Profile } from "./profile";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("home");
  const location = useLocation();

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/booking")) setActiveTab("booking");
    else if (path.includes("/package")) setActiveTab("shop");
    else if (path.includes("/user")) setActiveTab("users");
    else if (path.includes("/review")) setActiveTab("reviews");
    else if (path.includes("/inquiry")) setActiveTab("inquiries");
    else if (path.includes("/payment")) setActiveTab("payment");
    else if (path.includes("/profile")) setActiveTab("profile");
    else setActiveTab("home");
  }, [location]);

  const [token] = useState(localStorage.getItem("token"));
  if (!token) {
    window.location.href = "/login";
    return null;
  }

  const navItems = [
    {
      id: "home",
      icon: <IoHomeOutline className="text-2xl" />,
      label: "Home",
      to: "/admin"
    },
    {
      id: "booking",
      icon: <IoBookOutline className="text-2xl" />,
      label: "Bookings",
      to: "/admin/booking"
    },
    {
      id: "shop",
      icon: <MdShop className="text-2xl" />,
      label: "Shops",
      to: "/admin/package"
    },
    {
      id: "users",
      icon: <MdPeople className="text-2xl" />,
      label: "Users",
      to: "/admin/user"
    },
    {
      id: "profile",
      icon: <MdPerson className="text-2xl" />,
      label: "Profile",
      to: "/admin/profile"
    }
  ];

  const quickActions = [
    {
      icon: <IoBookOutline className="text-2xl text-blue-600" />,
      label: "Bookings",
      description: "Manage reservations",
      to: "/admin/booking",
      color: "bg-blue-100"
    },
    {
      icon: <MdShop className="text-2xl text-green-600" />,
      label: "Shops",
      description: "Manage shop",
      to: "/admin/package",
      color: "bg-green-100"
    },
    {
      icon: <MdPeople className="text-2xl text-purple-600" />,
      label: "Users",
      description: "User management",
      to: "/admin/user",
      color: "bg-purple-100"
    },
    {
      icon: <MdRateReview className="text-2xl text-orange-600" />,
      label: "Reviews",
      description: "Customer feedback",
      to: "/admin/review",
      color: "bg-orange-100"
    },
    {
      icon: <FaQuestionCircle className="text-2xl text-red-600" />,
      label: "Inquiries",
      description: "Customer questions",
      to: "/admin/inquiry",
      color: "bg-red-100"
    },
    {
      icon: <MdOutlinePayments className="text-2xl text-indigo-600" />,
      label: "Payments",
      description: "Payment management",
      to: "/admin/payment",
      color: "bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20">
      {/* Header */}
     

      {/* Main Content */}
      <main className="p-4">
        <Routes>
          <Route path="/" element={
            <div>
              {/* Welcome Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#32CD32] rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoSettingsOutline className="text-white text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Admin!</h2>
                  <p className="text-gray-600">Manage your platform efficiently</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-[#B7E892] shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-800">1,234</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MdPeople className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#B7E892] shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Today's Bookings</p>
                      <p className="text-2xl font-bold text-gray-800">56</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <IoBookOutline className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
                <h3 className="text-lg font-bold text-[#32CD32] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.to}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#B7E892] hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2`}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 text-center">{action.label}</span>
                      <span className="text-xs text-gray-600 text-center">{action.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          } />
          <Route path="/booking" element={<AdminBookingPage />} />
          <Route path="/item" element={<AdminItemPage />} />
          <Route path="/user/*" element={<User />} />
          <Route path="/review" element={<AdminReviewPage />} />
          <Route path="/inquiry" element={<AdminInquiryPage />} />
          <Route path="/package" element={<AdminPackagePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<AdminPayment />} />
        </Routes>
      </main>

      {/* Facebook-like Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center w-16 py-1 ${
                activeTab === item.id 
                  ? "text-[#32CD32]" 
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className={`p-2 rounded-full transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-[#32CD32]/10" 
                  : "hover:bg-gray-100"
              }`}>
                {item.icon}
              </div>
              <span className={`text-xs mt-1 transition-all duration-200 ${
                activeTab === item.id 
                  ? "font-semibold" 
                  : "font-medium"
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Spacer for Navigation */}
      <div className="h-16"></div>
    </div>
  );
}