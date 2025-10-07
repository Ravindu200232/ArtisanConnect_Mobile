import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdPayment, MdCalendarToday, MdReceipt, MdAttachMoney, MdExpandMore } from "react-icons/md";

export function AdminPayment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayments(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch payment records.", {
          position: "bottom-center",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const togglePaymentExpand = (paymentId) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  const getPaymentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit card':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'debit card':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'paypal':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cash':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'online':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading payments...</p>
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
                Payment Records
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Track all transactions
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdPayment className="text-2xl text-white" />
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Payments</span>
            </div>
            <span className="text-white font-bold text-xl">{payments.length}</span>
          </div>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="p-4 pb-0">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-[#F85606]">
                  Rs.{payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-green-600 font-medium">↑ 100%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <MdAttachMoney className="text-white text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Transactions</p>
                <p className="text-xl font-bold text-gray-800">{payments.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-blue-600 font-medium">Total</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MdReceipt className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="p-4 pt-0 space-y-3">
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdPayment className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Yet</h3>
            <p className="text-gray-500 text-sm">Payment records will appear here</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* Payment Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-[#F85606] rounded-lg flex items-center justify-center">
                        <MdReceipt className="text-white text-sm" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">
                        Booking #{payment.bookingId}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 ml-10">
                      <MdCalendarToday className="text-gray-400" />
                      <span>
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-[#F85606] text-white px-3 py-1 rounded-lg">
                      <span className="text-sm font-bold">Rs.{payment.amount.toFixed(2)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPaymentTypeColor(payment.paymentType)}`}>
                      {payment.paymentType || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedPayment === payment._id && (
                <div className="border-t border-orange-100">
                  {/* Payment Details */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <MdPayment className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">Payment Details</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Booking ID</p>
                          <p className="font-bold text-sm text-gray-800">{payment.bookingId}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Amount</p>
                          <p className="font-bold text-sm text-[#F85606]">Rs.{payment.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Payment Type</p>
                          <p className="font-bold text-sm text-gray-800 capitalize">{payment.paymentType || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Date</p>
                          <p className="font-bold text-sm text-gray-800">
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {payment.transactionId && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border-2 border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                          <p className="font-bold text-sm text-gray-800 font-mono break-all">{payment.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => togglePaymentExpand(payment._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {expandedPayment === payment._id ? (
                  <>
                    <MdExpandMore className="text-xl transform rotate-180 transition-transform" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <MdExpandMore className="text-xl transition-transform" />
                    View Payment Details
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