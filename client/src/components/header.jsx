import { AiOutlineShoppingCart, AiOutlineMessage, AiOutlineSetting, AiOutlineBell } from "react-icons/ai";
import { HiMenu } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token]);

  return (
    <header className="w-full h-[70px] shadow-lg flex justify-between items-center px-4 md:px-6 bg-gradient-to-r from-[#32CD32] to-[#93DC5C] relative">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="logo"
          className="w-24 object-cover"
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6 text-white">
        <Link to="/item" className="flex items-center gap-2 text-[16px] hover:text-gray-200 font-medium">
          <AiOutlineShoppingCart className="text-xl" />
          Products
        </Link>
        <Link to="/cart" className="flex items-center gap-2 text-[16px] hover:text-gray-200 font-medium">
          <AiOutlineShoppingCart className="text-xl" />
          Cart
        </Link>
        <Link to="/notifications" className="flex items-center gap-2 text-[16px] hover:text-gray-200 font-medium">
          <AiOutlineBell className="text-xl" />
          Notifications
        </Link>
        <Link to="/messages" className="flex items-center gap-2 text-[16px] hover:text-gray-200 font-medium">
          <AiOutlineMessage className="text-xl" />
          Messages
        </Link>
        <Link to="/settings" className="flex items-center gap-2 text-[16px] hover:text-gray-200 font-medium">
          <AiOutlineSetting className="text-xl" />
          Settings
        </Link>
      </div>

      {/* Icons and User Info */}
      <div className="flex items-center space-x-4 text-white">
        {/* Mobile Icons */}
        <div className="flex items-center space-x-3 md:hidden">
          <Link to="/cart">
            <AiOutlineShoppingCart className="text-[24px] hover:text-gray-200" />
          </Link>
          <Link to="/notifications">
            <AiOutlineBell className="text-[24px] hover:text-gray-200" />
          </Link>
          <Link to="/messages">
            <AiOutlineMessage className="text-[24px] hover:text-gray-200" />
          </Link>
        </div>

        {/* User Profile or Settings Link */}
        {user ? (
          <Link to="/settings" className="flex items-center space-x-2">
            <span className="text-[14px] hidden md:inline font-medium">
              {user.firstName}
            </span>
            <img
              src={user.image || "/default-profile.png"}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          </Link>
        ) : (
          <Link to="/login" className="flex items-center gap-2 text-[14px] font-medium hover:text-gray-200">
            <AiOutlineSetting className="text-[20px]" />
            <span className="hidden md:inline">Login</span>
          </Link>
        )}

        {/* Mobile Menu Button */}
        <HiMenu
          className="text-[26px] md:hidden cursor-pointer hover:text-gray-200"
          onClick={() => setMenuOpen(!menuOpen)}
        />
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="absolute top-[70px] left-0 w-full bg-gradient-to-r from-[#32CD32] to-[#93DC5C] shadow-lg flex flex-col items-center py-4 space-y-4 text-white z-50">
          <Link to="/item" className="flex items-center gap-3 text-[16px] hover:text-gray-200 font-medium w-full justify-center">
            <AiOutlineShoppingCart className="text-xl" />
            Products
          </Link>
          <Link to="/cart" className="flex items-center gap-3 text-[16px] hover:text-gray-200 font-medium w-full justify-center">
            <AiOutlineShoppingCart className="text-xl" />
            Cart
          </Link>
          <Link to="/notifications" className="flex items-center gap-3 text-[16px] hover:text-gray-200 font-medium w-full justify-center">
            <AiOutlineBell className="text-xl" />
            Notifications
          </Link>
          <Link to="/messages" className="flex items-center gap-3 text-[16px] hover:text-gray-200 font-medium w-full justify-center">
            <AiOutlineMessage className="text-xl" />
            Messages
          </Link>
          <Link to="/settings" className="flex items-center gap-3 text-[16px] hover:text-gray-200 font-medium w-full justify-center">
            <AiOutlineSetting className="text-xl" />
            Settings
          </Link>
        </div>
      )}
    </header>
  );
}