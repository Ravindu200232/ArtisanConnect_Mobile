// shopMessages.jsx - Create this new file in your components folder

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ShopMessages() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const messagesEndRef = useRef(null);
  
  const [shop, setShop] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchShopAndMessages();
  }, [shopId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchShopAndMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch shop details
      const shopRes = await axios.get(
        `${backendUrl}/api/v1/owner/getOne/${shopId}`
      );
      setShop(shopRes.data);

      // Fetch messages
      const messagesRes = await axios.get(
        `${backendUrl}/api/v1/messages/conversation/${shopId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessages(messagesRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/v1/messages/send`,
        {
          shopId,
          message: newMessage.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages([...messages, res.data]);
      setNewMessage("");
      toast.success("Message sent!");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {shop && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">{shop.name}</h1>
                <p className="text-xs text-gray-500">{shop.ownerName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-2">No messages yet</p>
            <p className="text-gray-400 text-sm text-center">Start a conversation with {shop?.name}</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId._id === user?._id || msg.senderId === user?._id;
              return (
                <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwn 
                      ? "bg-orange-500 text-white rounded-br-none" 
                      : "bg-white text-gray-800 shadow-md rounded-bl-none"
                  }`}>
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-orange-100" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center gap-2 max-w-screen-xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}