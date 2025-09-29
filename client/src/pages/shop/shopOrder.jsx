import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function ShopOrder() {
  const [bookingData, setBookingData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [ordersResponse, driversResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/v1/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3000/api/v1/driver`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBookingData(ordersResponse.data || []);
        setDrivers(driversResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
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
        `http://localhost:3000/api/v1/orders/status/${orderId}`,
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

        await axios.post(
          `http://localhost:3000/api/v1/delivery`,
          {
            orderId,
            driverId,
            driverName: drivers.find((driver) => driver._id === driverId)?.firstName + " " + drivers.find((driver) => driver._id === driverId)?.lastName || "N/A",
            driverPhone: drivers.find((driver) => driver._id === driverId)?.phone || "N/A",
            status: "picked up",
            driverEmail: drivers.find((driver) => driver._id === driverId)?.email || "N/A",
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
          `http://localhost:3000/api/v1/notification`,
          {
            orderId,
            driverId,
            driverName: drivers.find((driver) => driver._id === driverId)?.firstName + " " + drivers.find((driver) => driver._id === driverId)?.lastName || "N/A",
            driverPhone: drivers.find((driver) => driver._id === driverId)?.phone || "N/A",
            status: "picked up",
            driverEmail: drivers.find((driver) => driver._id === driverId)?.email || "N/A",
            customerEmail: order?.email,
            address: order?.address,
            phone: order?.phone,
            estimatedTime: new Date(Date.now() + 30 * 60 * 1000),
            lat: order?.lat || 0,
            lng: order?.lng || 0,
            itemName: order?.Item_name,
            qty: order?.quantity,
            totalPrice: order?.totalAmount,
            shopId: order?.shopId,
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
          `http://localhost:3000/api/v1/orders/delete/${orderId}`,
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

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-[#32CD32]';
      case 'preparing': return 'bg-blue-500';
      case 'dispatched': return 'bg-purple-500';
      case 'delivered': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#DBF3C9]">
        <div className="w-16 h-16 border-4 border-[#32CD32] border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[#32CD32] mb-2">Order Management</h1>
        <p className="text-gray-600">Manage your shop orders and deliveries</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {bookingData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-[#B7E892]">
            <div className="text-[#93DC5C] text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
            <p className="text-gray-500">Orders will appear here when customers place them</p>
          </div>
        ) : (
          bookingData.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 border-b border-[#B7E892]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-600">{order.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-semibold text-[#32CD32]">Rs.{order.totalAmount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <p>{order.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <p>{order.customerName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              {expandedOrders[order.orderId] && (
                <div className="p-4 bg-[#DBF3C9]/30 border-b border-[#B7E892]">
                  {/* Order Item */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Order Item</h4>
                    <div className="flex gap-3 bg-white p-3 rounded-xl border border-[#93DC5C]">
                      <img
                        src={order.image || "/default-product.jpg"}
                        alt={order.Item_name || "Product"}
                        className="w-16 h-16 object-cover rounded-lg border border-[#93DC5C]"
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">{order.Item_name}</h5>
                        <div className="text-sm text-gray-600">
                          <p>Quantity: {order.quantity}</p>
                          <p>Price: Rs.{order.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Customer Details</h4>
                    <div className="bg-white p-3 rounded-xl border border-[#93DC5C] space-y-1 text-sm">
                      <p><span className="text-gray-500">Phone:</span> {order.phone || "N/A"}</p>
                      <p><span className="text-gray-500">Address:</span> {order.address || "N/A"}</p>
                    </div>
                  </div>

                  {/* Driver Assignment */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Assign Driver</h4>
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
                      className="w-full px-4 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.firstName} {driver.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Status Update */}
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                    className="w-full px-4 py-2 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleOrderDetails(order.orderId)}
                      className="flex-1 bg-[#93DC5C] hover:bg-[#7ED048] text-white py-2 px-4 rounded-xl font-semibold transition-colors text-sm"
                    >
                      {expandedOrders[order.orderId] ? "Hide Details" : "View Details"}
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-semibold transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}