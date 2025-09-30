import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";

export default function Register() {
  const [currentScreen, setCurrentScreen] = useState("getStarted");
  const [selectedRole, setSelectedRole] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
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

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://artisanconnect-backend.onrender.com/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Login failed", "error");
        return;
      }

      if (data.message === "User is blocked") {
        showToast(data.message, "error");
        return;
      }

      showToast(data.message || "Login successful");
      const user = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        phone: user.phone,
        image: user.image,
        lat: user.lat,
        lng: user.lng
      }));

      if (user.emailVerified === false) {
        showToast("Please verify your email first", "error");
        setTimeout(() => window.location.href = "/verify-email", 1500);
        return;
      }

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin/";
        } else if (user.role === "artisan") {
          window.location.href = "/shopC/";
        } else if (user.role === "supplier") {
          window.location.href = "/supplier/";
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast("An error occurred. Please try again.", "error");
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

    // Password validation pattern
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

      showToast("Registration Successful!");
      
      setTimeout(() => {
        // Switch to login mode after successful registration
        setIsLogin(true);
        setCurrentScreen("auth");
        // Reset form
        setEmail("");
        setPassword("");
        setRePassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setImage("https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg");
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error || "Email Already Added", "error");
    }
  };

  const googleLogin = async () => {
    try {
      // Simulated Google OAuth flow
      showToast("Google login initiated...");
      
      // In real implementation, this would call Google OAuth
      const mockAccessToken = "mock_google_token_" + Date.now();
      
      const response = await fetch(`https://artisanconnect-backend.onrender.com/api/v1/users/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: mockAccessToken })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);

      showToast("Login successful");
      const user = data.user;
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        phone: user.phone,
        image: user.image,
      }));

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin/";
        } else if (user.role === "artisan") {
          window.location.href = "/artisan/";
        } else if (user.role === "supplier") {
          window.location.href = "/supplier/";
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast("Google login failed", "error");
    }
  };

  // Onboarding Screens
  if (currentScreen === "getStarted") {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-lime-400 via-green-400 to-emerald-500 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {toast.show && (
          <div className={`fixed top-4 px-6 py-3 rounded-full shadow-2xl z-50 ${toast.type === "error" ? "bg-red-500" : "bg-lime-600"} text-white font-semibold`}>
            {toast.message}
          </div>
        )}
        
        <div className="absolute top-0 left-0 w-96 h-96 bg-lime-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full opacity-20"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="w-36 h-36 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-24 h-24 text-lime-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <h1 className="text-6xl font-black text-white mb-4">Artisan Connect</h1>
          <p className="text-2xl text-lime-100 font-medium">Connecting Craftsmen with Customers</p>
        </div>
        
        <button
          onClick={() => setCurrentScreen("onboarding1")}
          className="w-80 py-5 bg-white text-lime-600 rounded-full text-xl font-bold shadow-2xl hover:scale-110 transition-all duration-300 relative z-10"
        >
          Get Started
        </button>
        
        <p className="text-white mt-10 text-lg font-medium relative z-10">Your gateway to quality craftsmanship</p>
      </div>
    );
  }

  if (currentScreen === "onboarding1") {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-lime-400 via-lime-500 to-green-500 flex flex-col items-center justify-between px-6 py-12">
        <button
          onClick={() => setCurrentScreen("getStarted")}
          className="self-start flex items-center gap-2 text-white font-semibold text-lg"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-72 h-72 mb-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <svg className="w-44 h-44 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-5xl font-black text-white mb-5 text-center">Find Skilled Artisans</h2>
          <p className="text-xl text-lime-50 text-center px-8 font-medium">
            Discover talented craftsmen and service providers in your area
          </p>
        </div>
        
        <div className="flex gap-3 mb-8">
          <div className="w-14 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white opacity-40 rounded-full"></div>
          <div className="w-3 h-3 bg-white opacity-40 rounded-full"></div>
        </div>
        
        <button
          onClick={() => setCurrentScreen("onboarding2")}
          className="w-80 py-5 bg-white text-lime-600 rounded-full text-xl font-bold shadow-2xl"
        >
          Next
        </button>
      </div>
    );
  }

  if (currentScreen === "onboarding2") {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 flex flex-col items-center justify-between px-6 py-12">
        <button
          onClick={() => setCurrentScreen("onboarding1")}
          className="self-start flex items-center gap-2 text-white font-semibold text-lg"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-72 h-72 mb-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <svg className="w-44 h-44 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-5xl font-black text-white mb-5 text-center">Quality Guaranteed</h2>
          <p className="text-xl text-emerald-50 text-center px-8 font-medium">
            All artisans are verified professionals with proven track records
          </p>
        </div>
        
        <div className="flex gap-3 mb-8">
          <div className="w-3 h-3 bg-white opacity-40 rounded-full"></div>
          <div className="w-14 h-3 bg-white rounded-full"></div>
          <div className="w-3 h-3 bg-white opacity-40 rounded-full"></div>
        </div>
        
        <button
          onClick={() => setCurrentScreen("onboarding3")}
          className="w-80 py-5 bg-white text-emerald-600 rounded-full text-xl font-bold shadow-2xl"
        >
          Next
        </button>
      </div>
    );
  }

  if (currentScreen === "onboarding3") {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-green-300 via-lime-300 to-yellow-400 flex flex-col items-center justify-between px-6 py-12">
        <button
          onClick={() => setCurrentScreen("onboarding2")}
          className="self-start flex items-center gap-2 text-white font-semibold text-lg"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-72 h-72 mb-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <svg className="w-44 h-44 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-5xl font-black text-white mb-5 text-center">Secure Payments</h2>
          <p className="text-xl text-lime-50 text-center px-8 font-medium">
            Safe and transparent transactions for peace of mind
          </p>
        </div>
        
        <div className="flex gap-3 mb-8">
          <div className="w-3 h-3 bg-white opacity-40 rounded-full"></div>
          <div className="w-3 h-3 bg-white opacity-40 rounded-full"></div>
          <div className="w-14 h-3 bg-white rounded-full"></div>
        </div>
        
        <button
          onClick={() => setCurrentScreen("auth")}
          className="w-80 py-5 bg-white text-lime-600 rounded-full text-xl font-bold shadow-2xl"
        >
          Get Started
        </button>
      </div>
    );
  }

  // Auth Screen (Login/Register)
  if (currentScreen === "auth") {
    if (isLogin) {
      // Login Screen
      return (
        <div className="w-full min-h-screen bg-gradient-to-br from-lime-400 via-green-300 to-yellow-200 flex flex-col justify-center items-center px-6 py-8">
          {toast.show && (
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-600"} text-white font-semibold`}>
              {toast.message}
            </div>
          )}

          <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-lime-400">
                <svg className="w-14 h-14 text-lime-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-center text-gray-600 mb-8">Login to Artisan Connect</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-white bg-opacity-50 border-2 border-lime-300 rounded-xl text-gray-800 placeholder-gray-500 outline-none focus:border-lime-500 focus:bg-white transition-all"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />

              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white bg-opacity-50 border-2 border-lime-300 rounded-xl text-gray-800 placeholder-gray-500 outline-none focus:border-lime-500 focus:bg-white transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-lime-500 to-green-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Login
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-400"></div>
                <span className="text-gray-600 text-sm">OR</span>
                <div className="flex-1 h-px bg-gray-400"></div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={googleLogin}
                className="w-full py-4 bg-white text-gray-800 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-3 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-700">
                Don't have an account?{" "}
                <span 
                  className="text-lime-700 font-bold cursor-pointer hover:underline"
                  onClick={() => {
                    setIsLogin(false);
                    setCurrentScreen("roleSelect");
                  }}
                >
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Register Screen with Role Selection
      if (!selectedRole) {
        return (
          <div className="w-full h-screen bg-gradient-to-br from-lime-400 via-green-400 to-emerald-500 flex flex-col items-center justify-center px-6">
            <button
              onClick={() => setIsLogin(true)}
              className="absolute top-8 left-6 flex items-center gap-2 text-white font-semibold text-lg"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <h2 className="text-5xl font-black text-white mb-4 text-center">Choose Your Role</h2>
            <p className="text-lime-50 text-xl mb-14 text-center font-medium">Select how you want to use Artisan Connect</p>
            
            <div className="space-y-6 w-full max-w-sm">
              <button
                onClick={() => setSelectedRole("customer")}
                className="w-full p-7 bg-white rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-5"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-black text-gray-800">Customer</h3>
                  <p className="text-gray-600 font-medium">Find and hire artisans</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("artisan")}
                className="w-full p-7 bg-white rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-5"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-black text-gray-800">Artisan</h3>
                  <p className="text-gray-600 font-medium">Offer your skills</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("supplier")}
                className="w-full p-7 bg-white rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-5"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-lime-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-black text-gray-800">Supplier</h3>
                  <p className="text-gray-600 font-medium">Provide materials</p>
                </div>
              </button>
            </div>
          </div>
        );
      }

      // Registration Form
      return (
        <div className="w-full min-h-screen bg-gradient-to-br from-lime-400 via-green-400 to-emerald-500 py-8 px-6">
          {toast.show && (
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 ${toast.type === "error" ? "bg-red-500" : "bg-lime-600"} text-white font-semibold`}>
              {toast.message}
            </div>
          )}
          
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setSelectedRole("")}
              className="mb-6 text-white flex items-center gap-2 font-semibold text-lg"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <form onSubmit={handleRegister} className="bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white border-opacity-30">
              <h2 className="text-4xl font-black text-white mb-8 text-center">
                {selectedRole === "customer" ? "Customer" : selectedRole === "artisan" ? "Artisan" : "Supplier"} Registration
              </h2>

              <div className="flex flex-col items-center mb-8">
                <div
                  className="cursor-pointer relative"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img
                    src={image}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-2xl"
                  />
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-lime-500 rounded-full flex items-center justify-center border-4 border-white">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <p className="text-white text-base mt-3 font-semibold">Tap to upload photo</p>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="space-y-5">
                <input
                  required
                  type="text"
                  placeholder="First Name"
                  className="w-full px-5 py-4 bg-white bg-opacity-30 border-2 border-white border-opacity-50 rounded-2xl text-white placeholder-white placeholder-opacity-70 outline-none focus:border-opacity-100 transition-all font-medium text-lg"
                  onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  value={firstName}
                />
                
                <input
                  required
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-5 py-4 bg-white bg-opacity-30 border-2 border-white border-opacity-50 rounded-2xl text-white placeholder-white placeholder-opacity-70 outline-none focus:border-opacity-100 transition-all font-medium text-lg"
                  onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  value={lastName}
                />
                
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full px-5 py-4 bg-white bg-opacity-30 border-2 border-white border-opacity-50 rounded-2xl text-white placeholder-white placeholder-opacity-70 outline-none focus:border-opacity-100 transition-all font-medium text-lg"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-5 py-4 bg-white bg-opacity-30 border-2 border-white border-opacity-50 rounded-2xl text-white placeholder-white placeholder-opacity-70 outline-none focus:border-opacity-100 transition-all font-medium text-lg"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    pattern="^(?=.*[A-Z])(?=.*[\W_]).{8,}$"
                    title="Password must be at least 8 characters long and include at least one uppercase letter and one symbol."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    required
                    type={showRePassword ? "text" : "password"}
                    placeholder="Re-enter Password"
                    className="w-full px-5 py-4 bg-white bg-opacity-30 border-2 border-white border-opacity-50 rounded-2xl text-white placeholder-white placeholder-opacity-70 outline-none focus:border-opacity-100 transition-all font-medium text-lg"
                    onChange={(e) => setRePassword(e.target.value)}
                    value={rePassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <input
                  required
                  type="tel"
                  placeholder="Phone"
                  className="w-full px-5 py-4 bg-white bg-opacity-30 border-2 border-white border-opacity-50 rounded-2xl text-white placeholder-white placeholder-opacity-70 outline-none focus:border-opacity-100 transition-all font-medium text-lg"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  value={phone}
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-4 bg-white text-lime-600 rounded-xl text-lg font-bold shadow-xl hover:scale-105 transition-all duration-300"
              >
                Create Account
              </button>

              <p className="text-white text-center mt-4 text-sm">
                Already have an account?{" "}
                <span 
                  className="font-bold underline cursor-pointer" 
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </span>
              </p>
            </form>
          </div>
        </div>
      );
    }
  }

  return null;
}