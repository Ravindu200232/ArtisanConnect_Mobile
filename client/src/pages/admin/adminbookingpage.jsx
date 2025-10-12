import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { 
  MdShoppingCart, 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdPerson, 
  MdCalendarToday, 
  MdAttachMoney, 
  MdCheckCircle, 
  MdDelete, 
  MdExpandMore,
  MdSearch,
  MdClear,
  MdFilterList
} from "react-icons/md";

const AdminBookingPage = () => {
  const [bookingData, setBookingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, amount-high, amount-low

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data || [];
        setBookingData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let results = bookingData;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(order =>
        order.orderId?.toLowerCase().includes(query) ||
        order.email?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query) ||
        order.address?.toLowerCase().includes(query) ||
        order.Item_name?.toLowerCase().includes(query) ||
        order.totalAmount?.toString().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(order => 
        statusFilter === "pending" ? !order.isApprove : order.isApprove
      );
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "amount-high":
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case "amount-low":
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

    setFilteredData(results);
  }, [searchQuery, statusFilter, sortBy, bookingData]);

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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getStatusStats = () => {
    const total = bookingData.length;
    const approved = bookingData.filter(order => order.isApprove).length;
    const pending = total - approved;
    return { total, approved, pending };
  };

  const statusStats = getStatusStats();

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
    <div className="min-h-screen bg-gradient-to-br  pb-20">
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

          {/* Search Bar */}
          <div className="relative mb-3">
            <div className="relative">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search orders by ID, email, name, phone, address, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white rounded-xl border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent text-gray-800 placeholder-gray-500 font-medium text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClear className="text-xl" />
                </button>
              )}
            </div>
          </div>

          {/* Filters and Stats */}
          <div className="space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-lg">{statusStats.total}</div>
                <div className="text-orange-100 text-xs">Total</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-lg">{statusStats.pending}</div>
                <div className="text-orange-100 text-xs">Pending</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-lg">{statusStats.approved}</div>
                <div className="text-orange-100 text-xs">Approved</div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
                >
                  <option value="all" className="text-gray-800">All Status</option>
                  <option value="pending" className="text-gray-800">Pending</option>
                  <option value="approved" className="text-gray-800">Approved</option>
                </select>
                <MdFilterList className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
                >
                  <option value="newest" className="text-gray-800">Newest First</option>
                  <option value="oldest" className="text-gray-800">Oldest First</option>
                  <option value="amount-high" className="text-gray-800">Amount: High to Low</option>
                  <option value="amount-low" className="text-gray-800">Amount: Low to High</option>
                </select>
                <MdFilterList className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdSearch className="w-4 h-4 text-[#F85606]" />
                <span className="text-sm font-medium text-gray-700">
                  Search results for: "{searchQuery}"
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-100 text-[#F85606] px-2 py-1 rounded">
                  {filteredData.length} order{filteredData.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearSearch}
                  className="text-xs bg-orange-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <MdClear size={12} />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredData.length === 0 && !searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdShoppingCart className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 text-sm">Customer orders will appear here</p>
          </div>
        ) : filteredData.length === 0 && searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdSearch className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-500 text-sm mb-4">
              No orders found for "{searchQuery}"
            </p>
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
            >
              <MdClear size={18} />
              Clear Search
            </button>
          </div>
        ) : (
          filteredData.map((order) => (
            <div key={order.orderId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100 hover:shadow-lg transition-shadow duration-200">
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
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "N/A"}
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
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80x80/f97316/white?text=No+Image";
                          }}
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
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                      >
                        <MdCheckCircle className="text-xl" />
                        Approve Order
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteOrder(order._id, order.email)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
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
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-md"
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

        {/* Quick Search Tips */}
        {bookingData.length > 5 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
            <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <MdSearch className="w-4 h-4 text-blue-600" />
              Search Tips
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">•</span>
                <span>Search by Order ID</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">•</span>
                <span>Filter by customer email</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">•</span>
                <span>Find by product name</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">•</span>
                <span>Search phone numbers</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingPage;