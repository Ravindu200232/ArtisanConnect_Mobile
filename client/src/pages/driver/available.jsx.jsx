import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import mediaUpload from "../../utils/mediaUpload";

export function Available() {
  const fileInputRef = useRef();
  const [driver, setDriver] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    image: "",
    vehicleType: "",
    drNic: "",
    isAvailable: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setDriver(parsed);
      setFormData({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        address: parsed.address,
        image: parsed.image,
        vehicleType: parsed.vehicleType,
        drNic: parsed.drNic,
        isAvailable: parsed.isAvailable,
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploadedUrl = await mediaUpload(file);
      setFormData((prev) => ({
        ...prev,
        image: uploadedUrl,
      }));
      Swal.fire("Uploaded", "Image uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Image upload failed", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/v1/driver/${driver.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire("Success", "Driver updated successfully", "success");
      localStorage.setItem("user", JSON.stringify({ ...driver, ...formData }));
      setDriver({ ...driver, ...formData });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading driver info...</p>
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
          Update your availability and information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892]">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => fileInputRef.current.click()}
            className="cursor-pointer mb-4"
          >
            <img
              src={
                formData.image ||
                "https://via.placeholder.com/150?text=Driver+Image"
              }
              alt="Driver"
              className="w-24 h-24 object-cover rounded-full border-4 border-[#32CD32] shadow-lg"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
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
                type="text"
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
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
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
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Vehicle Type
            </label>
            <input
              type="text"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
              placeholder="e.g., Motorcycle, Car, Van"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Driver NIC
            </label>
            <input
              type="text"
              name="drNic"
              value={formData.drNic}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-[#93DC5C]">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Available for Delivery
              </label>
              <p className="text-xs text-gray-600">
                {formData.isAvailable ? 'You are available for new deliveries' : 'You are not available for deliveries'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#32CD32]"></div>
            </label>
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          className="w-full bg-[#32CD32] text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 active:bg-[#2DB82D] mt-6 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Update Profile
        </button>
      </div>
    </div>
  );
}