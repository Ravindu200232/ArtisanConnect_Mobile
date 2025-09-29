import { Link, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react"; // Add this import
import Contact from "./contacts";
import Item from "./item";
import Home from "./home";
import ErrorNotFound from "./error";
import ProductOverview from "./productOverview";
import { BookingPage } from "./bookingpage";
import { Profile } from "./profile";
import { Location } from "./location";
import ShopDetails from "./shopDetails";
import Main from "./main";

// Facebook-style Bottom Navigation Component
function BottomNav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="flex justify-around items-center h-16">
        {/* Home */}
        <Link 
          to="/" 
          className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-[#32CD32] transition-colors"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        
        {/* Products */}
        <Link 
          to="/product" 
          className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-[#32CD32] transition-colors"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-xs">Products</span>
        </Link>
        
        {/* Cart */}
        <Link 
          to="/cart" 
          className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-[#32CD32] transition-colors relative"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="absolute top-0 right-6 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            0
          </span>
          <span className="text-xs">Cart</span>
        </Link>
        
        {/* Messages */}
        <Link 
          to="/messages" 
          className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-[#32CD32] transition-colors"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-xs">Messages</span>
        </Link>

        {/* Account */}
        <Link 
          to={user ? "/profile" : "/login"} 
          className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-[#32CD32] transition-colors"
        >
          {user ? (
            <>
              <img
                src={user.image || "/default-profile.png"}
                alt="profile"
                className="w-6 h-6 rounded-full object-cover mb-1"
              />
              <span className="text-xs">Account</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Account</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  );
}

// Messages Component (you can move this to a separate file later)
function Messages() {
  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        <h1 className="text-2xl font-bold text-[#32CD32] mb-4">Messages</h1>
        <p className="text-gray-600">Your messages will appear here.</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#DBF3C9]">
      {/* Main Content Area */}
      <div className="flex-grow overflow-auto pb-16"> {/* Added pb-16 for bottom nav space */}
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
        </Routes>
      </div>
      
      {/* Facebook-style Bottom Navigation */}
      <BottomNav />
    </div>
  );
}