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
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery`, {
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
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/update/${id}`,
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
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery/location/${id}`,
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
      case "picked up": return "bg-amber-100 text-amber-800 border-amber-200";
      case "on the way": return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "picked up":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
      case "on the way":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        );
      case "delivered":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                Delivery Tracking
              </h1>
              <p className="text-xs text-orange-100">
                {deliveries.length} {deliveries.length === 1 ? 'delivery' : 'deliveries'} assigned
              </p>
            </div>
            <button className="text-white" onClick={fetchDeliveries}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Deliveries List */}
        <div className="space-y-3">
          {deliveries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 border border-orange-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Deliveries Yet</h3>
              <p className="text-sm text-gray-500">You don't have any assigned deliveries</p>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div key={delivery._id} className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden">
                {/* Delivery Header */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#F85606] bg-orange-100 px-2 py-1 rounded">
                          #{delivery.orderId}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">{delivery.orderName}</h3>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      {delivery.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#F85606] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{delivery.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#F85606] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Delivery Address</p>
                        <p className="text-sm font-semibold text-gray-800">{delivery.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedDelivery === delivery._id && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Location Info */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <h4 className="font-bold text-gray-800 text-sm">Current Location</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-lg border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Latitude</p>
                          <p className="text-sm font-bold text-gray-800">{delivery.lat || "Not set"}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Longitude</p>
                          <p className="text-sm font-bold text-gray-800">{delivery.lng || "Not set"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Update Delivery Status
                        </label>
                        <div className="relative">
                          <select
                            value={delivery.status}
                            onChange={(e) => updateStatus(delivery._id, e.target.value)}
                            className="w-full p-3 pl-4 pr-10 border-2 border-orange-100 rounded-xl bg-white text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent appearance-none"
                          >
                            <option value="picked up">📦 Picked Up</option>
                            <option value="on the way">🚚 On The Way</option>
                            <option value="delivered">✅ Delivered</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => updateLocation(delivery._id)}
                        className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Update My Location
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Toggle Button */}
                <div className="border-t border-orange-100">
                  <button
                    onClick={() => toggleDeliveryExpand(delivery._id)}
                    className="w-full py-3 text-[#F85606] font-bold text-sm active:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {expandedDelivery === delivery._id ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                        Hide Details
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
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
    </div>
  );
}