import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const googleLogin = async () => {
    try {
      showToast("Google login initiated...");
      
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

  const handleOnSubmit = async (e) => {
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
          window.location.href = "/artisan/";
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

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white font-semibold`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 -ml-9">Login</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#F85606] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Login to your account</p>

          <form onSubmit={handleOnSubmit} className="space-y-4">
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
              <label className="block text-xs text-gray-600 mb-2 font-medium">PASSWORD</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#F85606] hover:bg-[#E04D05] text-white font-semibold rounded-lg shadow-md transition-colors mt-6"
            >
              Login
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-xs">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={googleLogin}
              className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Login with Google</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <span 
                className="text-[#F85606] font-semibold cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}