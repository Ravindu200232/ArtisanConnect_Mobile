import { useState, useEffect } from "react";

export default function ImageSlider(props) {
  const images = props.images;
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect - changes image every 3 seconds
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        setSelectedImage(images[newIndex]);
        return newIndex;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images]);

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  return (
    <div className="w-full bg-white">
      {/* Main Image Container */}
      <div className="relative w-full h-[400px] bg-white flex items-center justify-center">
        <img
          src={selectedImage}
          alt="product"
          className="w-full h-full object-contain"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg border border-[#E0E0E0] transition-all"
            >
              <svg className="w-5 h-5 text-[#212121]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg border border-[#E0E0E0] transition-all"
            >
              <svg className="w-5 h-5 text-[#212121]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1}/{images.length}
        </div>
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center items-center gap-2 py-3 bg-white">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(images[index], index)}
              className={`transition-all ${
                index === currentIndex
                  ? "w-6 h-2 bg-[#F85606] rounded-full"
                  : "w-2 h-2 bg-[#CCCCCC] rounded-full hover:bg-[#F85606]/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="w-full px-4 py-3 bg-white border-t border-[#F5F5F5]">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(image, index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-[#F85606] shadow-md"
                    : "border-[#E0E0E0] hover:border-[#F85606]/50"
                }`}
              >
                <img
                  src={image}
                  alt={`thumbnail-${index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}