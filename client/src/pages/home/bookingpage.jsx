import { useEffect, useState, useRef } from "react";
import { LoadCart } from "../../utils/card";
import BookingItem from "../../components/bookingitem";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const GOOGLE_MAPS_API_KEY = "AIzaSyCMMHWV8VSCEoqws7_Rh2Crea_rSPvv1t0";

export function BookingPage() {
  const [cart, setCart] = useState(LoadCart());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items
  const mapRef = useRef(null);
  const [formData, setFormData] = useState({
    address: "",
    lat: "",
    lng: "",
  });

  const navigate = useNavigate();

  // Shipping fee: Rs. 250 if total is under Rs. 599
  const shippingFee = total < 599 && total > 0 ? 250 : 0;
  const finalTotal = total + shippingFee;

  function reloadCart() {
    const updatedCart = LoadCart();
    setCart(updatedCart);
    
    // Remove items from selection that are no longer in cart
    const updatedSelectedItems = new Set(selectedItems);
    const cartItemKeys = new Set(updatedCart.orderItem?.map(item => item.key) || []);
    
    updatedSelectedItems.forEach(key => {
      if (!cartItemKeys.has(key)) {
        updatedSelectedItems.delete(key);
      }
    });
    
    setSelectedItems(updatedSelectedItems);
    calculateTotal(updatedSelectedItems, updatedCart);
  }

  function calculateTotal(selectedItemsSet = selectedItems, cartData = cart) {
    if (selectedItemsSet.size === 0) {
      setTotal(0);
      return;
    }

    const selectedCartItems = {
      orderItem: cartData.orderItem?.filter(item => selectedItemsSet.has(item.key)) || []
    };

    axios
      .post(`https://artisanconnect-backend.onrender.com/api/v1/orders/quote`, selectedCartItems)
      .then((res) => {
        setTotal(res.data.total);
      })
      .catch((err) => {
        console.log(err);
        setTotal(0);
      });
  }

  useEffect(() => {
    // Auto-select all items when cart loads
    const initialCart = LoadCart();
    const allItemKeys = new Set(initialCart.orderItem?.map(item => item.key) || []);
    setSelectedItems(allItemKeys);
    calculateTotal(allItemKeys, initialCart);
    loadUserLocation();
  }, []);

  const loadUserLocation = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.address) {
      setFormData({
        address: user.address,
        lat: user.lat || "",
        lng: user.lng || "",
      });
    }
  };

  // Handle individual item selection
  const handleItemSelect = (itemKey, isSelected) => {
    const updatedSelectedItems = new Set(selectedItems);
    
    if (isSelected) {
      updatedSelectedItems.add(itemKey);
    } else {
      updatedSelectedItems.delete(itemKey);
    }
    
    setSelectedItems(updatedSelectedItems);
    calculateTotal(updatedSelectedItems);
  };

  // Handle select all/deselect all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allItemKeys = new Set(cart.orderItem?.map(item => item.key) || []);
      setSelectedItems(allItemKeys);
      calculateTotal(allItemKeys);
    } else {
      setSelectedItems(new Set());
      setTotal(0);
    }
  };

  const loadGoogleMapsScript = () => {
    const existingScript = document.getElementById("googleMapsScript");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "googleMapsScript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  const initMap = (lat, lng) => {
    if (!window.google || !mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
    });

    new window.google.maps.Marker({
      position: { lat, lng },
      map,
      title: "Delivery Location",
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire(
        "Error",
        "Geolocation is not supported by your browser.",
        "error"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const location = res.data?.display_name || "";
          setFormData({
            address: location,
            lat: latitude.toString(),
            lng: longitude.toString(),
          });

          toast.success("Location fetched successfully!");
          initMap(latitude, longitude);
        } catch (err) {
          console.error("Reverse geocoding failed", err);
          toast.error("Failed to fetch location details.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to access your location.");
      }
    );
  };

  const handleUpdateLocation = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      toast.error("User not logged in");
      return;
    }

    try {
      const updateData = {
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
      };

      await axios.put(
        `https://artisanconnect-backend.onrender.com/api/v1/users/update/${user.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = { ...user, ...updateData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Location updated successfully!");
      setShowLocationSection(false);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update location.");
    }
  };

  function handleBookingCreation() {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to proceed!");
      return;
    }

    if (!formData.address) {
      toast.error("Please set your delivery address first!");
      setShowLocationSection(true);
      return;
    }

    setLoading(true);
    const selectedCartItems = {
      orderItem: cart.orderItem?.filter(item => selectedItems.has(item.key)) || []
    };
    
    const token = localStorage.getItem("token");

    axios
      .post(`https://artisanconnect-backend.onrender.com/api/v1/orders`, selectedCartItems, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const sendData = res.data.orders;
        
        // Remove only selected items from cart
        const updatedCart = LoadCart();
        const remainingItems = updatedCart.orderItem?.filter(item => !selectedItems.has(item.key)) || [];
        
        if (remainingItems.length === 0) {
          localStorage.removeItem("cart");
        } else {
          localStorage.setItem("cart", JSON.stringify({ orderItem: remainingItems }));
        }
        
        toast.success("Order placed successfully!");
        setCart(LoadCart());
        setSelectedItems(new Set()); // Clear selection
        
        if (res.data) {
          navigate("/bookingconfirmation", {
            state: { sendData },
          });
        } else {
          toast.error("Invalid booking details received.");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Please login to continue");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Check if all items are selected
  const isAllSelected = cart.orderItem?.length > 0 && 
    selectedItems.size === cart.orderItem.length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-56">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E0E0E0] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-[#212121]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#212121]">My Cart</h1>
          </div>
          <button className="w-9 h-9 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#212121]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="bg-white">
        {cart.orderItem?.length > 0 ? (
          <div>
            {cart.orderItem.map((item, index) => (
              <div key={item.key}>
                <BookingItem
                  itemKey={item.key}
                  qty={item.qty}
                  refresh={reloadCart}
                  isSelected={selectedItems.has(item.key)}
                  onSelectChange={handleItemSelect}
                />
                {index < cart.orderItem.length - 1 && (
                  <div className="border-b border-[#F5F5F5]"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#F5F5F5] rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#9E9E9E]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">
              Your cart is empty
            </h3>
            <p className="text-[#757575] text-sm mb-6">
              Add items to get started
            </p>
            <button
              onClick={() => navigate("/product")}
              className="bg-[#F85606] hover:bg-[#E85000] text-white px-8 py-3 rounded font-semibold"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>

      {/* Voucher Section */}
      {cart.orderItem?.length > 0 && (
        <div className="bg-white mt-2 px-4 py-3">
          <div className="flex items-center justify-between border border-[#F85606] rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#F85606] text-white px-2 py-1 rounded text-xs font-bold">
                VOUCHER
              </div>
              <span className="text-sm text-[#212121] font-medium">
                Exclusive Voucher for you!
              </span>
            </div>
            <button className="text-[#F85606] text-sm font-bold">
              Collect
            </button>
          </div>
        </div>
      )}

      {/* Shipping Discount Info */}
      {cart.orderItem?.length > 0 && total < 599 && selectedItems.size > 0 && (
        <div className="bg-white mt-2 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <svg
              className="w-5 h-5 text-[#F85606]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
            </svg>
            <span className="text-[#212121]">
              Buy{" "}
              <span className="font-bold">Rs. {(599 - total).toFixed(0)}</span>{" "}
              more to get <span className="font-bold text-[#0ABF53]">FREE</span>{" "}
              shipping (Save Rs. 250)
            </span>
          </div>
        </div>
      )}

      {/* Delivery Address Section */}
      {cart.orderItem?.length > 0 && selectedItems.size > 0 && (
        <div className="bg-white mt-2 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#212121]">
              Delivery Address
            </h3>
            <button
              className="text-[#F85606] text-sm font-semibold"
              onClick={() => {
                setShowLocationSection(!showLocationSection);
                if (!showLocationSection) {
                  loadGoogleMapsScript();
                }
              }}
            >
              {showLocationSection ? "Hide" : "Change"}
            </button>
          </div>

          {formData.address ? (
            <div className="flex items-start gap-3 bg-[#F9F9F9] p-3 rounded-lg border border-[#E0E0E0]">
              <svg
                className="w-5 h-5 text-[#F85606] flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm text-[#212121] flex-1">
                {formData.address}
              </p>
            </div>
          ) : (
            <div className="bg-[#FFF5F0] border border-[#F85606] rounded-lg p-3">
              <p className="text-sm text-[#F85606] font-medium">
                Please set your delivery address
              </p>
            </div>
          )}

          {/* Location Update Section */}
          {showLocationSection && (
            <div className="mt-4 border-t border-[#E0E0E0] pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={getLocation}
                  className="flex-1 bg-[#F85606] hover:bg-[#E85000] text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Use Current Location
                </button>
                <button
                  onClick={handleUpdateLocation}
                  className="flex-1 bg-[#0ABF53] hover:bg-[#00A844] text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Save Location
                </button>
              </div>

              {/* Map Container */}
              <div
                ref={mapRef}
                className="w-full h-64 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0]"
              ></div>

              {/* Manual Address Input */}
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter delivery address manually..."
                className="w-full mt-4 border border-[#E0E0E0] p-3 rounded text-sm resize-none focus:outline-none focus:border-[#F85606]"
                rows="3"
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Bar - Positioned above home navbar */}
      {cart.orderItem?.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-[#E0E0E0] z-20">
          {/* Summary Section */}
          <div className="px-4 py-3 border-b border-[#F5F5F5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-[#F85606]" 
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="text-sm text-[#212121] font-medium">All</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#757575]">
                  Subtotal ({selectedItems.size} items):{" "}
                  <span className="text-[#212121] font-bold">
                    Rs. {total.toFixed(0)}
                  </span>
                </div>
                <div className="text-xs text-[#757575]">
                  Shipping Fee:{" "}
                  <span
                    className={`font-bold ${
                      shippingFee === 0 ? "text-[#0ABF53]" : "text-[#F85606]"
                    }`}
                  >
                    {shippingFee === 0 ? "FREE" : `Rs. ${shippingFee}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 flex gap-3">
            <button
              onClick={handleBookingCreation}
              disabled={loading || selectedItems.size === 0}
              className="flex-1 bg-[#FFC839] hover:bg-[#FFB800] disabled:bg-[#CCCCCC] text-white py-3 rounded font-bold text-base transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Place Order Rs. ${finalTotal.toFixed(0)}`
              )}
            </button>

            <button
              onClick={handleBookingCreation}
              disabled={loading || selectedItems.size === 0}
              className="flex-1 bg-[#F85606] hover:bg-[#E85000] disabled:bg-[#CCCCCC] text-white py-3 rounded font-bold text-base transition-colors"
            >
              Check Out({selectedItems.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}