import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export function DeliveryTrack() {
  const [deliveries, setDeliveries] = useState([]);
  const [expandedDelivery, setExpandedDelivery] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/delivery", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error("Failed to fetch deliveries", err);
      toast.error("Failed to load deliveries");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/delivery/update/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchDeliveries();
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    }
  };

  const updateLocation = async (id) => {
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        await axios.put(
          `http://localhost:3000/api/v1/delivery/location/${id}`,
          { lat: latitude, lng: longitude },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Location updated successfully");
        fetchDeliveries();
      }, () => {
        toast.error("Failed to get location");
      });
    } catch (err) {
      console.error("Failed to update location", err);
      toast.error("Failed to update location");
    }
  };

  const toggleDeliveryExpand = (deliveryId) => {
    setExpandedDelivery(expandedDelivery === deliveryId ? null : deliveryId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "picked up": return "bg-yellow-100 text-yellow-800";
      case "on the way": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Delivery Tracking
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage your delivery status and location
        </p>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-gray-500">No deliveries assigned</p>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <div key={delivery._id} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Delivery Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">Order #{delivery.orderId}</h3>
                    <p className="text-sm text-gray-600">{delivery.orderName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-semibold">{delivery.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="font-semibold truncate">{delivery.address}</p>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedDelivery === delivery._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Location Info */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Current Location</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Latitude</p>
                        <p className="font-semibold">{delivery.lat || "Not set"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Longitude</p>
                        <p className="font-semibold">{delivery.lng || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status
                      </label>
                      <select
                        value={delivery.status}
                        onChange={(e) => updateStatus(delivery._id, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
                      >
                        <option value="picked up">Picked Up</option>
                        <option value="on the way">On The Way</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <button
                      onClick={() => updateLocation(delivery._id)}
                      className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-[#2DB82D] flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Update Current Location
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleDeliveryExpand(delivery._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedDelivery === delivery._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Details & Actions
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}