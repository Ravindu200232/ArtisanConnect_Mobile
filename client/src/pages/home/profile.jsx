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
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState(null);
  const mapRefs = useRef({});

  const statusSteps = ["pending", "confirmed", "preparing", "dispatched", "delivered"];

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
    if (user) {
      fetchDeliveries();
      fetchOrders();
      fetchNotifications();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userDeliveries = response.data.filter(d => d.customerEmail === user?.email);
      setDeliveries(userDeliveries);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/customer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userOrders = response.data.filter(order => order.email === user?.email);
      setOrders(userOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/notification/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

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
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire("Logged out", "See you again!", "success");
        window.location.href = "/login";
      }
    });
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

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/notification/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-600';
      case 'dispatched': return 'bg-purple-500';
      case 'preparing': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCurrentStepIndex = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const index = statusSteps.indexOf(normalizedStatus);
    return index === -1 ? 0 : index;
  };

  const StatusTracker = ({ status }) => {
    const currentStep = getCurrentStepIndex(status);
    
    const getStepIcon = (step) => {
      switch(step) {
        case 'pending':
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'confirmed':
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'preparing':
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          );
        case 'dispatched':
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          );
        case 'delivered':
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div className="py-4">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-[#F85606] to-[#FF6B2C] transition-all duration-1000 ease-out"
              style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center relative z-10" style={{ width: `${100 / statusSteps.length}%` }}>
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 mb-2
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-[#F85606] to-[#FF6B2C] text-white shadow-lg scale-110' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
                  ${isCurrent ? 'animate-pulse ring-4 ring-orange-100' : ''}
                `}>
                  {getStepIcon(step)}
                </div>

                {/* Step Label */}
                <span className={`
                  text-xs font-medium text-center capitalize transition-colors duration-300
                  ${isCompleted ? 'text-[#F85606]' : 'text-gray-400'}
                  ${isCurrent ? 'font-bold' : ''}
                `}>
                  {step}
                </span>

                {/* Active Indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-1 w-2 h-2 bg-[#F85606] rounded-full animate-bounce" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Daraz Orange Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF6B2C] text-white pt-6 pb-20 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">My Account</h1>
          <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
            Logout
          </button>
        </div>
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 -mb-16">
          <div className="flex items-center gap-4">
            <div className="relative" onClick={() => fileInputRef.current.click()}>
              <img
                src={formData.image || "https://via.placeholder.com/150?text=User"}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#F85606]"
                alt="Profile"
              />
              <div className="absolute bottom-0 right-0 bg-[#F85606] text-white p-1.5 rounded-full shadow-md">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{formData.firstName} {formData.lastName}</h2>
              <p className="text-sm text-gray-500">{formData.email}</p>
              <p className="text-xs text-gray-400 mt-1">{formData.phone || 'Add phone number'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 pt-20 pb-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-2 text-center transition ${
                activeTab === "profile" ? "bg-[#FFF5F0]" : ""
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-1 ${activeTab === "profile" ? "text-[#F85606]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-xs font-medium ${activeTab === "profile" ? "text-[#F85606]" : "text-gray-600"}`}>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-2 text-center transition ${
                activeTab === "orders" ? "bg-[#FFF5F0]" : ""
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-1 ${activeTab === "orders" ? "text-[#F85606]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className={`text-xs font-medium ${activeTab === "orders" ? "text-[#F85606]" : "text-gray-600"}`}>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`py-4 px-2 text-center transition ${
                activeTab === "deliveries" ? "bg-[#FFF5F0]" : ""
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-1 ${activeTab === "deliveries" ? "text-[#F85606]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span className={`text-xs font-medium ${activeTab === "deliveries" ? "text-[#F85606]" : "text-gray-600"}`}>Delivery</span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-2 text-center transition relative ${
                activeTab === "notifications" ? "bg-[#FFF5F0]" : ""
              }`}
            >
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
              <svg className={`w-6 h-6 mx-auto mb-1 ${activeTab === "notifications" ? "text-[#F85606]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className={`text-xs font-medium ${activeTab === "notifications" ? "text-[#F85606]" : "text-gray-600"}`}>Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">First Name</label>
                    <input 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Last Name</label>
                    <input 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Email Address</label>
                  <input 
                    name="email" 
                    value={formData.email} 
                    disabled 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Phone Number</label>
                  <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606]"
                    placeholder="+94 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Delivery Address</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] resize-none"
                  />
                  <button 
                    onClick={getLocation} 
                    className="flex items-center gap-1 text-[#F85606] text-xs font-medium mt-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use Current Location
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleUpdate}
              className="w-full bg-[#F85606] hover:bg-[#E04E05] text-white py-3.5 rounded-lg font-semibold shadow-md transition"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                My Orders
              </h3>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-300 text-6xl mb-4">📦</div>
                <h4 className="text-base font-semibold text-gray-700 mb-2">No orders yet</h4>
                <p className="text-sm text-gray-500">Start shopping to see your orders here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex gap-3 mb-4">
                        {order.image && (
                          <img
                            src={order.image}
                            alt={order.Item_name}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-100"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">{order.Item_name}</h4>
                              <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-base font-bold text-[#F85606]">Rs.{order.totalAmount}</p>
                          </div>
                        </div>
                      </div>

                      {/* Animated Status Tracker */}
                      <div className="border-t border-gray-100 pt-4">
                        <StatusTracker status={order.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === "deliveries" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Track Delivery
              </h3>
            </div>
            {deliveriesLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-300 text-6xl mb-4">🚚</div>
                <h4 className="text-base font-semibold text-gray-700 mb-2">No active deliveries</h4>
                <p className="text-sm text-gray-500">Your delivery tracking will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliveries.map((delivery) => (
                  <div key={delivery._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{delivery.orderName}</h4>
                          <p className="text-xs text-gray-500">Order #{delivery.orderId}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>

                      {/* Animated Status Tracker for Delivery */}
                      <div className="mb-4">
                        <StatusTracker status={delivery.status} />
                      </div>

                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Driver</p>
                          <p className="text-sm font-medium text-gray-800">{delivery.driverName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-base font-bold text-[#F85606]">Rs.{delivery.total}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDriverLocation(delivery._id)}
                        className="w-full bg-gradient-to-r from-[#F85606] to-[#FF6B2C] hover:from-[#E04E05] hover:to-[#F85606] text-white py-2.5 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {expandedDeliveryId === delivery._id ? "Hide Location" : "Track Live Location"}
                      </button>

                      {expandedDeliveryId === delivery._id && (
                        <div className="mt-3">
                          <div 
                            ref={el => mapRefs.current[delivery._id] = el}
                            className="w-full h-56 rounded-lg overflow-hidden border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Notifications
              </h3>
            </div>
            {notificationsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-300 text-6xl mb-4">🔔</div>
                <h4 className="text-base font-semibold text-gray-700 mb-2">No notifications</h4>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`rounded-xl overflow-hidden cursor-pointer transition ${
                      notification.read 
                        ? 'bg-white' 
                        : 'bg-[#FFF5F0]'
                    }`}
                    onClick={() => !notification.read && markNotificationAsRead(notification._id)}
                  >
                    <div className="p-4 flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.read ? 'bg-gray-100' : 'bg-[#F85606]'
                      }`}>
                        <svg className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[#F85606] rounded-full flex-shrink-0 ml-2 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}