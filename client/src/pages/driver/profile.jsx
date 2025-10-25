import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import mediaUpload from "../../utils/mediaUpload";

export function Profile() {
  const [user, setUser] = useState(null);
  const fileInputRef = useRef();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    image: "",
  });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData({
        email: parsed.email,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        address: parsed.address,
        phone: parsed.phone,
        image: parsed.image,
      });
    }
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Profile updated!", "success");
      localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
      setUser({ ...user, ...formData });
    } catch {
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Delete your account?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    
    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.clear();
        Swal.fire("Deleted", "Account removed.", "success");
        window.location.href = "/";
      } catch {
        Swal.fire("Error", "Delete failed.", "error");
      }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F85606",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire("Logged Out", "You have been successfully logged out.", "success");
        window.location.href = "/";
      }
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadedUrl = await mediaUpload(file);
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
      Swal.fire("Success", "Image uploaded.", "success");
    } catch {
      Swal.fire("Error", "Image upload failed.", "error");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Error", "Geolocation not supported.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          setFormData(prev => ({ ...prev, address: res.data?.display_name || "" }));
          Swal.fire("Success", "Location fetched!", "success");
        } catch {
          Swal.fire("Error", "Failed to get address from location.", "error");
        }
      },
      () => Swal.fire("Error", "Geolocation not allowed or failed.", "error")
    );
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      Swal.fire("Error", "Please fill both password fields.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update/password/${user.id}`,
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", res.data.message, "success");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to change password", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              My Profile
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              Manage your account
            </p>
          </div>
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">👤</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Image Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="cursor-pointer relative group mb-4"
            >
              <img
                src={formData.image || "https://via.placeholder.com/150?text=Driver+Image"}
                alt="Profile"
                className="w-28 h-28 object-cover rounded-full border-4 border-gradient-to-r from-[#F85606] to-[#FF7420] shadow-xl"
                style={{ borderImage: "linear-gradient(to right, #F85606, #FF7420) 1" }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-2xl">📷</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{formData.email}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1 bg-orange-100 rounded-full">
                <span className="text-[#F85606] text-xs font-semibold">Driver Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-[#F85606] mr-2">ℹ️</span>
            Personal Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-[#F85606] bg-white text-gray-800 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-[#F85606] bg-white text-gray-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border-2 border-orange-100 rounded-xl bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-[#F85606] bg-white text-gray-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Address
              </label>
              <div className="flex gap-2">
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-[#F85606] bg-white text-gray-800 transition-colors"
                />
                <button
                  onClick={getLocation}
                  className="px-4 py-3 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white rounded-xl font-semibold shadow-md active:scale-95 transition-transform"
                >
                  📍
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              💾 Update Profile
            </button>
            <button
              onClick={handleDelete}
              className="px-6 bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-[#F85606] mr-2">🔒</span>
            Security Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-[#F85606] bg-white text-gray-800 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-[#F85606] bg-white text-gray-800 transition-colors"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              🔑 Change Password
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-orange-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-[#F85606] mr-2">🚪</span>
            Session
          </h3>
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-orange-100 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Keep your profile information up to date to ensure smooth deliveries and better service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}