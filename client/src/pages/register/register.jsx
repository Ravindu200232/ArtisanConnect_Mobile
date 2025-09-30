import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";

export default function Register() {
  const [currentScreen, setCurrentScreen] = useState("roleSelect");
  const [selectedRole, setSelectedRole] = useState("");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadedUrl = await mediaUpload(file);
      setImage(uploadedUrl);
      showToast("Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed", err);
      showToast("Image upload failed.", "error");
    }
  };

  // Register Function
  const handleRegister = async (e) => {
    e.preventDefault();

    if (image === "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg") {
      showToast("Please upload profile picture", "error");
      return;
    }

    if (password !== rePassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordPattern.test(password)) {
      showToast("Password must be at least 8 characters long and include at least one uppercase letter and one symbol.", "error");
      return;
    }

    try {
      await axios.post(`https://artisanconnect-backend.onrender.com/api/v1/users`, {
        email,
        password,
        firstName,
        lastName,
        phone,
        image,
        role: selectedRole,
      });

      showToast("Registration Successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error || "Email Already Added", "error");
    }
  };

  // Role Selection Screen
  if (currentScreen === "roleSelect") {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-6 px-4">
        {toast.show && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white font-semibold`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-gray-800 -ml-10">Choose Your Role</h1>
        </div>
        
        <p className="text-gray-600 text-center mb-8 px-4">Select how you want to use Artisan Connect</p>
        
        <div className="space-y-3 max-w-md mx-auto">
          <button
            onClick={() => {
              setSelectedRole("customer");
              setCurrentScreen("register");
            }}
            className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-[#F85606] hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#F85606] to-[#FF8C42] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-800">Customer</h3>
              <p className="text-sm text-gray-500">Find and hire skilled artisans</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => {
              setSelectedRole("artisan");
              setCurrentScreen("register");
            }}
            className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-[#F85606] hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#F85606] to-[#FF8C42] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-800">Artisan</h3>
              <p className="text-sm text-gray-500">Offer your professional skills</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => {
              setSelectedRole("supplier");
              setCurrentScreen("register");
            }}
            className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-[#F85606] hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#F85606] to-[#FF8C42] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-800">Supplier</h3>
              <p className="text-sm text-gray-500">Provide quality materials</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Already have account */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <span 
              className="text-[#F85606] font-semibold cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Registration Form
  if (currentScreen === "register" && selectedRole) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        {toast.show && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white font-semibold`}>
            {toast.message}
          </div>
        )}
        
        {/* Header */}
        <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => {
                setSelectedRole("");
                setCurrentScreen("roleSelect");
              }}
              className="w-9 h-9 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 -ml-9">Create Account</h1>
          </div>
        </div>

        <div className="px-6 py-6 pb-20">
          <div className="max-w-md mx-auto">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="cursor-pointer relative"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img
                    src={image}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full border-4 border-[#F85606] shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#F85606] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">Upload profile photo</p>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />

              <div>
                <label className="block text-xs text-gray-600 mb-2 font-medium">FIRST NAME</label>
                <input
                  required
                  type="text"
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                  onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  value={firstName}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2 font-medium">LAST NAME</label>
                <input
                  required
                  type="text"
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                  onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  value={lastName}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2 font-medium">EMAIL</label>
                <input
                  required
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2 font-medium">PHONE</label>
                <input
                  required
                  type="tel"
                  placeholder="+94 XX XXX XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  value={phone}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2 font-medium">PASSWORD</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    pattern="^(?=.*[A-Z])(?=.*[\W_]).{8,}$"
                    title="Password must be at least 8 characters long and include at least one uppercase letter and one symbol."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters, 1 uppercase & 1 symbol</p>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2 font-medium">CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    required
                    type={showRePassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                    onChange={(e) => setRePassword(e.target.value)}
                    value={rePassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Role Badge */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F85606]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">
                  Registering as <span className="font-semibold text-[#F85606] capitalize">{selectedRole}</span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F85606] hover:bg-[#E04D05] text-white font-semibold rounded-lg shadow-md transition-colors mt-4"
              >
                Create Account
              </button>

              <p className="text-center text-gray-600 text-sm mt-4">
                Already have an account?{" "}
                <span 
                  className="text-[#F85606] font-semibold cursor-pointer" 
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}