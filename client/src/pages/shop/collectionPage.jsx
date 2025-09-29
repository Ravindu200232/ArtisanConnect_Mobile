import { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CollectionPage() {
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
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
        });
    }
  }, [itemsLoaded, shopId]);

  const handleDelete = (itemId) => {
    const token = localStorage.getItem("token");

    toast(
      (t) => (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-[#B7E892]">
          <span className="text-gray-700 font-semibold">
            Are you sure you want to delete this item?
          </span>
          <div className="mt-3 flex justify-end space-x-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
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
                    setItemsLoaded(false);
                    toast.success("Item deleted successfully!");
                  })
                  .catch((err) => {
                    console.error(err);
                    toast.error("Failed to delete the item.");
                  });
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
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

  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center bg-[#DBF3C9] min-h-screen">
      {/* Header Section with Add Button */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#32CD32] mb-2">
              Collection Management
            </h1>
            <p className="text-gray-600">Manage your shop items and inventory</p>
          </div>
          <Link
            to="/shopC/shop/collection/add"
            state={shopId}
            className="flex items-center gap-2 bg-[#32CD32] hover:bg-[#2DB82D] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            <AiOutlinePlusCircle size={20} />
            Add Item
          </Link>
        </div>
      </div>

      {!itemsLoaded ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-[#32CD32] border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full max-w-6xl">
          {/* Mobile Layout - Card Design */}
          <div className="sm:hidden space-y-4">
            {items.map((product) => (
              <div
                key={product.itemId}
                className="bg-white rounded-xl shadow-md p-4 border border-[#B7E892] hover:shadow-lg transition-all duration-200"
              >
                <div className="flex gap-4">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-20 w-20 object-cover rounded-lg border border-[#93DC5C]"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                      <span className="text-[#32CD32] font-bold">Rs.{product.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="bg-[#DBF3C9] text-[#32CD32] px-2 py-1 rounded-full text-xs font-semibold">
                        {product.category}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.available 
                            ? "bg-[#93DC5C] text-white" 
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {product.available ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigate("/shopC/shop/collection/update", { state: product })}
                    className="flex items-center gap-2 bg-[#93DC5C] hover:bg-[#7ED048] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <FiEdit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Layout - Enhanced Table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl shadow-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#32CD32] text-white">
                  <th className="py-4 px-4 text-left font-semibold">Item ID</th>
                  <th className="py-4 px-4 text-left font-semibold">Image</th>
                  <th className="py-4 px-4 text-left font-semibold">Name</th>
                  <th className="py-4 px-4 text-left font-semibold">Price</th>
                  <th className="py-4 px-4 text-left font-semibold">Category</th>
                  <th className="py-4 px-4 text-left font-semibold">Description</th>
                  <th className="py-4 px-4 text-left font-semibold">Status</th>
                  <th className="py-4 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product, index) => (
                  <tr
                    key={product.itemId}
                    className={`border-b transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#DBF3C9]/30'
                    } hover:bg-[#B7E892]/30`}
                  >
                    <td className="py-4 px-4 text-gray-700 font-medium">
                      #{product.itemId}
                    </td>
                    <td className="py-4 px-4">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-xl border-2 border-[#93DC5C]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{product.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#32CD32] font-bold text-lg">
                        Rs.{product.price}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-[#DBF3C9] text-[#32CD32] px-3 py-1 rounded-full text-sm font-semibold">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs">
                      {product.description}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.available 
                            ? "bg-[#93DC5C] text-white" 
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {product.available ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/shopC/shop/collection/update", { state: product })}
                          className="flex items-center gap-2 bg-[#93DC5C] hover:bg-[#7ED048] text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                        >
                          <FiEdit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                        >
                          <FiTrash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-[#B7E892]">
              <div className="text-[#93DC5C] text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-500 mb-6">Add your first item to start selling</p>
              <Link
                to="/shopC/shop/collection/add"
                state={shopId}
                className="inline-flex items-center gap-2 bg-[#32CD32] hover:bg-[#2DB82D] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <AiOutlinePlusCircle size={20} />
                Add Your First Item
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}