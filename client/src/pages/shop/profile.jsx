import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import mediaUpload from "../../utils/mediaUpload";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const [activeTab, setActiveTab] = useState("profile");
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState(null);
  const mapRefs = useRef({});

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

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userDeliveries = response.data.filter(d => d.customerEmail === user?.email);
        setDeliveries(userDeliveries);
      } catch (err) {
        Swal.fire("Error", "Could not fetch delivery history.", "error");
      } finally {
        setDeliveriesLoading(false);
      }
    };
    if (user) fetchDeliveries();
  }, [user]);

  const handleDriverLocation = async (deliveryId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/loc/${deliveryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const delivery = res.data;

      setDeliveries(prev =>
        prev.map(d => (d._id === deliveryId ? { ...d, lat: delivery.lat, lng: delivery.lng } : d))
      );
      setExpandedDeliveryId(expandedDeliveryId === deliveryId ? null : deliveryId);
    } catch (err) {
      Swal.fire("Error", "Could not fetch driver location.", "error");
    }
  };

  useEffect(() => {
    if (expandedDeliveryId && mapRefs.current[expandedDeliveryId]) {
      const delivery = deliveries.find(d => d._id === expandedDeliveryId);
      if (!delivery?.lat || !delivery?.lng) return;

      const mapContainer = mapRefs.current[expandedDeliveryId];
      mapContainer.innerHTML = "";

      const map = L.map(mapContainer).setView([delivery.lat, delivery.lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([delivery.lat, delivery.lng]).addTo(map).bindPopup("Driver's Location").openPopup();
    }
  }, [expandedDeliveryId, deliveries]);

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
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel"
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
    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
        );
        setFormData(prev => ({ ...prev, address: res.data?.display_name || "" }));
        Swal.fire("Success", "Location fetched!", "success");
      },
      () => Swal.fire("Error", "Geolocation not allowed or failed.", "error")
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    Swal.fire("Logged out", "See you again!", "success");
    window.location.href = "/login";
  };

  const handleChangePassword = async () => {
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'picked up': return 'bg-blue-500';
      case 'dispatched': return 'bg-[#F85606]';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
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
    <div className="min-h-screen bg-gradient-to-br  pb-20">
      {/* Header with Profile Picture */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6">My Profile</h1>
          
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="relative">
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="cursor-pointer relative active:scale-95 transition-transform"
              >
                <img
                  src={formData.image || "https://via.placeholder.com/150?text=Upload"}
                  className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-lg"
                  alt="Profile"
                />
                <div className="absolute bottom-0 right-0 bg-white text-[#F85606] p-2 rounded-full shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-white">{formData.firstName} {formData.lastName}</h2>
            <p className="text-orange-100 text-sm mt-1">{formData.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-1 mb-4">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                activeTab === "profile" 
                  ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white shadow-md" 
                  : "text-gray-600"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`py-3 px-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                activeTab === "deliveries" 
                  ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white shadow-md" 
                  : "text-gray-600"
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-3 px-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                activeTab === "security" 
                  ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white shadow-md" 
                  : "text-gray-600"
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            {/* Name Fields */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">First Name</label>
              <input 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all bg-white text-sm"
                placeholder="First Name"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">Last Name</label>
              <input 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all bg-white text-sm"
                placeholder="Last Name"
              />
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2">Email</label>
              <input 
                name="email" 
                value={formData.email} 
                disabled 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 text-sm"
              />
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Number
              </label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all bg-white text-sm"
                placeholder="Phone Number"
              />
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address
              </label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all bg-white resize-none text-sm"
                placeholder="Your address"
              />
              <button 
                onClick={getLocation} 
                className="flex items-center gap-2 text-[#F85606] font-bold text-sm mt-2 active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use Current Location
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleUpdate}
                className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update
              </button>
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === "deliveries" && (
          <div className="space-y-3">
            {deliveriesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#F85606] font-semibold">Loading deliveries...</p>
                </div>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Deliveries Yet</h3>
                <p className="text-gray-500 text-sm">Your delivery history will appear here</p>
              </div>
            ) : (
              deliveries.map((delivery) => (
                <div key={delivery._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">{delivery.orderName}</h3>
                        <p className="text-sm text-gray-600">Order #{delivery.orderId}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-3 rounded-lg border border-orange-100">
                        <span className="text-gray-500 text-xs block mb-1">Driver</span>
                        <p className="font-bold text-gray-800 text-sm">{delivery.driverName}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-orange-100">
                        <span className="text-gray-500 text-xs block mb-1">Total</span>
                        <p className="font-bold text-[#F85606] text-sm">Rs. {delivery.total}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDriverLocation(delivery._id)}
                      className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {expandedDeliveryId === delivery._id ? "Hide Location" : "Track Driver"}
                    </button>

                    {expandedDeliveryId === delivery._id && (
                      <div className="mt-3">
                        <div 
                          ref={el => mapRefs.current[delivery._id] = el}
                          className="w-full h-56 rounded-xl border-2 border-orange-200 overflow-hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-3">
            {/* Password Change */}
            <div className="bg-white rounded-2xl shadow-md p-4 border border-orange-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Current Password</label>
                  <input 
                    type="password"
                    name="oldPassword"
                    value={passwords.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all bg-white text-sm"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">New Password</label>
                  <input 
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] transition-all bg-white text-sm"
                    placeholder="Enter new password"
                  />
                </div>

                <button 
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-2 border-red-200">
              <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Danger Zone
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button 
                onClick={handleDelete}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Toast/SweetAlert Position */}
      <style>{`
        .Toastify__toast-container,
        .go2072408551 {
          bottom: 90px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }
        
        .Toastify__toast,
        .go685806154 {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .swal2-popup {
          border-radius: 20px !important;
          padding: 2rem 1.5rem !important;
        }
        
        .swal2-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
        }
        
        .swal2-styled.swal2-confirm {
          background: linear-gradient(to right, #F85606, #FF7420) !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          padding: 12px 32px !important;
          box-shadow: 0 4px 12px rgba(248, 86, 6, 0.3) !important;
        }
      `}</style>
    </div>
  );
}