import React from "react";
import { FiRefreshCw } from "react-icons/fi";

export default function ConversationsList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  onRefresh,
  currentUserId 
}) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return "No messages yet";
    
    const message = conversation.lastMessage.message;
    const senderId = conversation.lastMessage.senderId;
    
    // Check if the current user sent the last message
    const isOwnMessage = senderId && senderId.toString() === currentUserId;
    
    const preview = message.length > 35 ? message.substring(0, 35) + "..." : message;
    
    if (isOwnMessage) {
      return `You: ${preview}`;
    }
    
    return preview;
  };

  return (
    <div className="h-full bg-white flex flex-col rounded-lg shadow-sm border border-orange-100 m-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F85606] to-[#FF7420] px-4 py-4 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center">
          <img
            src={JSON.parse(localStorage.getItem("user") || "{}").image || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <div className="ml-3">
            <h2 className="text-white font-semibold text-lg">Messages</h2>
            <p className="text-orange-100 text-xs">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="text-white hover:text-orange-50 p-2 rounded-full hover:bg-orange-500 transition-colors"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-orange-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white text-gray-800 pl-10 pr-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-[#F85606] focus:border-[#F85606] focus:outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#F85606]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-2">No Conversations</h3>
            <p className="text-gray-600 text-sm">
              When customers message your shop, conversations will appear here.
            </p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={`${conversation._id.shopId}-${conversation._id.senderId}`}
              className={`flex items-center p-4 cursor-pointer border-b border-orange-100 hover:bg-orange-50 transition-colors ${
                selectedConversation?._id.senderId === conversation._id.senderId && 
                selectedConversation?._id.shopId === conversation._id.shopId
                  ? 'bg-orange-50 border-l-4 border-l-[#F85606]'
                  : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              {/* Customer Avatar */}
              <div className="relative">
                <img
                  src={conversation.sender?.image || "/default-avatar.png"}
                  alt={conversation.sender?.firstName || "Customer"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                />
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#F85606] to-[#FF7420] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-gray-800 font-semibold truncate">
                    {conversation.sender?.firstName} {conversation.sender?.lastName}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-sm truncate">
                    {getLastMessagePreview(conversation)}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <div className="w-2 h-2 bg-gradient-to-r from-[#F85606] to-[#FF7420] rounded-full ml-2 flex-shrink-0"></div>
                  )}
                </div>
                
                {/* Shop Info */}
                <p className="text-[#F85606] text-xs mt-1 truncate font-medium">
                  {conversation.shop?.name || "Shop"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}