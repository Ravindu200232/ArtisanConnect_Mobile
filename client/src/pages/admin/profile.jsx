import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import mediaUpload from "../../utils/mediaUpload";
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdLogout, MdDelete, MdLock, MdMyLocation, MdEdit } from "react-icons/md";

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
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/api/v1/users/update/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Profile updated successfully!", "success");
      localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
      setUser({ ...user, ...formData });
    } catch {
      Swal.fire("Error", "Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Delete Account?",
      text: "This will permanently delete your account and all data. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });
    
    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/v1/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.clear();
        Swal.fire("Deleted", "Your account has been removed.", "success");
        window.location.href = "/";
      } catch {
        Swal.fire("Error", "Delete failed.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const uploadedUrl = await mediaUpload(file);
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
      Swal.fire("Success", "Profile picture updated!", "success");
    } catch {
      Swal.fire("Error", "Image upload failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Error", "Geolocation is not supported by your browser.", "error");
      return;
    }

    Swal.fire({
      title: 'Getting Location...',
      text: 'Please allow location access',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false
    });

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          setFormData(prev => ({ ...prev, address: res.data?.display_name || "" }));
          Swal.fire("Success", "Location fetched successfully!", "success");
        } catch {
          Swal.fire("Error", "Failed to get address from location.", "error");
        }
      },
      () => Swal.fire("Error", "Location access denied or failed.", "error")
    );
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      Swal.fire("Error", "Please fill both password fields.", "error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:3000/api/v1/users/update/password/${user.id}`,
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", res.data.message, "success");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire("Logged out", "See you again!", "success");
        window.location.href = "/login";
      }
    });
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
          My Profile
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage your account information
        </p>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex bg-white rounded-2xl p-1 border border-[#B7E892] mb-4">
        <button
          onClick={() => setActiveSection("profile")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSection === "profile" 
              ? "bg-[#32CD32] text-white" 
              : "text-gray-600"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveSection("password")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            activeSection === "password" 
              ? "bg-[#32CD32] text-white" 
              : "text-gray-600"
          }`}
        >
          Password
        </button>
      </div>

      {/* Profile Picture */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] mb-4">
        <div className="flex flex-col items-center">
          <div
            onClick={() => fileInputRef.current.click()}
            className="cursor-pointer mb-4 relative"
          >
            <img
              src={formData.image || "https://via.placeholder.com/150?text=Profile+Image"}
              className="w-24 h-24 object-cover rounded-full border-4 border-[#32CD32] shadow-lg"
              alt="Profile"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#32CD32] rounded-full flex items-center justify-center border-2 border-white">
              <MdEdit className="text-white text-sm" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          <h2 className="text-lg font-bold text-gray-800 text-center">
            {formData.firstName} {formData.lastName}
          </h2>
          <p className="text-gray-600 text-sm text-center">{formData.email}</p>
        </div>
      </div>

      {/* Profile Information */}
      {activeSection === "profile" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] mb-4">
          <h3 className="text-lg font-bold text-[#32CD32] mb-4 flex items-center gap-2">
            <MdPerson />
            Personal Information
          </h3>
          
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
                  placeholder="First Name"
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
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <MdEmail />
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
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <MdPhone />
                Phone
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
                placeholder="Phone Number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <MdLocationOn />
                Address
              </label>
              <div className="flex gap-2">
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
                  placeholder="Your Address"
                />
                <button
                  onClick={getLocation}
                  className="px-4 py-2 bg-[#32CD32] text-white rounded-xl font-semibold flex items-center gap-2"
                  title="Use Current Location"
                >
                  <MdMyLocation />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 bg-[#32CD32] text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-[#2DB82D] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-dashed rounded-full animate-spin"></div>
              ) : (
                <>
                  <MdEdit />
                  Update Profile
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
            >
              <MdLogout />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Change Password Section */}
      {activeSection === "password" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] mb-4">
          <h3 className="text-lg font-bold text-[#32CD32] mb-4 flex items-center gap-2">
            <MdLock />
            Change Password
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
                placeholder="Enter current password"
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
                placeholder="Enter new password"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-[#32CD32] text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-[#2DB82D] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-dashed rounded-full animate-spin"></div>
              ) : (
                <>
                  <MdLock />
                  Change Password
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
        <h3 className="text-lg font-bold text-red-600 mb-3">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
        >
          <MdDelete />
          Delete Account
        </button>
      </div>
    </div>
  );
}