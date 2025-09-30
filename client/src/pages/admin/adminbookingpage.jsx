import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { MdShoppingCart, MdEmail, MdPhone, MdLocationOn, MdPerson, MdCalendarToday, MdAttachMoney, MdCheckCircle, MdDelete, MdExpandMore } from "react-icons/md";

const AdminBookingPage = () => {
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`https://artisanconnect-backend.onrender.com/api/v1/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookingData(response.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, []);

  const handleApproveOrder = async (orderId, orderEmail) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `https://artisanconnect-backend.onrender.com/api/v1/orders/isApprove/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookingData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId ? { ...order, isApprove: true } : order
        )
      );

      toast.success(`Order ${orderId} approved successfully`);
    } catch (error) {
      console.error("Error approving order:", error);
      toast.error("Failed to approve order");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderEmail) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      text: `Delete order ${orderId} from ${orderEmail}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axios.delete(`https://artisanconnect-backend.onrender.com/api/v1/orders/delete/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

  if (loading) {
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
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Order Management
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage and approve customer orders
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{bookingData.length} orders total</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {bookingData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdShoppingCart className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Customer orders will appear here</p>
          </div>
        ) : (
          bookingData.map((order) => (
            <div key={order.orderId} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MdShoppingCart className="text-[#32CD32]" />
                      Order #{order.orderId}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MdEmail className="text-gray-400" />
                      <span className="truncate">{order.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.isApprove ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.isApprove ? "Approved" : "Pending"}
                    </span>
                    <span className="text-sm font-semibold text-[#32CD32]">
                      Rs. {order.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <MdCalendarToday className="text-gray-400" />
                    <span>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdAttachMoney className="text-gray-400" />
                    <span>Qty: {order.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedOrder === order.orderId && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Customer Details */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <MdPerson className="text-[#32CD32]" />
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdPerson className="text-gray-400" />
                        <span><strong>Name:</strong> {order.customerName || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdEmail className="text-gray-400" />
                        <span><strong>Email:</strong> {order.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdPhone className="text-gray-400" />
                        <span><strong>Phone:</strong> {order.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MdLocationOn className="text-gray-400 mt-0.5" />
                        <span><strong>Address:</strong> {order.address || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Item */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Order Item</h4>
                    <div className="flex gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <img
                        src={order.image || "/default-product.jpg"}
                        alt={order.Item_name || "Product"}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-[#B7E892]"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{order.Item_name}</h5>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Qty: {order.quantity}</span>
                          <span>Price: Rs.{order.price}</span>
                        </div>
                        <div className="text-sm font-semibold text-[#32CD32] mt-1">
                          Total: Rs.{order.totalAmount}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {!order.isApprove && (
                      <button
                        onClick={() => handleApproveOrder(order.orderId, order.email)}
                        className="bg-[#32CD32] text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-[#2DB82D] flex items-center justify-center gap-2"
                      >
                        <MdCheckCircle className="text-lg" />
                        Approve Order
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteOrder(order._id, order.email)}
                      className="bg-red-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <MdDelete className="text-lg" />
                      Delete Order
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleOrderExpand(order.orderId)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
};

export default AdminBookingPage;