import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  MdPayment, 
  MdCalendarToday, 
  MdReceipt, 
  MdAttachMoney, 
  MdExpandMore,
  MdSearch,
  MdClear,
  MdFilterList,
  MdAccountBalance,
  MdCreditCard
} from "react-icons/md";

export function AdminPayment() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [amountRange, setAmountRange] = useState("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data || [];
        setPayments(data);
        setFilteredPayments(data);
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

  // Filter and search functionality
  useEffect(() => {
    let results = payments;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(payment =>
        payment.bookingId?.toLowerCase().includes(query) ||
        payment.transactionId?.toLowerCase().includes(query) ||
        payment.paymentType?.toLowerCase().includes(query) ||
        payment.amount?.toString().includes(query) ||
        payment._id?.toLowerCase().includes(query)
      );
    }

    // Apply payment type filter
    if (paymentTypeFilter !== "all") {
      results = results.filter(payment => 
        payment.paymentType?.toLowerCase() === paymentTypeFilter.toLowerCase()
      );
    }

    // Apply amount range filter
    if (amountRange !== "all") {
      results = results.filter(payment => {
        const amount = payment.amount || 0;
        switch (amountRange) {
          case "0-1000":
            return amount <= 1000;
          case "1000-5000":
            return amount > 1000 && amount <= 5000;
          case "5000+":
            return amount > 5000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0);
        case "oldest":
          return new Date(a.paymentDate || 0) - new Date(b.paymentDate || 0);
        case "amount-high":
          return (b.amount || 0) - (a.amount || 0);
        case "amount-low":
          return (a.amount || 0) - (b.amount || 0);
        default:
          return 0;
      }
    });

    setFilteredPayments(results);
  }, [searchQuery, paymentTypeFilter, sortBy, amountRange, payments]);

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
      case 'bank transfer':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return <MdCreditCard className="text-lg" />;
      case 'bank transfer':
        return <MdAccountBalance className="text-lg" />;
      default:
        return <MdPayment className="text-lg" />;
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getPaymentStats = () => {
    const total = payments.length;
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const paymentTypes = [...new Set(payments.map(p => p.paymentType).filter(Boolean))];
    
    return { total, totalRevenue, paymentTypes: paymentTypes.length };
  };

  const paymentStats = getPaymentStats();

  const getUniquePaymentTypes = () => {
    const types = [...new Set(payments.map(p => p.paymentType).filter(Boolean))];
    return types.sort();
  };

  if (loading && payments.length === 0) {
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
    <div className="min-h-screen bg-gradient-to-br  pb-20">
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

          {/* Search Bar */}
          <div className="relative mb-3">
            <div className="relative">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by Booking ID, Transaction ID, Amount, Payment Type..."
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
                <div className="text-white font-bold text-lg">{paymentStats.total}</div>
                <div className="text-orange-100 text-xs">Transactions</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-lg">{paymentStats.paymentTypes}</div>
                <div className="text-orange-100 text-xs">Payment Types</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center">
                <div className="text-white font-bold text-lg">Rs.{paymentStats.totalRevenue.toFixed(0)}</div>
                <div className="text-orange-100 text-xs">Revenue</div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
                >
                  <option value="all" className="text-gray-800">All Types</option>
                  {getUniquePaymentTypes().map(type => (
                    <option key={type} value={type} className="text-gray-800 capitalize">
                      {type}
                    </option>
                  ))}
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

            {/* Amount Range Filter */}
            <div className="relative">
              <select
                value={amountRange}
                onChange={(e) => setAmountRange(e.target.value)}
                className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg py-2 pl-3 pr-8 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-white text-sm appearance-none"
              >
                <option value="all" className="text-gray-800">All Amounts</option>
                <option value="0-1000" className="text-gray-800">Rs. 0 - 1,000</option>
                <option value="1000-5000" className="text-gray-800">Rs. 1,000 - 5,000</option>
                <option value="5000+" className="text-gray-800">Rs. 5,000+</option>
              </select>
              <MdAttachMoney className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
            </div>
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
                  Rs.{paymentStats.totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-green-600 font-medium">All Time</span>
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
                <p className="text-xs text-gray-600 mb-1">Filtered Results</p>
                <p className="text-xl font-bold text-gray-800">{filteredPayments.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-blue-600 font-medium">
                    {filteredPayments.length === payments.length ? 'All' : 'Filtered'}
                  </span>
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
                  {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
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

        {filteredPayments.length === 0 && !searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdPayment className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Yet</h3>
            <p className="text-gray-500 text-sm">Payment records will appear here</p>
          </div>
        ) : filteredPayments.length === 0 && searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdSearch className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Found</h3>
            <p className="text-gray-500 text-sm mb-4">
              No payments found for "{searchQuery}"
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
          filteredPayments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100 hover:shadow-lg transition-shadow duration-200">
              {/* Payment Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-[#F85606] rounded-lg flex items-center justify-center">
                        {getPaymentTypeIcon(payment.paymentType)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">
                          Booking #{payment.bookingId}
                        </h3>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-500 font-mono truncate">
                            TXN: {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 ml-10">
                      <MdCalendarToday className="text-gray-400" />
                      <span>
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-[#F85606] text-white px-3 py-1 rounded-lg">
                      <span className="text-sm font-bold">Rs.{payment.amount?.toFixed(2)}</span>
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
                          <p className="font-bold text-sm text-gray-800 font-mono">{payment.bookingId}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Amount</p>
                          <p className="font-bold text-sm text-[#F85606]">Rs.{payment.amount?.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Payment Type</p>
                          <p className="font-bold text-sm text-gray-800 capitalize">{payment.paymentType || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                          <p className="font-bold text-sm text-gray-800">
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
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

                      {payment._id && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border-2 border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Payment Record ID</p>
                          <p className="font-bold text-sm text-gray-800 font-mono break-all text-xs">{payment._id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => togglePaymentExpand(payment._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-md"
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

        {/* Quick Search Tips */}
        {payments.length > 5 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
            <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <MdSearch className="w-4 h-4 text-purple-600" />
              Search Tips
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <span className="text-purple-600 font-bold">•</span>
                <span>Search by Booking ID</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-600 font-bold">•</span>
                <span>Find by Transaction ID</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-600 font-bold">•</span>
                <span>Filter by payment type</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-600 font-bold">•</span>
                <span>Search by amount</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}