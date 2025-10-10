import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CustomerConversation() {
  const { customerId, shopId } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [shop, setShop] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesIntervalRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!shopId || !customerId) return;

    fetchConversation();

    messagesIntervalRef.current = setInterval(() => {
      fetchConversation(true);
    }, 3000);

    return () => {
      if (messagesIntervalRef.current) {
        clearInterval(messagesIntervalRef.current);
      }
    };
  }, [shopId, customerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async (silent = false) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendUrl}/api/v1/messages/customer/${customerId}/shop/${shopId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newMessages = res.data.messages || [];

      if (silent && newMessages.length > messages.length) {
        const lastMessage = newMessages[newMessages.length - 1];

        if (!lastMessage.isOwnMessage) {
          toast.success(`New message from ${shop?.name || "Shop"}`, {
            duration: 3000,
            icon: "💬",
          });
        }
      }

      setMessages(newMessages);
      setShop(res.data.shop);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      if (!silent && err.response?.status !== 404) {
        toast.error("Failed to load conversation");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/v1/messages/send`,
        {
          shopId,
          message: newMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) return "Now";
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#F85606] to-[#FF7420] px-4 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/my-messages")}
            className="p-2 text-white hover:text-orange-100 rounded-full hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md">
              {shop?.images?.[0] ? (
                <img src={shop.images[0]} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#F85606] font-bold text-lg">{shop?.name?.charAt(0).toUpperCase() || "S"}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white text-base truncate">{shop?.name || "Shop"}</h1>
              <p className="text-xs text-orange-100 truncate">Active now</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => fetchConversation(false)} className="p-2 text-white hover:text-orange-100 rounded-full hover:bg-orange-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 text-white hover:text-orange-100 rounded-full hover:bg-orange-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-orange-50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#F85606]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-600 mb-2">Start the conversation with {shop?.name}</p>
            <p className="text-xs text-gray-500">Send a message to get started</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {messages.map((message) => {
              const isOwnMessage = message.isOwnMessage || 
                                  (message.sender && message.sender._id === user.id) ||
                                  message.displaySide === "right";

              return (
                <div key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwnMessage
                        ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-orange-200"
                    }`}
                  >
                    {!isOwnMessage && message.sender?.name && (
                      <p className="text-xs font-semibold text-[#F85606] mb-1">{message.sender.name}</p>
                    )}

                    <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    
                    <div className={`flex justify-end mt-2 gap-1 items-center text-xs ${isOwnMessage ? "text-orange-100" : "text-gray-500"}`}>
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {isOwnMessage && <span>{message.isRead ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white border-t border-orange-200 p-4 shadow-lg">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button className="p-2.5 text-gray-500 hover:text-[#F85606] rounded-full hover:bg-orange-50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button className="p-2.5 text-gray-500 hover:text-[#F85606] rounded-full hover:bg-orange-50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <form onSubmit={sendMessage} className="flex-1 flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-orange-50 text-gray-800 placeholder-gray-500 px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-[#F85606] focus:border-transparent transition-all"
              disabled={sending}
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full transition-all ${
                newMessage.trim()
                  ? "bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white hover:shadow-lg hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}