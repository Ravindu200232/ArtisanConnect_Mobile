import axios from "axios";
import { useEffect, useState } from "react";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle Block/Unblock User
  const handleBlockUser = async (email, isBlocked) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/block/${email}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === email ? { ...user, isBlocked: !isBlocked } : user
        )
      );
    } catch (error) {
      console.log("Error updating user status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F85606] font-semibold text-lg">Loading users...</p>
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
                User Management
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Manage user accounts & access
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium text-sm">Total Users</span>
            </div>
            <span className="text-white font-bold text-xl">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Found</h3>
            <p className="text-gray-500 text-sm">User accounts will appear here</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* User Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={user.image || "/default-profile.png"}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-200 shadow-sm"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      user.isBlocked ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-orange-100 text-[#F85606] rounded text-xs font-bold border border-orange-200">
                        {user.role}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {user.isBlocked ? '🔒 Blocked' : '✓ Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-bold">Phone</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{user.phone || "N/A"}</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <div className="flex items-start gap-2 mb-1">
                      <svg className="w-4 h-4 text-[#F85606] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <span className="text-xs text-gray-500 font-bold block">Address</span>
                        <p className="text-sm font-medium text-gray-800">{user.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-gray-50 border-t border-orange-100">
                <button
                  onClick={() => handleBlockUser(user.email, user.isBlocked)}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                    user.isBlocked
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                >
                  {user.isBlocked ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Unblock User
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Block User
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Bottom Toast Position */}
      <style>{`
        .Toastify__toast-container {
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }
        
        .Toastify__toast {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* React Hot Toast Styles */
        .go2072408551 {
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 2rem) !important;
          max-width: 400px !important;
        }

        .go685806154 {
          border-radius: 12px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          padding: 16px 20px !important;
          font-size: 14px !important;
        }

        /* Success Toast */
        .go685806154[data-type="success"] {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: white !important;
        }

        /* Error Toast */
        .go685806154[data-type="error"] {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}