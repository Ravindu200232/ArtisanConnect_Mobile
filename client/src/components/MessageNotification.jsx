import React from 'react';
import { toast } from 'react-hot-toast';

export const showMessageNotification = (senderName, message, onClick) => {
  toast.custom(
    (t) => (
      <div
        onClick={() => {
          onClick && onClick();
          toast.dismiss(t.id);
        }}
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer hover:shadow-xl transition-shadow`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {senderName}
              </p>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  );
};