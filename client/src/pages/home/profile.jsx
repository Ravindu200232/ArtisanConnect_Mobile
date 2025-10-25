import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import mediaUpload from "../../utils/mediaUpload";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HiLocationMarker } from "react-icons/hi";
import { AiOutlineMail } from "react-icons/ai";
import { BiPhoneCall } from "react-icons/bi";

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
  const [inquiries, setInquiries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const mapRefs = useRef({});

  // Settings state
  const [appSettings, setAppSettings] = useState({
    notifications: true,
    location: true,
    biometric: false,
    darkMode: false,
    autoUpdate: true,
    dataSaver: false
  });

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

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      setAppSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    if (user) {
      fetchDeliveries();
      fetchOrders();
      fetchNotifications();
      fetchInquiries();
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

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inquiry`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(response.data || []);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setInquiriesLoading(false);
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
    if (!appSettings.location) {
      Swal.fire("Location Disabled", "Please enable location services in settings to use this feature.", "warning");
      return;
    }

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

  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    if (!inquiryMessage.trim()) {
      Swal.fire("Error", "Please enter your message.", "warning");
      return;
    }

    try {
      setInquiryLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/inquiry`,
        { message: inquiryMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("Success", "Your inquiry or feedback has been submitted.", "success");
      setInquiryMessage("");
      fetchInquiries();
    } catch (error) {
      console.error("Inquiry or feedback submission failed", error);
      Swal.fire("Error", "Please login first.", "error");
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleInquiryUpdate = async (inquiryId, message) => {
    try {
      const token = localStorage.getItem("token");

      if (!message.trim()) {
        Swal.fire("Warning", "Message cannot be empty.", "warning");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/inquiry/${inquiryId}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire("Success", "Inquiry or feedback updated successfully.", "success");
      fetchInquiries();
    } catch (err) {
      console.error("Failed to update inquiry", err);
      Swal.fire("Error", "Failed to update inquiry.", "error");
    }
  };

  const handleInquiryDelete = async (inquiryId) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/inquiry/${inquiryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("Deleted!", "Your inquiry or feedback updated has been removed.", "success");
        fetchInquiries();
      } catch (err) {
        console.error("Failed to delete inquiry", err);
        Swal.fire("Error", "Failed to delete inquiry.", "error");
      }
    }
  };

  // Settings toggle handler
  const handleSettingToggle = (settingId) => {
    setAppSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));

    // Show feedback for specific settings
    const settingNames = {
      notifications: "Push Notifications",
      location: "Location Services",
      biometric: "Biometric Login",
      darkMode: "Dark Mode",
      autoUpdate: "Auto Update",
      dataSaver: "Data Saver"
    };

    const action = appSettings[settingId] ? "disabled" : "enabled";
    Swal.fire("Success", `${settingNames[settingId]} ${action}`, "success");
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

  // Settings configuration
  const settingsConfig = [
    {
      id: "notifications",
      title: "Push Notifications",
      description: "Order updates, promotions, and alerts",
      icon: "🔔",
      type: "toggle"
    },
    {
      id: "location",
      title: "Location Services",
      description: "For delivery tracking and nearby shops",
      icon: "📍",
      type: "toggle"
    },
    {
      id: "biometric",
      title: "Biometric Login",
      description: "Use fingerprint or face ID",
      icon: "👆",
      type: "toggle"
    },
    {
      id: "darkMode",
      title: "Dark Mode",
      description: "Switch to dark theme",
      icon: "🌙",
      type: "toggle"
    },
    {
      id: "autoUpdate",
      title: "Auto Update",
      description: "Keep app updated automatically",
      icon: "🔄",
      type: "toggle"
    },
    {
      id: "dataSaver",
      title: "Data Saver",
      description: "Reduce data usage",
      icon: "📱",
      type: "toggle"
    }
  ];

  const accountSettings = [
    {
      id: "privacy",
      title: "Privacy & Security",
      description: "Manage your data and security settings",
      icon: "🔒",
      type: "link"
    },
    {
      id: "language",
      title: "Language",
      description: "App language settings",
      icon: "🌐",
      value: "English",
      type: "link"
    },
    {
      id: "currency",
      title: "Currency",
      description: "Preferred currency for payments",
      icon: "💵",
      value: "LKR - Sri Lankan Rupee",
      type: "link"
    },
    {
      id: "theme",
      title: "Theme",
      description: "Appearance and theme settings",
      icon: "🎨",
      value: "Default",
      type: "link"
    }
  ];

  const supportSettings = [
    {
      id: "help",
      title: "Help & Support",
      description: "Get help with the app",
      icon: "❓",
      type: "link"
    },
    {
      id: "about",
      title: "About App",
      description: "Version and app information",
      icon: "ℹ️",
      value: "Version 2.1.0",
      type: "link"
    },
    {
      id: "rate",
      title: "Rate App",
      description: "Share your experience",
      icon: "⭐",
      type: "link"
    },
    {
      id: "share",
      title: "Share App",
      description: "Tell friends about us",
      icon: "📤",
      type: "link"
    }
  ];

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
          style={{
            height: "40px",
            width: "100%",
            background: "linear-gradient(to right,#F85606, #FF7420 )",
            position: "",
            top: 0,
            left: 0,
            zIndex: 1000
          }}
        />
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
          <div className="grid grid-cols-5 divide-x divide-gray-100">
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
              onClick={() => setActiveTab("inquiries")}
              className={`py-4 px-2 text-center transition ${
                activeTab === "inquiries" ? "bg-[#FFF5F0]" : ""
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-1 ${activeTab === "inquiries" ? "text-[#F85606]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className={`text-xs font-medium ${activeTab === "inquiries" ? "text-[#F85606]" : "text-gray-600"}`}>Inquiries</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-2 text-center transition ${
                activeTab === "settings" ? "bg-[#FFF5F0]" : ""
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-1 ${activeTab === "settings" ? "text-[#F85606]" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`text-xs font-medium ${activeTab === "settings" ? "text-[#F85606]" : "text-gray-600"}`}>Settings</span>
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

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <BiPhoneCall className="text-xl text-[#F85606] mr-3" />
                  <span className="text-sm font-medium">0789840996</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <AiOutlineMail className="text-xl text-[#F85606] mr-3" />
                  <span className="text-sm font-medium">Ravindu2232@gmail.com</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <HiLocationMarker className="text-xl text-[#F85606] mr-3" />
                  <span className="text-sm font-medium">Kahatagasdigiliya, Anuradhapura</span>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Send Inquiry or feedback
              </h3>
              <form className="space-y-3" onSubmit={handleInquirySubmit}>
                <textarea
                  name="message"
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="4"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606] resize-none"
                ></textarea>

                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full bg-[#F85606] hover:bg-[#E04E05] text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {inquiryLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Inquiry List */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Your Inquiries
              </h3>
              {inquiriesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-300 text-4xl mb-3">💬</div>
                  <p className="text-sm text-gray-500">No inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inquiry, index) => (
                    <div key={inquiry._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          inquiry.response 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {inquiry.response ? 'Replied' : 'Pending'}
                        </span>
                      </div>
                      
                      <textarea
                        rows="2"
                        className="w-full p-2 border border-gray-300 rounded text-sm mb-2 resize-none"
                        value={inquiry.message}
                        onChange={(e) => {
                          const updated = [...inquiries];
                          updated[index].message = e.target.value;
                          setInquiries(updated);
                        }}
                      />

                      {inquiry.response && (
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <p className="text-xs text-gray-500 mb-1">Response:</p>
                          <p className="text-gray-700">{inquiry.response}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleInquiryUpdate(inquiry._id, inquiry.message)}
                          className="flex-1 bg-[#F85606] text-white py-2 rounded text-sm font-medium hover:bg-[#E04E05] transition"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleInquiryDelete(inquiry._id)}
                          className="flex-1 bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* App Settings */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                App Settings
              </h3>
              <div className="space-y-3">
                {settingsConfig.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{setting.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{setting.title}</p>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                    </div>
                    {setting.type === "toggle" && (
                      <button
                        onClick={() => handleSettingToggle(setting.id)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                          appSettings[setting.id] ? 'bg-[#F85606]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                          appSettings[setting.id] ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Account Settings
              </h3>
              <div className="space-y-3">
                {accountSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{setting.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{setting.title}</p>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {setting.value && (
                        <p className="text-sm text-gray-600">{setting.value}</p>
                      )}
                      <span className="text-gray-400">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support & About */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-5 bg-[#F85606] rounded mr-2"></span>
                Support & About
              </h3>
              <div className="space-y-3">
                {supportSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{setting.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{setting.title}</p>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {setting.value && (
                        <p className="text-sm text-gray-600">{setting.value}</p>
                      )}
                      <span className="text-gray-400">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-red-200">
              <h3 className="text-base font-bold text-red-700 mb-4 flex items-center">
                <span className="w-1 h-5 bg-red-500 rounded mr-2"></span>
                Danger Zone
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition"
                >
                  Delete Account
                </button>
                <p className="text-xs text-red-600 text-center">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}