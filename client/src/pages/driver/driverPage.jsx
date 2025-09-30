import { MdOutlineDeliveryDining, MdHistory, MdPerson } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Available } from "./available.jsx";
import { DeliveryTrack } from "./deliveryTrack.jsx";
import { Profile } from "./profile.jsx";

export default function DriverPage() {
  const [activeTab, setActiveTab] = useState("home");
  const location = useLocation();

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/available")) setActiveTab("available");
    else if (path.includes("/track")) setActiveTab("track");
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
      to: "/driver"
    },
    {
      id: "available",
      icon: <MdOutlineDeliveryDining className="text-2xl" />,
      label: "Available",
      to: "/driver/available"
    },
    {
      id: "track",
      icon: <MdHistory className="text-2xl" />,
      label: "Delivery",
      to: "/driver/track"
    },
    {
      id: "profile",
      icon: <MdPerson className="text-2xl" />,
      label: "Profile",
      to: "/driver/profile"
    }
  ];

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-20">
      {/* Header */}
      

      {/* Main Content */}
      <main className="p-4">
        <Routes>
          <Route path="/" element={
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#32CD32] rounded-full flex items-center justify-center mx-auto mb-6">
                <MdOutlineDeliveryDining className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Driver!</h2>
              <p className="text-gray-600 mb-8">Select an option from the bottom menu to get started</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-white rounded-2xl p-4 border border-[#B7E892] shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MdOutlineDeliveryDining className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-lg font-bold text-gray-800">Orders</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#B7E892] shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MdHistory className="text-green-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-lg font-bold text-gray-800">Deliveries</p>
                </div>
              </div>
            </div>
          } />
          <Route path="/available" element={<Available />} />
          <Route path="/track" element={<DeliveryTrack />} />
          <Route path="/profile" element={<Profile />} />
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