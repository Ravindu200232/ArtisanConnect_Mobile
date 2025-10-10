import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiMoreVertical } from "react-icons/fi";
import { IoSend } from "react-icons/io5";

export default function ChatWindow({ 
  selectedConversation, 
  messages, 
  messageLoading, 
  onSendMessage, 
  onBack,
  currentUserId 
}) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await onSendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-orange-100 m-4">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] px-4 py-4 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="md:hidden text-white hover:text-orange-50 p-2 mr-2 rounded-full hover:bg-orange-500 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <img
            src={selectedConversation.sender?.image || "/default-avatar.png"}
            alt={selectedConversation.sender?.firstName || "Customer"}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          
          <div className="ml-3">
            <h2 className="text-white font-semibold text-lg">
              {selectedConversation.sender?.firstName} {selectedConversation.sender?.lastName}
            </h2>
            <p className="text-orange-100 text-sm">
              {selectedConversation.shop?.name || "Shop"} • {selectedConversation.sender?.role || "Customer"}
            </p>
          </div>
        </div>

        <button className="text-white hover:text-orange-50 p-2 rounded-full hover:bg-orange-500 transition-colors">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50 to-orange-100 p-6">
        {messageLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="w-6 h-6 border-2 border-[#F85606] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#F85606]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-2">No messages yet</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              Start a conversation with {selectedConversation.sender?.firstName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              // Determine if this is the current user's message
              const isOwnMessage = message.isOwnMessage || 
                                  (message.sender && message.sender._id === currentUserId) ||
                                  message.displaySide === 'right';
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-orange-200'
                    }`}
                  >
                    {!isOwnMessage && message.sender?.name && (
                      <p className="text-xs font-semibold text-[#F85606] mb-1">
                        {message.sender.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    <div className={`text-xs mt-2 flex items-center gap-1 ${
                      isOwnMessage ? 'text-orange-100 justify-end' : 'text-gray-500 justify-end'
                    }`}>
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {isOwnMessage && (
                        <span className="text-xs">
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
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
      <div className="bg-white p-4 border-t border-orange-200 rounded-b-lg">
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-[#F85606] p-2 rounded-full hover:bg-orange-50 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/>
            </svg>
          </button>
          
          <div className="flex-1 bg-orange-50 rounded-lg border border-orange-200 focus-within:border-[#F85606] focus-within:ring-2 focus-within:ring-orange-100 transition-colors">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              className="w-full bg-transparent text-gray-800 placeholder-gray-500 resize-none border-none focus:ring-0 focus:outline-none py-3 px-4 max-h-32"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white hover:shadow-lg hover:scale-105'
                : 'text-gray-400 cursor-not-allowed bg-gray-200'
            }`}
          >
            <IoSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}