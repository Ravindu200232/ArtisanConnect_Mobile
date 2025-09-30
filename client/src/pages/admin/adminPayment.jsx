import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdPayment, MdCalendarToday, MdReceipt, MdAttachMoney } from "react-icons/md";

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
        toast.error("Failed to fetch payment records.");
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
        return 'bg-blue-100 text-blue-800';
      case 'debit card':
        return 'bg-purple-100 text-purple-800';
      case 'paypal':
        return 'bg-blue-100 text-blue-800';
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'online':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Payment Records
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage and view all payment transactions
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{payments.length} payments total</span>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-3 border border-[#B7E892] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-[#32CD32]">
                Rs.{payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MdAttachMoney className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-[#B7E892] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Transactions</p>
              <p className="text-lg font-bold text-gray-800">{payments.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MdReceipt className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdPayment className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No payments found</p>
            <p className="text-sm text-gray-400 mt-1">Payment records will appear here</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Payment Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MdReceipt className="text-[#32CD32]" />
                      Booking #{payment.bookingId}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MdCalendarToday className="text-gray-400" />
                      <span>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-bold text-[#32CD32]">
                      Rs.{payment.amount.toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.paymentType)}`}>
                      {payment.paymentType || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedPayment === payment._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Payment Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Booking ID</p>
                        <p className="font-semibold text-gray-800">{payment.bookingId}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Amount</p>
                        <p className="font-semibold text-[#32CD32]">Rs.{payment.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Payment Type</p>
                        <p className="font-semibold text-gray-800 capitalize">{payment.paymentType || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600">Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Additional payment details can be added here */}
                    {payment.transactionId && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                        <p className="text-gray-600">Transaction ID</p>
                        <p className="font-semibold text-gray-800 font-mono">{payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => togglePaymentExpand(payment._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedPayment === payment._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Payment Details
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