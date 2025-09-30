import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdMessage, MdEmail, MdPhone, MdDelete, MdSend } from "react-icons/md";

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
      Swal.fire("Error", "Failed to load inquiries", "error");
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
      Swal.fire("Warning", "Response cannot be empty.", "warning");
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
      Swal.fire("Success", "Response sent successfully!", "success");
      fetchInquiries();
      setResponseMap(prev => ({ ...prev, [id]: "" }));
    } catch (error) {
      console.error("Failed to update response", error);
      Swal.fire("Error", "Failed to send response.", "error");
    }
  };

  const handleDeleteInquiry = async (id, email) => {
    const confirmed = await Swal.fire({
      title: "Delete Inquiry?",
      text: `Delete inquiry from ${email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
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
        Swal.fire("Deleted!", "Inquiry has been deleted.", "success");
        fetchInquiries();
      } catch (error) {
        console.error("Failed to delete inquiry", error);
        Swal.fire("Error", "Failed to delete inquiry.", "error");
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
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Customer Inquiries
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage customer messages and responses
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{inquiries.length} inquiries</span>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdMessage className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No inquiries found</p>
            <p className="text-sm text-gray-400 mt-1">Customer inquiries will appear here</p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq._id} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Inquiry Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate flex items-center gap-2">
                      <MdEmail className="text-[#32CD32]" />
                      {inq.email}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MdPhone className="text-gray-400" />
                      <span>{inq.phone || "No phone provided"}</span>
                    </div>
                    {inq.id && (
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {inq.id}
                      </div>
                    )}
                  </div>
                  {inq.response && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Replied
                    </span>
                  )}
                </div>

                {/* Preview Message */}
                <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                  {inq.message}
                </p>
              </div>

              {/* Expandable Content */}
              {expandedInquiry === inq._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Full Message */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <MdMessage className="text-[#32CD32]" />
                      Customer Message
                    </h4>
                    <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
                      {inq.message}
                    </div>
                  </div>

                  {/* Response Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Response
                    </label>
                    <textarea
                      rows={4}
                      className="w-full p-3 border border-[#93DC5C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#32CD32] bg-white resize-none"
                      value={responseMap[inq._id] ?? inq.response ?? ""}
                      onChange={(e) => handleResponseChange(inq._id, e.target.value)}
                      placeholder="Type your response to the customer..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateResponse(inq._id)}
                      className="bg-[#32CD32] text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-[#2DB82D] flex items-center justify-center gap-2"
                    >
                      <MdSend className="text-lg" />
                      Send Response
                    </button>

                    <button
                      onClick={() => handleDeleteInquiry(inq._id, inq.email)}
                      className="bg-red-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
                    >
                      <MdDelete className="text-lg" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleInquiryExpand(inq._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedInquiry === inq._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Details & Respond
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