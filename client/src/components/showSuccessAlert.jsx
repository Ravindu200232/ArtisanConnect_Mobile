// components/AlertNotification.jsx
import Swal from "sweetalert2";

export const showSuccessAlert = (title, text, timer = 2000) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    timer,
    showConfirmButton: false,
    position: "top",
    background: "#f0fdf4",
    color: "#065f46",
    iconColor: "#10b981",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-green-200",
      title: "text-green-800 font-bold text-lg",
      htmlContainer: "text-green-700"
    }
  });
};

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    background: "#fef2f2",
    color: "#7f1d1d",
    iconColor: "#ef4444",
    confirmButtonText: "OK",
    confirmButtonColor: "#ef4444",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-red-200",
      title: "text-red-800 font-bold text-lg",
      htmlContainer: "text-red-700",
      confirmButton: "rounded-xl font-bold px-6 py-2"
    }
  });
};

export const showConfirmationAlert = (title, text, confirmText = "Yes", cancelText = "No") => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#6b7280",
    background: "#fffbeb",
    color: "#92400e",
    iconColor: "#f59e0b",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-amber-200",
      title: "text-amber-800 font-bold text-lg",
      htmlContainer: "text-amber-700",
      confirmButton: "rounded-xl font-bold px-6 py-2",
      cancelButton: "rounded-xl font-bold px-6 py-2"
    }
  });
};

export const showLoadingAlert = (title, text) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    background: "#f0f9ff",
    color: "#0c4a6e",
    customClass: {
      popup: "rounded-2xl shadow-2xl border-2 border-blue-200",
      title: "text-blue-800 font-bold text-lg",
      htmlContainer: "text-blue-700"
    }
  });
};

// Custom availability toggle alert
export const showAvailabilityAlert = (isAvailable) => {
  return Swal.fire({
    title: isAvailable ? "🎉 You're Available!" : "⏸️ You're Offline",
    text: isAvailable 
      ? "You will now receive delivery requests and orders" 
      : "You won't receive new delivery requests",
    icon: isAvailable ? "success" : "info",
    timer: 2500,
    showConfirmButton: false,
    position: "top",
    background: isAvailable ? "#f0fdf4" : "#f8fafc",
    color: isAvailable ? "#065f46" : "#374151",
    iconColor: isAvailable ? "#10b981" : "#6b7280",
    customClass: {
      popup: `rounded-2xl shadow-2xl border-2 ${isAvailable ? 'border-green-200' : 'border-gray-200'}`,
      title: `${isAvailable ? 'text-green-800' : 'text-gray-800'} font-bold text-lg`,
      htmlContainer: `${isAvailable ? 'text-green-700' : 'text-gray-600'}`
    }
  });
};

// Custom notification alert
export const showNotificationAlert = (title, message, type = "info") => {
  const config = {
    info: {
      background: "#f0f9ff",
      color: "#0c4a6e",
      iconColor: "#3b82f6",
      border: "border-blue-200",
      textColor: "text-blue-800"
    },
    warning: {
      background: "#fffbeb",
      color: "#92400e",
      iconColor: "#f59e0b",
      border: "border-amber-200",
      textColor: "text-amber-800"
    },
    success: {
      background: "#f0fdf4",
      color: "#065f46",
      iconColor: "#10b981",
      border: "border-green-200",
      textColor: "text-green-800"
    },
    error: {
      background: "#fef2f2",
      color: "#7f1d1d",
      iconColor: "#ef4444",
      border: "border-red-200",
      textColor: "text-red-800"
    }
  };

  const { background, color, iconColor, border, textColor } = config[type];

  return Swal.fire({
    title,
    text: message,
    icon: type,
    timer: 3000,
    showConfirmButton: false,
    position: "top",
    background,
    color,
    iconColor,
    customClass: {
      popup: `rounded-2xl shadow-2xl border-2 ${border}`,
      title: `${textColor} font-bold text-lg`,
      htmlContainer: `${textColor} opacity-80`
    }
  });
};