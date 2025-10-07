import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import mediaUpload from "../../utils/mediaUpload";
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdLogout, MdDelete, MdLock, MdMyLocation, MdEdit, MdCameraAlt } from "react-icons/md";

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
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        title: "Success",
        text: "Profile updated successfully!",
        icon: "success",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));
      setUser({ ...user, ...formData });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to update profile.",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
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
      confirmButtonColor: "#F85606",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      position: "center"
    });
    
    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.clear();
        Swal.fire({
          title: "Deleted",
          text: "Your account has been removed.",
          icon: "success",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        window.location.href = "/";
      } catch {
        Swal.fire({
          title: "Error",
          text: "Delete failed.",
          icon: "error",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
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
      Swal.fire({
        title: "Success",
        text: "Profile picture updated!",
        icon: "success",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Image upload failed.",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        title: "Error",
        text: "Geolocation is not supported by your browser.",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    Swal.fire({
      title: 'Getting Location...',
      text: 'Please allow location access',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      position: "center"
    });

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          setFormData(prev => ({ ...prev, address: res.data?.display_name || "" }));
          Swal.fire({
            title: "Success",
            text: "Location fetched successfully!",
            icon: "success",
            position: "bottom",
            toast: true,
            timer: 3000,
            showConfirmButton: false
          });
        } catch {
          Swal.fire({
            title: "Error",
            text: "Failed to get address from location.",
            icon: "error",
            position: "bottom",
            toast: true,
            timer: 3000,
            showConfirmButton: false
          });
        }
      },
      () => Swal.fire({
        title: "Error",
        text: "Location access denied or failed.",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      })
    );
  };

  const handleChangePassword = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) {
      Swal.fire({
        title: "Error",
        text: "Please fill both password fields.",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update/password/${user.id}`,
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        title: "Success",
        text: res.data.message,
        icon: "success",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to change password",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
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
      confirmButtonColor: '#F85606',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, logout!',
      position: "center"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: "Logged out",
          text: "See you again!",
          icon: "success",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        window.location.href = "/login";
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">
                My Profile
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage your account
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdPerson className="text-2xl text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Section Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-orange-100 shadow-md">
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeSection === "profile" 
                ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white shadow-md" 
                : "text-gray-600"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection("password")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeSection === "password" 
                ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white shadow-md" 
                : "text-gray-600"
            }`}
          >
            Password
          </button>
        </div>

        {/* Profile Picture */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="cursor-pointer mb-4 relative"
            >
              <img
                src={formData.image || "https://via.placeholder.com/150?text=Profile+Image"}
                className="w-28 h-28 object-cover rounded-full border-4 border-[#F85606] shadow-lg"
                alt="Profile"
              />
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-full flex items-center justify-center border-4 border-white shadow-md">
                <MdCameraAlt className="text-white text-lg" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            <h2 className="text-xl font-bold text-gray-800 text-center">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-600 text-sm text-center mt-1">{formData.email}</p>
          </div>
        </div>

        {/* Profile Information */}
        {activeSection === "profile" && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <h3 className="text-lg font-bold text-[#F85606] mb-4 flex items-center gap-2">
              <MdPerson />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-white text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-white text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdEmail className="text-[#F85606]" />
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-3 border-2 border-orange-200 rounded-xl bg-gray-100 text-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdPhone className="text-[#F85606]" />
                  Phone
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-white text-sm"
                  placeholder="Phone Number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdLocationOn className="text-[#F85606]" />
                  Address
                </label>
                <div className="flex gap-2">
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="flex-1 px-3 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-white text-sm"
                    placeholder="Your Address"
                  />
                  <button
                    onClick={getLocation}
                    className="px-4 py-3 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white rounded-xl font-bold flex items-center gap-2 shadow-md active:scale-95 transition-transform"
                    title="Use Current Location"
                  >
                    <MdMyLocation className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-dashed rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MdEdit />
                    Update
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <MdLogout />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {activeSection === "password" && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-orange-100">
            <h3 className="text-lg font-bold text-[#F85606] mb-4 flex items-center gap-2">
              <MdLock />
              Change Password
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-white text-sm"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-white text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
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
        <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
            <MdDelete />
            Danger Zone
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDelete}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <MdDelete />
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}