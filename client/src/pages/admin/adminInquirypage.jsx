import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdMessage, MdEmail, MdPhone, MdDelete, MdSend, MdCheckCircle, MdExpandMore, MdSearch, MdClear } from "react-icons/md";

export function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [responseMap, setResponseMap] = useState({});
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inquiry`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInquiries(res.data || []);
      setFilteredInquiries(res.data || []);
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load inquiries",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter inquiries based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInquiries(inquiries);
    } else {
      const filtered = inquiries.filter((inq) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          inq.email?.toLowerCase().includes(searchLower) ||
          inq.phone?.toLowerCase().includes(searchLower) ||
          inq.message?.toLowerCase().includes(searchLower) ||
          inq.response?.toLowerCase().includes(searchLower) ||
          inq.id?.toLowerCase().includes(searchLower) ||
          (inq.response && "replied".includes(searchLower)) ||
          (!inq.response && "pending".includes(searchLower))
        );
      });
      setFilteredInquiries(filtered);
    }
  }, [searchTerm, inquiries]);

  const handleResponseChange = (id, value) => {
    setResponseMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateResponse = async (id) => {
    const token = localStorage.getItem("token");
    const response = responseMap[id];

    if (!response || !response.trim()) {
      Swal.fire({
        title: "Warning",
        text: "Response cannot be empty.",
        icon: "warning",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/inquiry/${id}`,
        { response },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire({
        title: "Success",
        text: "Response sent successfully!",
        icon: "success",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
      fetchInquiries();
      setResponseMap(prev => ({ ...prev, [id]: "" }));
    } catch (error) {
      console.error("Failed to update response", error);
      Swal.fire({
        title: "Error",
        text: "Failed to send response.",
        icon: "error",
        position: "bottom",
        toast: true,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleDeleteInquiry = async (id, email) => {
    const confirmed = await Swal.fire({
      title: "Delete Inquiry?",
      text: `Delete inquiry from ${email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F85606",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      position: "center"
    });

    if (confirmed.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/inquiry/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Swal.fire({
          title: "Deleted!",
          text: "Inquiry has been deleted.",
          icon: "success",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
        fetchInquiries();
      } catch (error) {
        console.error("Failed to delete inquiry", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete inquiry.",
          icon: "error",
          position: "bottom",
          toast: true,
          timer: 3000,
          showConfirmButton: false
        });
      }
    }
  };

  const toggleInquiryExpand = (inquiryId) => {
    setExpandedInquiry(expandedInquiry === inquiryId ? null : inquiryId);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Stats calculation
  const totalInquiries = inquiries.length;
  const repliedInquiries = inquiries.filter(inq => inq.response).length;
  const pendingInquiries = totalInquiries - repliedInquiries;

  useEffect(() => {
    fetchInquiries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] shadow-lg sticky top-0 z-10">
        <div className="p-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Inquiries
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Customer messages & support
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdMessage className="text-2xl text-white" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search inquiries by email, phone, message, response, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-800 pl-10 pr-10 py-3.5 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-white focus:border-white focus:outline-none placeholder-gray-500 text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <MdClear className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium text-sm">Total Inquiries</span>
              </div>
              <span className="text-white font-bold text-xl">{totalInquiries}</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-sm">Showing</span>
              </div>
              <span className="text-white font-bold text-xl">{filteredInquiries.length}</span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Replied</span>
              </div>
              <span className="text-white font-bold text-lg">{repliedInquiries}</span>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Pending</span>
              </div>
              <span className="text-white font-bold text-lg">{pendingInquiries}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="p-4 space-y-3">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchTerm ? (
                <MdSearch className="text-3xl text-[#F85606]" />
              ) : (
                <MdMessage className="text-3xl text-[#F85606]" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? "No Inquiries Found" : "No Inquiries Yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? `No inquiries found for "${searchTerm}". Try different search terms.`
                : "Customer inquiries will appear here once they contact support."
              }
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:shadow-lg transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredInquiries.map((inq) => (
            <div key={inq._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Inquiry Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-[#F85606] rounded-lg flex items-center justify-center">
                        <MdEmail className="text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">
                          {inq.email}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <MdPhone className="text-gray-400" />
                          <span className="truncate">{inq.phone || "No phone provided"}</span>
                        </div>
                      </div>
                    </div>
                    {inq.id && (
                      <div className="text-xs text-gray-500 mt-1 ml-10">
                        ID: {inq.id}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {inq.response ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                        <MdCheckCircle className="text-sm" />
                        Replied
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                        ⏳ Pending
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "Unknown date"}
                    </span>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="bg-white rounded-lg p-3 mt-2 border border-orange-100">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {inq.message}
                  </p>
                </div>

                {/* Quick Status */}
                {inq.response && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <MdCheckCircle className="text-sm" />
                    <span>Response sent</span>
                  </div>
                )}
              </div>

              {/* Expandable Content */}
              {expandedInquiry === inq._id && (
                <div className="border-t border-orange-100">
                  {/* Full Message */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <MdMessage className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Customer Message</h4>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {inq.message}
                      </p>
                    </div>
                  </div>

                  {/* Previous Response (if exists) */}
                  {inq.response && (
                    <div className="p-4 bg-white border-b border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MdCheckCircle className="text-green-500 text-lg" />
                        <h4 className="font-bold text-gray-800 text-sm">Previous Response</h4>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border-2 border-green-200">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {inq.response}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Response Section */}
                  <div className="p-4 bg-white">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                      <MdSend className="text-[#F85606]" />
                      {inq.response ? "Update Response" : "Send Response"}
                    </label>
                    <textarea
                      rows={4}
                      className="w-full p-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-orange-50 resize-none text-sm"
                      value={responseMap[inq._id] ?? ""}
                      onChange={(e) => handleResponseChange(inq._id, e.target.value)}
                      placeholder={inq.response ? "Update your response..." : "Type your response to the customer..."}
                    />
                    {inq.response && (
                      <p className="text-xs text-gray-500 mt-2">
                        Updating will replace the existing response
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 space-y-2">
                    <button
                      onClick={() => handleUpdateResponse(inq._id)}
                      className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                    >
                      <MdSend className="text-xl" />
                      {inq.response ? "Update Response" : "Send Response"}
                    </button>

                    <button
                      onClick={() => handleDeleteInquiry(inq._id, inq.email)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg"
                    >
                      <MdDelete className="text-xl" />
                      Delete Inquiry
                    </button>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleInquiryExpand(inq._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
              >
                {expandedInquiry === inq._id ? (
                  <>
                    <MdExpandMore className="text-xl transform rotate-180 transition-transform" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <MdExpandMore className="text-xl transition-transform" />
                    View & Respond
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}