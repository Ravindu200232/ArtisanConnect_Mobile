import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdMessage, MdEmail, MdPhone, MdDelete, MdSend, MdCheckCircle, MdExpandMore } from "react-icons/md";

export function AdminInquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [responseMap, setResponseMap] = useState({});
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 pb-20">
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
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Inquiries</span>
            </div>
            <span className="text-white font-bold text-xl">{inquiries.length}</span>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="p-4 space-y-3">
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdMessage className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Inquiries Yet</h3>
            <p className="text-gray-500 text-sm">Customer inquiries will appear here</p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Inquiry Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-[#F85606] rounded-lg flex items-center justify-center">
                        <MdEmail className="text-white text-sm" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm truncate">
                        {inq.email}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 ml-10">
                      <MdPhone className="text-gray-400" />
                      <span>{inq.phone || "No phone"}</span>
                    </div>
                    {inq.id && (
                      <div className="text-xs text-gray-500 mt-1 ml-10">
                        ID: {inq.id}
                      </div>
                    )}
                  </div>
                  
                  {inq.response && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                      <MdCheckCircle className="text-sm" />
                      Replied
                    </span>
                  )}
                </div>

                {/* Message Preview */}
                <div className="bg-white rounded-lg p-3 mt-2">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {inq.message}
                  </p>
                </div>
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

                  {/* Response Section */}
                  <div className="p-4 bg-white">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                      <MdSend className="text-[#F85606]" />
                      Your Response
                    </label>
                    <textarea
                      rows={4}
                      className="w-full p-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent bg-orange-50 resize-none text-sm"
                      value={responseMap[inq._id] ?? inq.response ?? ""}
                      onChange={(e) => handleResponseChange(inq._id, e.target.value)}
                      placeholder="Type your response to the customer..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-50 space-y-2">
                    <button
                      onClick={() => handleUpdateResponse(inq._id)}
                      className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      <MdSend className="text-xl" />
                      Send Response
                    </button>

                    <button
                      onClick={() => handleDeleteInquiry(inq._id, inq.email)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
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
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2"
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