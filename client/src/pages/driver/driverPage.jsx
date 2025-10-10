import { MdOutlineDeliveryDining, MdHistory, MdPerson } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Available } from "./available.jsx";
import { DeliveryTrack } from "./deliveryTrack.jsx";
import { Profile } from "./profile.jsx";
import axios from "axios";
import Swal from "sweetalert2";

export default function DriverPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [driver, setDriver] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const location = useLocation();

  // Load driver data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setDriver(parsed);
      setIsAvailable(parsed.isAvailable || false);
    }
  }, []);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/available")) setActiveTab("available");
    else if (path.includes("/track")) setActiveTab("track");
    else if (path.includes("/profile")) setActiveTab("profile");
    else setActiveTab("home");
  }, [location]);

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const newAvailability = !isAvailable;
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/driver/${driver.id}`,
        { isAvailable: newAvailability },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsAvailable(newAvailability);
      
      // Update local storage
      const updatedDriver = { ...driver, isAvailable: newAvailability };
      localStorage.setItem("user", JSON.stringify(updatedDriver));
      setDriver(updatedDriver);

      Swal.fire({
        title: newAvailability ? "You're Available!" : "You're Offline",
        text: newAvailability ? "You will now receive delivery requests" : "You won't receive new delivery requests",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error updating availability:", err);
      Swal.fire("Error", "Failed to update availability", "error");
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen">
              {/* Header with Availability Toggle */}
              <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg">
                <div className="px-4 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">Hello Driver!</h1>
                      <p className="text-sm text-orange-100">Ready to deliver excellence</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <MdOutlineDeliveryDining className="text-white text-2xl" />
                    </div>
                  </div>
                  
                  {/* Availability Toggle Button */}
                  <div className="flex items-center justify-between bg-white/20 backdrop-blur rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {isAvailable ? 'Available for Delivery' : 'Currently Offline'}
                        </p>
                        <p className="text-xs text-orange-100">
                          {isAvailable ? 'You will receive orders' : 'You will not receive orders'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleAvailability}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        isAvailable ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          isAvailable ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MdOutlineDeliveryDining className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">0</p>
                    <p className="text-xs text-gray-600 font-medium">Available Orders</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MdHistory className="text-white text-xl" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-1">0</p>
                    <p className="text-xs text-gray-600 font-medium">Active Deliveries</p>
                  </div>
                </div>

                {/* Today's Overview */}
                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-md mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Today's Overview
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#F85606] rounded-full"></div>
                        <span className="text-sm text-gray-700 font-medium">Completed</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">0 orders</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 font-medium">In Progress</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">0 orders</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 font-medium">Total Earnings</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">$0.00</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-md">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/driver/available"
                      className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-xl flex items-center justify-center shadow-lg">
                        <MdOutlineDeliveryDining className="text-white text-xl" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 text-center">View Available</span>
                    </Link>
                    
                    <Link
                      to="/driver/track"
                      className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-xl flex items-center justify-center shadow-lg">
                        <MdHistory className="text-white text-xl" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 text-center">Track Delivery</span>
                    </Link>
                    
                    <Link
                      to="/driver/profile"
                      className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-xl flex items-center justify-center shadow-lg">
                        <MdPerson className="text-white text-xl" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 text-center">My Profile</span>
                    </Link>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-gray-800 text-center">Work History</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />
          <Route path="/available" element={<Available />} />
          <Route path="/track" element={<DeliveryTrack />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-100 shadow-2xl z-40">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-all duration-200 ${
                activeTab === item.id 
                  ? "text-[#F85606]" 
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {activeTab === item.id && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-b-full"></div>
              )}
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-orange-100" 
                  : ""
              }`}>
                {item.icon}
              </div>
              <span className={`text-xs mt-1 transition-all duration-200 ${
                activeTab === item.id 
                  ? "font-bold" 
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