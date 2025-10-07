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
      icon: <IoBookOutline className="text-2xl text-white" />,
      label: "Bookings",
      description: "Manage reservations",
      to: "/admin/booking",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <MdShop className="text-2xl text-white" />,
      label: "Shops",
      description: "Manage shop",
      to: "/admin/package",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: <MdPeople className="text-2xl text-white" />,
      label: "Users",
      description: "User management",
      to: "/admin/user",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: <MdRateReview className="text-2xl text-white" />,
      label: "Reviews",
      description: "Customer feedback",
      to: "/admin/review",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: <FaQuestionCircle className="text-2xl text-white" />,
      label: "Inquiries",
      description: "Customer questions",
      to: "/admin/inquiry",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: <MdOutlinePayments className="text-2xl text-white" />,
      label: "Payments",
      description: "Payment management",
      to: "/admin/payment",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
      {/* Main Content */}
      <main className="p-0">
        <Routes>
          <Route path="/" element={
            <div>
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg">
                <div className="p-6 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                      <p className="text-orange-100 text-sm mt-1">Welcome back, Admin</p>
                    </div>
                    <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <IoSettingsOutline className="text-white text-2xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="px-4 -mt-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-800">1,234</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-green-600 font-medium">↑ 12%</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <MdPeople className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Bookings</p>
                        <p className="text-2xl font-bold text-gray-800">56</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-green-600 font-medium">↑ 8%</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-[#F85606] to-[#FF7420] rounded-xl flex items-center justify-center shadow-md">
                        <IoBookOutline className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                  <span className="text-xs text-gray-500">Manage everything</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.to}
                      className="bg-white rounded-2xl overflow-hidden shadow-md border border-orange-100 active:scale-95 transition-transform duration-200"
                    >
                      <div className={`bg-gradient-to-r ${action.gradient} p-4`}>
                        <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                          {action.icon}
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">{action.label}</h4>
                        <p className="text-white text-opacity-90 text-xs">{action.description}</p>
                      </div>
                      <div className="p-3 bg-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-600">Tap to open</span>
                        <span className="text-gray-400">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaChartBar className="text-[#F85606]" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">New order received</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">New user registered</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">Payment received</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
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

      {/* Modern Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-100 shadow-2xl z-40">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
                activeTab === item.id 
                  ? "text-[#F85606]" 
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white scale-110 shadow-lg" 
                  : "hover:bg-gray-100"
              }`}>
                {item.icon}
              </div>
              <span className={`text-xs mt-1 transition-all duration-300 ${
                activeTab === item.id 
                  ? "font-bold" 
                  : "font-medium"
              }`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="w-1 h-1 bg-[#F85606] rounded-full mt-1"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Spacer for Navigation */}
      <div className="h-20"></div>
    </div>
  );
}