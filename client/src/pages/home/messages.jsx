// Updated Messages Component (messages.jsx) - Replace the existing Messages function

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Messages() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      setLoading(false);
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/messages/shop/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setConversations(res.data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to load messages");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-20">
        <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] px-4 py-3">
          <h1 className="text-xl font-bold text-[#212121]">Messages</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 bg-[#FFF5F0] rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#212121] mb-2">Login Required</h3>
          <p className="text-sm text-[#757575] text-center mb-6">
            Please login to view your messages
          </p>
          <Link
            to="/login"
            className="bg-[#F85606] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E04E05] transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] px-4 py-3">
        <h1 className="text-xl font-bold text-[#212121]">Messages</h1>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 bg-[#FFF5F0] rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#212121] mb-2">No messages yet</h3>
          <p className="text-sm text-[#757575] text-center">
            Your conversations with shops will appear here
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {conversations.map((conv) => (
            <Link
              key={`${conv._id.shopId}-${conv._id.senderId}`}
              to={`/messages/${conv._id.shopId}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* Shop Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {conv.shop?.name || 'Shop'}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conv.sender?.firstName} {conv.sender?.lastName}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {conv.lastMessage.message}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 bg-[#F85606] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}