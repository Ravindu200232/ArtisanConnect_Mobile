import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ConversationsList from "./ConversationsList";
import ChatWindow from "./ChatWindow";

export default function ShopOwnerMessages() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Refs for polling intervals
  const conversationsIntervalRef = useRef(null);
  const messagesIntervalRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const previousUnreadCountRef = useRef(0);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
    
    // Create notification sound
    notificationSoundRef.current = new Audio('https://notificationsounds.com/soundfiles/9b8619251a19057cff70779273e95aa6/file-sounds-1150-pristine.mp3');
    
    return () => {
      // Cleanup intervals on unmount
      if (conversationsIntervalRef.current) {
        clearInterval(conversationsIntervalRef.current);
      }
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchConversations();
    
    // Poll conversations every 5 seconds
    conversationsIntervalRef.current = setInterval(() => {
      fetchConversations(true); // Silent refresh
    }, 5000);

    return () => {
      if (conversationsIntervalRef.current) {
        clearInterval(conversationsIntervalRef.current);
      }
    };
  }, []);

  // Poll messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Clear existing interval
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }

      // Poll messages every 3 seconds
      messagesIntervalRef.current = setInterval(() => {
        if (selectedConversation._id && selectedConversation._id.shopId && selectedConversation._id.senderId) {
          loadMessages(selectedConversation._id.shopId, selectedConversation._id.senderId, true);
        }
      }, 3000);
    } else {
      // Clear interval when no conversation is selected
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    }

    return () => {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const showNotification = (title, body, icon) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/notification-icon.png',
        badge: '/badge-icon.png',
        tag: 'new-message',
        requireInteraction: false,
      });

      // Play notification sound
      if (notificationSoundRef.current) {
        notificationSoundRef.current.play().catch(err => console.log('Sound play failed:', err));
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  const fetchConversations = async (silent = false) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/messages/shop/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newConversations = res.data || [];
      
      // Calculate total unread count
      const newUnreadCount = newConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      
      // Check for new messages
      if (silent && newUnreadCount > previousUnreadCountRef.current) {
        const unreadDiff = newUnreadCount - previousUnreadCountRef.current;
        
        // Find conversations with new messages
        const conversationsWithNewMessages = newConversations.filter(conv => conv.unreadCount > 0);
        
        if (conversationsWithNewMessages.length > 0) {
          const firstConv = conversationsWithNewMessages[0];
          const senderName = `${firstConv.sender?.firstName || ''} ${firstConv.sender?.lastName || ''}`.trim();
          const lastMessage = firstConv.lastMessage?.message || 'New message';
          
          // Show browser notification
          showNotification(
            `New message from ${senderName}`,
            lastMessage.length > 50 ? lastMessage.substring(0, 50) + '...' : lastMessage,
            firstConv.sender?.image
          );
          
          // Show toast notification
          toast.success(`New message from ${senderName}`, {
            duration: 4000,
            icon: '💬',
          });
        }
      }
      
      previousUnreadCountRef.current = newUnreadCount;
      setTotalUnreadCount(newUnreadCount);
      setConversations(newConversations);
      
      // Auto-select first conversation if none selected and not silent
      if (!silent && newConversations.length > 0 && !selectedConversation) {
        selectConversation(newConversations[0]);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (!silent) {
        if (err.response?.status === 401) {
          toast.error("Please login again");
          navigate("/login");
        } else {
          toast.error("Failed to load conversations");
        }
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadMessages = async (shopId, customerId, silent = false) => {
    if (!silent) {
      setMessageLoading(true);
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/messages/shop/${shopId}/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const newMessages = res.data.messages || [];
      
      // If silent update and new messages, check if there are actually new ones
      if (silent && newMessages.length > messages.length) {
        const lastMessage = newMessages[newMessages.length - 1];
        
        // Only show notification if the new message is from the other user
        if (!lastMessage.isOwnMessage) {
          const senderName = lastMessage.sender?.name || 'Customer';
          
          // Show toast for new message in current conversation
          toast.success(`${senderName}: ${lastMessage.message}`, {
            duration: 3000,
            icon: '💬',
          });
        }
      }
      
      setMessages(newMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
      if (!silent) {
        toast.error("Failed to load messages");
      }
    } finally {
      if (!silent) {
        setMessageLoading(false);
      }
    }
  };

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
    if (conv._id && conv._id.shopId && conv._id.senderId) {
      loadMessages(conv._id.shopId, conv._id.senderId);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedConversation) return false;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/v1/messages/send`,
        {
          shopId: selectedConversation._id.shopId,
          receiverId: selectedConversation._id.senderId,
          message: messageText.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newMessageObj = res.data;
      setMessages(prev => [...prev, newMessageObj]);

      // Update conversations list with the new last message
      setConversations(prev => 
        prev.map(conv => 
          conv._id.senderId === selectedConversation._id.senderId && 
          conv._id.shopId === selectedConversation._id.shopId
            ? { 
                ...conv, 
                lastMessage: {
                  _id: newMessageObj._id,
                  message: newMessageObj.message,
                  createdAt: newMessageObj.createdAt,
                  senderId: newMessageObj.sender._id,
                  senderType: newMessageObj.sender.type
                }
              }
            : conv
        )
      );

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex relative">
      {/* Unread Badge - Floating notification */}
      {totalUnreadCount > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="font-bold">{totalUnreadCount} new message{totalUnreadCount !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-orange-200 ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <ConversationsList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={selectConversation}
          onRefresh={() => fetchConversations(false)}
          currentUserId={user.id}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 ${!selectedConversation ? 'hidden md:block' : 'block'}`}>
        {selectedConversation ? (
          <ChatWindow
            selectedConversation={selectedConversation}
            messages={messages}
            messageLoading={messageLoading}
            onSendMessage={sendMessage}
            onBack={() => setSelectedConversation(null)}
            currentUserId={user.id}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-orange-100 m-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#F85606]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
              </div>
              <h3 className="text-gray-800 text-xl font-semibold mb-2">Your Messages</h3>
              <p className="text-gray-600 text-sm max-w-xs">
                {conversations.length === 0 
                  ? "No customer conversations yet. When customers message your shop, they will appear here."
                  : "Select a conversation to start messaging"
                }
              </p>
              {conversations.length === 0 && (
                <button
                  onClick={() => navigate('/shopC/shop')}
                  className="mt-4 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Manage Your Shop
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}