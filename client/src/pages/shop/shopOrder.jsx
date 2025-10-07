import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function ShopOrder() {
  const [bookingData, setBookingData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [ordersResponse, driversResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/driver`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBookingData(ordersResponse.data || []);
        setDrivers(driversResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBookingData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);

      if (newStatus === "confirmed") {
        const order = bookingData.find((o) => o.orderId === orderId);
        const driverId = order?.assignedDriver;

        if (!driverId) {
          toast.error("Please select a driver before confirming.");
          return;
        }

        const driver = drivers.find((driver) => driver._id === driverId);
        
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/delivery`,
          {
            orderId,
            driverId,
            driverName: `${driver?.firstName || ""} ${driver?.lastName || ""}`.trim() || "N/A",
            driverPhone: driver?.phone || "N/A",
            status: "picked up",
            driverEmail: driver?.email || "N/A",
            customerEmail: order?.email,
            address: order?.address,
            phone: order?.phone,
            estimatedTime: new Date(Date.now() + 30 * 60 * 1000),
            lat: order?.lat || 0,
            lng: order?.lng || 0,
            timestamp: new Date(),
            orderName: order?.Item_name,
            itemImage: order?.image,
            price: order?.price,
            total: order?.totalAmount,
            qty: order?.quantity,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/notification`,
          {
            orderId,
            driverId,
            driverName: `${driver?.firstName || ""} ${driver?.lastName || ""}`.trim() || "N/A",
            driverPhone: driver?.phone || "N/A",
            status: "picked up",
            driverEmail: driver?.email || "N/A",
            customerEmail: order?.email,
            address: order?.address,
            phone: order?.phone,
            estimatedTime: new Date(Date.now() + 30 * 60 * 1000),
            lat: order?.lat || 0,
            lng: order?.lng || 0,
            itemName: order?.Item_name,
            qty: order?.quantity,
            totalPrice: order?.totalAmount,
            restaurantId: order?.shopId,
            timestamp: new Date(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success("Delivery info saved to database.");
      }
    } catch (error) {
      console.error("Error updating status or saving delivery:", error);
      toast.error("Failed to update status or assign delivery.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/delete/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBookingData((prevData) =>
          prevData.filter((order) => order._id !== orderId)
        );

        Swal.fire("Deleted!", "Order has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting order:", error);
        Swal.fire("Error!", "Failed to delete order.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-[#F85606]";
      case "dispatched": return "bg-purple-500";
      case "delivered": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (loading && bookingData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading orders...</p>
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
                Shop Orders
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage incoming orders
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Orders</span>
            </div>
            <span className="text-white font-bold text-xl">{bookingData.length}</span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {bookingData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 text-sm">Customer orders will appear here</p>
          </div>
        ) : (
          bookingData.map((order) => (
            <div key={order.orderId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Order Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-[#F85606] rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">{order.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-3 border border-orange-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-bold text-[#F85606]">Rs. {order.totalAmount}</p>
                  </div>
                  <div className="text-center border-l border-r border-orange-100">
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="font-bold text-gray-800">{order.quantity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-bold text-gray-800 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedOrder === order.orderId && (
                <div className="border-t border-orange-100">
                  {/* Customer Info */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Customer Details</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                        <span className="text-xs text-gray-500 block">Name</span>
                        <p className="text-sm font-medium text-gray-800">{order.customerName || "N/A"}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                        <span className="text-xs text-gray-500 block">Phone</span>
                        <p className="text-sm font-medium text-gray-800">{order.phone || "N/A"}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                        <span className="text-xs text-gray-500 block">Address</span>
                        <p className="text-sm font-medium text-gray-800">{order.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Item */}
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Order Item</h4>
                    <div className="flex gap-3 bg-orange-50 p-3 rounded-xl border-2 border-orange-200">
                      <img
                        src={order.image || "/default-product.jpg"}
                        alt={order.Item_name || "Product"}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 text-sm mb-1">{order.Item_name}</h5>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <span className="bg-white px-2 py-1 rounded font-medium text-gray-600">Qty: {order.quantity}</span>
                          <span className="bg-white px-2 py-1 rounded font-medium text-gray-600">Unit: Rs.{order.price}</span>
                        </div>
                        <div className="bg-[#F85606] text-white px-2 py-1 rounded-lg inline-block">
                          <span className="text-xs font-bold">Total: Rs.{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  <div className="p-4 bg-gray-50">
                    <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      Assign Driver
                    </h4>
                    <select
                      value={order.assignedDriver || ""}
                      onChange={(e) => {
                        const updatedDriverId = e.target.value;
                        setBookingData((prevData) =>
                          prevData.map((o) =>
                            o.orderId === order.orderId
                              ? { ...o, assignedDriver: updatedDriverId }
                              : o
                          )
                        );
                      }}
                      className="w-full p-3 border-2 border-orange-200 rounded-xl bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F85606]"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.firstName} {driver.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-white space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Update Status
                      </label>
                      <select
                        value={selectedStatus[order.orderId] || order.status}
                        onChange={(e) => {
                          setSelectedStatus(prev => ({
                            ...prev,
                            [order.orderId]: e.target.value
                          }));
                          handleStatusChange(order.orderId, e.target.value);
                        }}
                        className="w-full p-3 border-2 border-orange-200 rounded-xl bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F85606]"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Order
                    </button>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleOrderExpand(order.orderId)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {expandedOrder === order.orderId ? (
                  <>
                    <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Hide Details
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    View Details & Actions
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Mobile Bottom Toast Position */}
      <style>{`
        .go2072408551 {
          bottom: 90px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }
        
        .go685806154 {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}