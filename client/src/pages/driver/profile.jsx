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
      await axios.put(`https://artisanconnect-backend.onrender.com/api/v1/users/update/${user.id}`, formData, {
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
        await axios.delete(`https://artisanconnect-backend.onrender.com/api/v1/users/${user.id}`, {
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
        `https://artisanconnect-backend.onrender.com/api/v1/users/update/password/${user.id}`,
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
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Driver Profile
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] mb-4">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => fileInputRef.current.click()}
            className="cursor-pointer mb-4"
          >
            <img
              src={formData.image || "https://via.placeholder.com/150?text=Driver+Image"}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full border-4 border-[#32CD32] shadow-lg"
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-sm text-gray-600">{formData.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Name
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Last Name
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Address
            </label>
            <div className="flex gap-2">
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
              />
              <button
                onClick={getLocation}
                className="px-3 py-2 bg-[#32CD32] text-white rounded-xl font-semibold text-sm"
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
            className="flex-1 bg-[#32CD32] text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-[#2DB82D]"
          >
            Update Profile
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-red-600"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        <h3 className="text-lg font-bold text-[#32CD32] mb-4">Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Old Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
            />
          </div>
          <button
            onClick={handleChangePassword}
            className="w-full bg-[#32CD32] text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-[#2DB82D]"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}