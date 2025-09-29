import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ShopDetails() {

   const { id } = useParams();
  console.log("hisaddddddddddd", id);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [shop, setShop] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchShop = async () => {
      if (!id) return setLoading(false);

      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/owner/getOne/${id}`
        );
        setShop(res.data);
        console.log(res.data);

        const collRes = await axios.get(
          `http://localhost:3000/api/v1/collection/getAll/${id}`
        );
        setCollections(collRes.data || []);
        console.log(collRes);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load shop or collections.");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  useEffect(() => {
    if (!shop?.images?.length) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === shop.images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [shop]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!shop)
    return <p className="text-center mt-10 text-red-500">shop not found.</p>;

  return (
    <div className="min-h-screen bg-primary text-primary py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* shop Info */}
        <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-100 p-6 rounded-xl shadow-md mb-8">
          <div className="relative w-full md:w-[400px] h-[400px] overflow-hidden rounded-lg">
            <img
              src={shop.images?.[currentImageIndex] || "/default-shop.jpg"}
              alt={shop.name}
              className="w-full h-full object-cover transition-opacity duration-1000"
            />
            {shop.images?.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {shop.images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full ${
                      idx === currentImageIndex ? "bg-primary" : "bg-gray-300"
                    }`}
                  ></span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <p className="text-sm">
              Owned by: <strong>{shop.ownerName}</strong>
            </p>
            <p className="text-sm">📍 {shop.address}</p>
            <p className="text-sm">📞 {shop.phone}</p>
            <p>{shop.description}</p>
          </div>
        </div>

        {/* Collections (Food Items) */}
        {collections.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Dishes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {collections.map((item) => (
                <Link key={item._id} to={`/product/${item._id}`}>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden border hover:shadow-lg transition">
                    <img
                      src={item.images?.[0] || "/default-food.jpg"}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-primary">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <p className="text-sm font-medium mt-2 text-primary">
                        Price: ₹{parseFloat(item.price).toFixed(2)}
                      </p>
                      {item.available ? (
                        <span className="inline-block mt-2 text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="inline-block mt-2 text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No food items found for this shop.</p>
        )}
      </div>
    </div>
  );
}
