import axios from "axios";
import { useEffect, useState } from "react";
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdBlock, MdCheckCircle, MdExpandMore } from "react-icons/md";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users`,
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
  const handleBlockUser = async (email, isBlocked, userName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/block/${email}`,
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

  const toggleUserExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
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
                Manage user accounts
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
              <MdPerson className="text-2xl text-white" />
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
              <MdPerson className="text-3xl text-[#F85606]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Yet</h3>
            <p className="text-gray-500 text-sm">User accounts will appear here</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
              {/* User Header */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-start gap-3 mb-2">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.image || "/default-profile.png"}
                      alt={user.firstName}
                      className="w-14 h-14 object-cover rounded-full border-2 border-orange-200 shadow-sm"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      user.isBlocked ? "bg-red-500" : "bg-green-500"
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                        {user.firstName} {user.lastName}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <MdEmail className="text-gray-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="capitalize bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {user.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        user.isBlocked 
                          ? "bg-red-100 text-red-700 border-red-200" 
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}>
                        {user.isBlocked ? "🔒 Blocked" : "✓ Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedUser === user._id && (
                <div className="border-t border-orange-100">
                  {/* User Details */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#F85606] rounded-full flex items-center justify-center">
                        <MdPerson className="text-white text-xs" />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">User Details</h4>
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                        <MdPerson className="text-[#F85606] text-lg" />
                        <div className="text-sm">
                          <span className="text-gray-500 text-xs block">Full Name</span>
                          <span className="text-gray-800 font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                        <MdEmail className="text-[#F85606] text-lg" />
                        <div className="text-sm flex-1 min-w-0">
                          <span className="text-gray-500 text-xs block">Email</span>
                          <span className="text-gray-800 font-medium truncate block">{user.email}</span>
                        </div>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg">
                          <MdPhone className="text-[#F85606] text-lg" />
                          <div className="text-sm">
                            <span className="text-gray-500 text-xs block">Phone</span>
                            <span className="text-gray-800 font-medium">{user.phone}</span>
                          </div>
                        </div>
                      )}

                      {user.address && (
                        <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg">
                          <MdLocationOn className="text-[#F85606] text-lg mt-0.5" />
                          <div className="text-sm flex-1">
                            <span className="text-gray-500 text-xs block">Address</span>
                            <span className="text-gray-800 font-medium">{user.address}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">Role</p>
                        <p className="font-bold text-sm text-gray-800 capitalize">{user.role}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-orange-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <p className={`font-bold text-sm ${
                          user.isBlocked ? "text-red-600" : "text-green-600"
                        }`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-white">
                    <button
                      onClick={() => handleBlockUser(user.email, user.isBlocked, `${user.firstName} ${user.lastName}`)}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                        user.isBlocked
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      }`}
                    >
                      {user.isBlocked ? (
                        <>
                          <MdCheckCircle className="text-xl" />
                          Unblock User
                        </>
                      ) : (
                        <>
                          <MdBlock className="text-xl" />
                          Block User
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleUserExpand(user._id)}
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {expandedUser === user._id ? (
                  <>
                    <MdExpandMore className="text-xl transform rotate-180 transition-transform" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <MdExpandMore className="text-xl transition-transform" />
                    View Details & Actions
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