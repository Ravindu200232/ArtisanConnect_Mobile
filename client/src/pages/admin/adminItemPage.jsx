import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MdFastfood, MdCategory, MdDescription, MdInventory } from "react-icons/md";

export default function AdminItemPage() {
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state;

  useEffect(() => {
    if (!itemsLoaded && shopId) {
      const token = localStorage.getItem("token");
      axios
        .get(`http://localhost:3000/api/v1/collection/getAll/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setItems(res.data);
          setItemsLoaded(true);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load items");
        });
    }
  }, [itemsLoaded, shopId]);

  const handleDelete = (itemId, itemName) => {
    const token = localStorage.getItem("token");

    toast(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <p className="text-gray-800 font-semibold mb-3">
            Delete "{itemName}"?
          </p>
          <p className="text-gray-600 text-sm mb-4">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                axios
                  .delete(`http://localhost:3000/api/v1/collection/delete/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  .then(() => {
                    setItems((prev) => prev.filter((item) => item._id !== itemId));
                    toast.success("Item deleted successfully!");
                  })
                  .catch((err) => {
                    console.error(err);
                    toast.error("Failed to delete the item.");
                  });
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  const handleApprove = (collectionId, itemName) => {
    const token = localStorage.getItem("token");
    axios
      .post(`http://localhost:3000/api/v1/collection/isApprove/${collectionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success(`"${itemName}" approved successfully!`);
        setItemsLoaded(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to approve the item.");
      });
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  if (!itemsLoaded) {
    return (
      <div className="min-h-screen bg-[#DBF3C9] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#32CD32] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#32CD32] font-medium">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DBF3C9] p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#B7E892] mb-4">
        <h1 className="text-xl font-bold text-[#32CD32] text-center mb-2">
          Collection Management
        </h1>
        <p className="text-gray-600 text-center text-sm">
          Manage shop items and approvals
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600">{items.length} items total</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#B7E892] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdFastfood className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">No items found</p>
            <p className="text-sm text-gray-400 mt-1">Items will appear here once added</p>
          </div>
        ) : (
          items.map((product) => (
            <div key={product.itemId} className="bg-white rounded-2xl shadow-lg border border-[#B7E892] overflow-hidden">
              {/* Item Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <img
                    src={product.images?.[0] || "/default-food.jpg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-[#B7E892]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-800 truncate">{product.name}</h3>
                      <div className="flex items-center gap-1">
                        {product.approve && (
                          <FiCheckCircle className="text-green-500 text-lg" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {product.available ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-[#32CD32]">Rs. {product.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>ID: {product.itemId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {expandedItem === product._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {/* Item Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MdCategory className="text-gray-400" />
                      <span className="text-gray-700 capitalize">{product.category}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <MdDescription className="text-gray-400 mt-0.5" />
                      <p className="text-gray-700 flex-1">{product.description}</p>
                    </div>

                    {/* Status Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">Stock</p>
                        <p className={`font-semibold ${
                          product.available ? "text-green-600" : "text-red-500"
                        }`}>
                          {product.available ? "Available" : "Out of Stock"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600">Approval</p>
                        <p className={`font-semibold ${
                          product.approve ? "text-green-600" : "text-yellow-500"
                        }`}>
                          {product.approve ? "Approved" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!product.approve && (
                      <button
                        onClick={() => handleApprove(product._id, product.name)}
                        className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-[#2DB82D] flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle className="text-lg" />
                        Approve Item
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate("/admin/item/edit", { state: product })}
                        className="bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-blue-600 flex items-center justify-center gap-2"
                      >
                        <FiEdit className="text-lg" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="bg-red-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <FiTrash2 className="text-lg" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => toggleItemExpand(product._id)}
                  className="w-full bg-[#32CD32] text-white py-3 rounded-lg font-semibold text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  {expandedItem === product._id ? (
                    <>
                      <span>▲</span>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <span>▼</span>
                      View Details & Actions
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}