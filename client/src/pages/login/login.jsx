import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  showNotificationAlert
} from "../../components/showSuccessAlert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const googleLogin = async () => {
    try {
      setIsLoading(true);
      showNotificationAlert("Google Login", "Initiating Google login...", "info");

      const mockAccessToken = "mock_google_token_" + Date.now();

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: mockAccessToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      showSuccessAlert("Success", "Login successful!", 1500);

      const user = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          phone: user.phone,
          image: user.image,
        })
      );

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin/";
        } else if (user.role === "artisan") {
          window.location.href = "/shopC/";
        } else if (user.role === "supplier") {
          window.location.href = "/shopC/";
        } else if (user.role === "delivery") {
          window.location.href = "/driver/";
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      showErrorAlert("Login Failed", "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showErrorAlert("Missing Information", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    let loadingAlert;

    try {
      // Show loading alert
      loadingAlert = showLoadingAlert("Logging in", "Please wait...");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showErrorAlert("Login Failed", data.message || "Invalid email or password");
        return;
      }

      if (data.message === "User is blocked") {
        showErrorAlert("Account Blocked", "Your account has been temporarily suspended");
        return;
      }

      showSuccessAlert("Welcome Back!", "Login successful!", 1500);
      
      const user = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          phone: user.phone,
          image: user.image,
          lat: user.lat,
          lng: user.lng,
        })
      );

      if (user.emailVerified === false) {
        showErrorAlert("Email Verification Required", "Please verify your email before logging in");
        setTimeout(() => (window.location.href = "/verify-email"), 2000);
        return;
      }

      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin/";
        } else if (user.role === "artisan") {
          window.location.href = "/shopC/";
        } else if (user.role === "supplier") {
          window.location.href = "/shopC/";
        } else if (user.role === "delivery") {
          window.location.href = "/driver/";
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      showErrorAlert("Connection Error", "Unable to connect to server. Please check your internet connection.");
    } finally {
      setIsLoading(false);
      // Close loading alert if it's still open
      if (loadingAlert && Swal.isLoading()) {
        Swal.close();
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-800 -ml-9">
            Login
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#F85606] rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Login to your account
          </p>

          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2 font-medium">
                EMAIL
              </label>
              <input
                required
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-2 font-medium">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#F85606] hover:bg-[#E04D05] disabled:bg-orange-300 text-white font-semibold rounded-lg shadow-md transition-colors mt-6 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
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
              disabled={isLoading}
              className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm">Login with Google</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <span
                className="text-[#F85606] font-semibold cursor-pointer hover:underline"
                onClick={() => !isLoading && navigate("/register")}
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