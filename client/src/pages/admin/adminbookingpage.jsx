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
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/orders`, {
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
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/isApprove/${orderId}`,
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
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/delete/${orderId}`, {
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
                Order Dashboard
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage customer orders
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdShoppingCart className="text-2xl text-white" />
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
              <MdShoppingCart className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 text-sm">Customer orders will appear here</p>
          </div>
        ) : (
          bookingData.map((order) => (
            <div key={order.orderId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Order Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-[#F85606] rounded-lg flex items-center justify-center">
                        <MdShoppingCart className="text-white text-sm" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">
                        #{order.orderId}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 ml-10">
                      <MdEmail className="text-gray-400 text-sm" />
                      <span className="truncate">{order.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.isApprove 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {order.isApprove ? "✓ Approved" : "⏳ Pending"}
                    </span>
                    <div className="bg-[#F85606] text-white px-3 py-1 rounded-lg">
                      <span className="text-xs font-bold">Rs. {order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 bg-white rounded-lg p-2 mt-2">
                  <div className="flex items-center gap-1">
                    <MdCalendarToday className="text-[#F85606]" />
                    <span className="font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A"}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-1">
                    <MdAttachMoney className="text-[#F85606]" />
                    <span className="font-medium">Qty: {order.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedOrder === order.orderId && (
                <div className="border-t border-orange-100">
                  {/* Customer Details */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <MdPerson className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Customer Details</h4>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                        <MdPerson className="text-[#F85606] text-lg" />
                        <div className="text-sm">
                          <span className="text-gray-500 text-xs block">Name</span>
                          <span className="text-gray-800 font-medium">{order.customerName || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                        <MdEmail className="text-[#F85606] text-lg" />
                        <div className="text-sm flex-1 min-w-0">
                          <span className="text-gray-500 text-xs block">Email</span>
                          <span className="text-gray-800 font-medium truncate block">{order.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                        <MdPhone className="text-[#F85606] text-lg" />
                        <div className="text-sm">
                          <span className="text-gray-500 text-xs block">Phone</span>
                          <span className="text-gray-800 font-medium">{order.phone || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                        <MdLocationOn className="text-[#F85606] text-lg mt-0.5" />
                        <div className="text-sm flex-1">
                          <span className="text-gray-500 text-xs block">Address</span>
                          <span className="text-gray-800 font-medium">{order.address || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Item */}
                  <div className="p-4 bg-white">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Order Item</h4>
                    <div className="flex gap-3 bg-orange-50 p-3 rounded-xl border-2 border-orange-200">
                      <div className="relative">
                        <img
                          src={order.image || "/default-product.jpg"}
                          alt={order.Item_name || "Product"}
                          className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-sm"
                        />
                        <div className="absolute -top-1 -right-1 bg-[#F85606] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {order.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{order.Item_name}</h5>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <span className="bg-white px-2 py-1 rounded">Unit: Rs.{order.price}</span>
                        </div>
                        <div className="bg-[#F85606] text-white px-2 py-1 rounded-lg inline-block">
                          <span className="text-xs font-bold">Total: Rs.{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 space-y-2">
                    {!order.isApprove && (
                      <button
                        onClick={() => handleApproveOrder(order.orderId, order.email)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                      >
                        <MdCheckCircle className="text-xl" />
                        Approve Order
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteOrder(order._id, order.email)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      <MdDelete className="text-xl" />
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
                    <MdExpandMore className="text-xl transform rotate-180 transition-transform" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <MdExpandMore className="text-xl transition-transform" />
                    View Full Details
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBookingPage;