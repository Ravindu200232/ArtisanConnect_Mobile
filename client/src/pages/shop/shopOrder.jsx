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
          axios.get(`https://artisanconnect-backend.onrender.com/api/v1/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://artisanconnect-backend.onrender.com/api/v1/driver`, {
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
        `https://artisanconnect-backend.onrender.com/api/v1/orders/status/${orderId}`,
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
          `https://artisanconnect-backend.onrender.com/api/v1/delivery`,
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
          `https://artisanconnect-backend.onrender.com/api/v1/notification`,
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
          `https://artisanconnect-backend.onrender.com/api/v1/orders/delete/${orderId}`,
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
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "dispatched": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && bookingData.length === 0) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] pb-6">
      {/* Header */}
      <div className="  ">
        <div className="px-4 py-4">
          
         
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {bookingData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          bookingData.map((order) => (
            <div key={order.orderId} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-600">{order.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold">Rs. {order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-semibold">{order.quantity}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>

              {/* Expandable Content */}
              {expandedOrder === order.orderId && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Customer Info */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Name:</span> {order.customerName || "N/A"}</p>
                      <p><span className="text-gray-600">Phone:</span> {order.phone || "N/A"}</p>
                      <p><span className="text-gray-600">Address:</span> {order.address || "N/A"}</p>
                    </div>
                  </div>

                  {/* Order Item */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Order Item</h4>
                    <div className="flex gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <img
                        src={order.image || "/default-product.jpg"}
                        alt={order.Item_name || "Product"}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{order.Item_name}</h5>
                        <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
                        <p className="text-sm text-green-600 font-semibold">Rs. {order.price}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Assign Driver</h4>
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
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
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
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium text-sm active:bg-red-600 transition-colors"
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleOrderExpand(order.orderId)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-medium text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedOrder === order.orderId ? (
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

      {/* Bottom Spacer */}
      <div className="h-4"></div>
    </div>
  );
}