import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CustomerMessages() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  
  const previousUnreadCountRef = useRef(0);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    setUser(JSON.parse(storedUser));
    
    // Create notification sound
    notificationSoundRef.current = new Audio('https://notificationsounds.com/soundfiles/9b8619251a19057cff70779273e95aa6/file-sounds-1150-pristine.mp3');
    
    fetchCustomerConversations();

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => fetchCustomerConversations(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update page title with unread count
  useEffect(() => {
    if (totalUnreadCount > 0) {
      document.title = `(${totalUnreadCount}) New Messages - Shop`;
    } else {
      document.title = 'Messages - Shop';
    }
  }, [totalUnreadCount]);

  const showNotification = (title, body, icon) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/notification-icon.png',
        badge: '/badge-icon.png',
        tag: 'new-message',
      });

      if (notificationSoundRef.current) {
        notificationSoundRef.current.play().catch(err => console.log('Sound play failed'));
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  const fetchCustomerConversations = async (silent = false) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/messages/customer/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newConversations = res.data || [];
      
      // Calculate total unread count
      const newUnreadCount = newConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      
      // Check for new messages during silent update
      if (silent && newUnreadCount > previousUnreadCountRef.current) {
        const conversationsWithNewMessages = newConversations.filter(conv => conv.unreadCount > 0);
        
        if (conversationsWithNewMessages.length > 0) {
          const firstConv = conversationsWithNewMessages[0];
          const shopName = firstConv.shop?.name || 'Shop';
          const lastMessage = firstConv.lastMessage?.message || 'New message';
          
          showNotification(
            `New message from ${shopName}`,
            lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage,
            firstConv.shop?.images?.[0]
          );
          
          toast.success(`New message from ${shopName}`, {
            duration: 4000,
            icon: '💬',
          });
        }
      }
      
      previousUnreadCountRef.current = newUnreadCount;
      setTotalUnreadCount(newUnreadCount);
      setConversations(newConversations);
    } catch (err) {
      console.error("Error fetching customer conversations:", err);
      if (!silent && err.response?.status !== 401) {
        toast.error("Failed to load messages");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }

    const message = conversation.lastMessage.message;
    const senderId = conversation.lastMessage.senderId;
    const isOwnMessage = senderId && senderId.toString() === user.id;
    const preview = message.length > 35 ? message.substring(0, 35) + "..." : message;

    if (isOwnMessage) {
      return `You: ${preview}`;
    } else {
      const ownerName = conversation.owner?.firstName || conversation.shop?.ownerName?.split(" ")[0] || "Shop";
      return `${ownerName}: ${preview}`;
    }
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name.charAt(0).toUpperCase();
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.owner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.owner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="sticky top-0 z-30 bg-gradient-to-r from-[#F85606] to-[#FF7420] px-4 py-4 shadow-lg">
          <h1 className="text-xl font-semibold text-white">Messages</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-sm text-gray-600 text-center mb-6">Please login to view your messages</p>
          <Link to="/login" className="bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 relative">
      {/* Unread Badge */}
      {totalUnreadCount > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="font-bold">{totalUnreadCount} new</span>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#F85606] to-[#FF7420] px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <img
                src={user.image || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=F85606&color=fff`}
                alt={user.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">My Messages</h1>
              <p className="text-orange-100 text-xs">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchCustomerConversations(false)} className="text-white hover:text-orange-100 p-2 rounded-full hover:bg-orange-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-orange-200 pl-10 pr-4 py-2.5 rounded-lg border border-orange-400/30 focus:outline-none focus:border-white/50 focus:bg-white/30 text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="p-4">
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No conversations</h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm ? "No results found" : "Start chatting with shops to see conversations here"}
            </p>
            {!searchTerm && (
              <Link to="/" className="inline-block bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                Browse Shops →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <Link
                key={conv.shopId}
                to={`/messages/customer/${user.id}/shop/${conv.shopId}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-orange-100 hover:border-[#F85606]"
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Shop Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-orange-200">
                      {conv.shop?.images?.[0] ? (
                        <img src={conv.shop.images[0]} alt={conv.shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xl">{getInitials(conv.shop?.name)}</span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">{conv.shop?.name || "Shop"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {conv.owner?.firstName ? `${conv.owner.firstName} ${conv.owner.lastName}` : conv.shop?.ownerName || "Shop Owner"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatTime(conv.lastMessage?.createdAt)}</span>
                    </div>

                    <p className="text-sm text-gray-600 truncate leading-tight mt-1">{getLastMessagePreview(conv)}</p>
                    
                    {conv.unreadCount > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-[#F85606] rounded-full animate-pulse"></div>
                        <span className="text-xs text-[#F85606] font-semibold">New messages</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Floating Button */}
      <Link
        to="/"
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-full flex items-center justify-center shadow-2xl hover:shadow-orange-400/50 hover:scale-110 transition-all duration-200 z-40"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}