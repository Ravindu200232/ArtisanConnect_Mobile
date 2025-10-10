import axios from "axios";
import { useEffect, useState } from "react";
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdBlock, MdCheckCircle, MdExpandMore, MdSearch, MdClear } from "react-icons/md";

export default function User() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          user.address?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower) ||
          (user.isBlocked && "blocked".includes(searchLower)) ||
          (!user.isBlocked && "active".includes(searchLower))
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

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

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(user => !user.isBlocked).length;
  const blockedUsers = users.filter(user => user.isBlocked).length;
  const customerUsers = users.filter(user => user.role === 'customer').length;
  const artisanUsers = users.filter(user => user.role === 'artisan').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center p-4">
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
          
          {/* Search Bar */}
          <div className="relative mt-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, phone, address, role, status..."
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
                <span className="text-white font-medium text-sm">Total Users</span>
              </div>
              <span className="text-white font-bold text-xl">{totalUsers}</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-sm">Showing</span>
              </div>
              <span className="text-white font-bold text-xl">{filteredUsers.length}</span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Active</span>
              </div>
              <span className="text-white font-bold text-lg">{activeUsers}</span>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Blocked</span>
              </div>
              <span className="text-white font-bold text-lg">{blockedUsers}</span>
            </div>
          </div>

          {/* Role Stats */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Customers</span>
              </div>
              <span className="text-white font-bold text-lg">{customerUsers}</span>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white font-medium text-xs">Artisans</span>
              </div>
              <span className="text-white font-bold text-lg">{artisanUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center mt-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchTerm ? (
                <MdSearch className="text-3xl text-[#F85606]" />
              ) : (
                <MdPerson className="text-3xl text-[#F85606]" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? "No Users Found" : "No Users Yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? `No users found for "${searchTerm}". Try different search terms.`
                : "User accounts will appear here once they register."
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
          filteredUsers.map((user) => (
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
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`capitalize px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'artisan' 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : user.role === 'admin'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        user.isBlocked 
                          ? "bg-red-100 text-red-700 border-red-200" 
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}>
                        {user.isBlocked ? "🔒 Blocked" : "✓ Active"}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <MdPhone className="text-gray-400" />
                          {user.phone}
                        </span>
                      )}
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
                        <p className={`font-bold text-sm capitalize ${
                          user.role === 'artisan' ? 'text-purple-600' :
                          user.role === 'admin' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {user.role}
                        </p>
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
                      className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2 hover:shadow-lg ${
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
                className="w-full bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white py-3 font-bold text-sm active:opacity-90 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
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