import axios from "axios";
import { useEffect, useState } from "react";
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdBlock, MdCheckCircle } from "react-icons/md";

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
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          User Management
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage user accounts and permissions
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{users.length} users total</span>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdPerson className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">User accounts will appear here</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* User Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <img
                    src={user.image || "/default-profile.png"}
                    alt={user.firstName}
                    className="w-12 h-12 object-cover rounded-full border-2 border-[#B7E892]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <MdEmail className="text-gray-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="capitalize bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedUser === user._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* User Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MdPerson className="text-gray-400" />
                      <div>
                        <p className="text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MdEmail className="text-gray-400" />
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdPhone className="text-gray-400" />
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-800">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {user.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MdLocationOn className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Address</p>
                          <p className="font-semibold text-gray-800">{user.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Status Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">Role</p>
                        <p className="font-semibold text-gray-800 capitalize">{user.role}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">Status</p>
                        <p className={`font-semibold ${
                          user.isBlocked ? "text-red-600" : "text-green-600"
                        }`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleBlockUser(user.email, user.isBlocked, `${user.firstName} ${user.lastName}`)}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        user.isBlocked
                          ? "bg-[#32CD32] text-white active:bg-[#2DB82D]"
                          : "bg-red-500 text-white active:bg-red-600"
                      }`}
                    >
                      {user.isBlocked ? (
                        <>
                          <MdCheckCircle className="text-lg" />
                          Unblock User
                        </>
                      ) : (
                        <>
                          <MdBlock className="text-lg" />
                          Block User
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleUserExpand(user._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedUser === user._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Details & Actions
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