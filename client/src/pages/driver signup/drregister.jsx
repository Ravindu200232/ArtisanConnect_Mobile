import { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import { IoArrowBack, IoCamera } from "react-icons/io5";

export default function DriverRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [drNic, setDrNic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const role = "delivery";
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const uploadedUrl = await mediaUpload(file);
      setImage(uploadedUrl);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Image upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please upload profile picture");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/driver`, {
        email,
        password,
        firstName,
        lastName,
        address,
        phone,
        image,
        vehicleType,
        drNic,
        role,
      });
      toast.success("Registration Successful");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg">
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <IoArrowBack className="text-white text-xl" />
            </button>
            <h1 className="text-xl font-bold text-white">Driver Registration</h1>
            <div className="w-10 h-10"></div> {/* Spacer for balance */}
          </div>
          <p className="text-orange-100 text-sm mt-2 text-center">Register new delivery driver</p>
        </div>
      </div>

      {/* Form Container */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-5">
          {/* Profile Image Upload */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200">
                {image ? (
                  <img
                    src={image}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <IoCamera className="text-orange-400 text-2xl" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-full flex items-center justify-center border-2 border-white">
                <IoCamera className="text-white text-sm" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">First Name</label>
                <input
                  required
                  type="text"
                  placeholder="John"
                  className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                  onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  value={firstName}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium mb-1 block">Last Name</label>
                <input
                  required
                  type="text"
                  placeholder="Doe"
                  className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                  onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  value={lastName}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Email</label>
              <input
                required
                type="email"
                placeholder="john.doe@example.com"
                className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                pattern="^(?=.*[A-Z])(?=.*[\W_]).{8,}$"
                title="Password must be at least 8 characters long and include at least one uppercase letter and one symbol."
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Address</label>
              <input
                required
                type="text"
                placeholder="Enter full address"
                className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Phone Number</label>
              <input
                required
                type="number"
                placeholder="07X XXX XXXX"
                className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Vehicle Type</label>
              <select
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
              >
                <option value="" disabled>Select Vehicle</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            {/* Driver NIC */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Driver NIC</label>
              <input
                required
                type="text"
                placeholder="Enter NIC number"
                className="w-full h-12 bg-orange-50 border border-orange-200 rounded-xl px-4 text-gray-800 outline-none focus:border-[#F85606] transition-colors"
                onChange={(e) => setDrNic(e.target.value)}
                value={drNic}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform duration-200 mt-6 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Register Driver"
              )}
            </button>
          </form>

          {/* Back to Admin */}
          <button
            onClick={() => navigate("/admin")}
            className="w-full h-12 bg-orange-100 text-[#F85606] font-medium rounded-xl border border-orange-200 mt-3 active:scale-95 transition-transform duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}