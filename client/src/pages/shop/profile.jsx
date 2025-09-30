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
        const response = await axios.get(`https://artisanconnect-backend.onrender.com/api/v1/delivery`, {
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
      const res = await axios.get(`https://artisanconnect-backend.onrender.com/api/v1/delivery/loc/${deliveryId}`, {
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-[#32CD32]';
      case 'picked up': return 'bg-[#93DC5C]';
      case 'dispatched': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#DBF3C9]">
        <div className="w-16 h-16 border-4 border-[#32CD32] border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div 
            onClick={() => fileInputRef.current.click()} 
            className="cursor-pointer mb-4 relative"
          >
            <img
              src={formData.image || "https://via.placeholder.com/150?text=Upload+Image"}
              className="w-24 h-24 object-cover rounded-full border-4 border-[#32CD32] shadow-lg"
              alt="Profile"
            />
            <div className="absolute bottom-0 right-0 bg-[#32CD32] text-white p-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>
        <h1 className="text-2xl font-bold text-[#32CD32] mb-1">{formData.firstName} {formData.lastName}</h1>
        <p className="text-gray-600">{formData.email}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-2xl shadow-md border border-[#B7E892] p-1 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === "profile" 
              ? "bg-[#32CD32] text-white shadow-md" 
              : "text-gray-600 hover:text-[#32CD32]"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("deliveries")}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === "deliveries" 
              ? "bg-[#32CD32] text-white shadow-md" 
              : "text-gray-600 hover:text-[#32CD32]"
          }`}
        >
          Deliveries
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === "security" 
              ? "bg-[#32CD32] text-white shadow-md" 
              : "text-gray-600 hover:text-[#32CD32]"
          }`}
        >
          Security
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
          <h2 className="text-xl font-bold text-[#32CD32] mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">First Name</label>
                <input 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                <input 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input 
                name="email" 
                value={formData.email} 
                disabled 
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl bg-gray-50 text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Phone</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                placeholder="Phone Number"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Address</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] resize-none"
                placeholder="Your address"
              />
              <button 
                onClick={getLocation} 
                className="flex items-center gap-2 text-[#32CD32] font-semibold text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use Current Location
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleUpdate}
                className="flex-1 bg-[#32CD32] hover:bg-[#2DB82D] text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md"
              >
                Update Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Tab */}
      {activeTab === "deliveries" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
          <h2 className="text-xl font-bold text-[#32CD32] mb-4">Delivery History</h2>
          {deliveriesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-[#32CD32] border-dashed rounded-full animate-spin"></div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#93DC5C] text-6xl mb-4">🚚</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No deliveries yet</h3>
              <p className="text-gray-500">Your delivery history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="border border-[#B7E892] rounded-xl p-4 bg-[#DBF3C9]/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{delivery.orderName}</h3>
                      <p className="text-sm text-gray-600">Order #{delivery.orderId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Driver:</span>
                      <p className="font-semibold">{delivery.driverName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <p className="font-semibold text-[#32CD32]">Rs.{delivery.total}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDriverLocation(delivery._id)}
                    className="w-full bg-[#93DC5C] hover:bg-[#7ED048] text-white py-2 px-4 rounded-xl font-semibold transition-colors text-sm"
                  >
                    {expandedDeliveryId === delivery._id ? "Hide Location" : "Track Driver"}
                  </button>

                  {expandedDeliveryId === delivery._id && (
                    <div className="mt-3">
                      <div 
                        ref={el => mapRefs.current[delivery._id] = el}
                        className="w-full h-48 rounded-lg border border-[#93DC5C]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
          <h2 className="text-xl font-bold text-[#32CD32] mb-4">Security Settings</h2>
          
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Current Password</label>
              <input 
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                placeholder="Enter current password"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">New Password</label>
              <input 
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                placeholder="Enter new password"
              />
            </div>

            <button 
              onClick={handleChangePassword}
              className="w-full bg-[#32CD32] hover:bg-[#2DB82D] text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md"
            >
              Change Password
            </button>
          </div>

          <div className="border-t border-[#B7E892] pt-4">
            <h3 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h3>
            <button 
              onClick={handleDelete}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-md"
            >
              Delete Account
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}