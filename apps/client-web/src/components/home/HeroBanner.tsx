import React, { useEffect, useState } from 'react';
import type { Banner } from '@grow-fitness/shared-types';

interface HeroBannerProps {
  banners: Banner[];
  loading?: boolean;
  defaultImage?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  loading = false,
  defaultImage = '../../../public/images/heroBanner.jpg'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banners]);

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="h-72 md:h-[32rem] flex items-center justify-center bg-muted animate-pulse">
        <p className="text-white text-lg">Loading banners...</p>
      </div>
    );
  }

  // 🚫 No banners - Show default hero banner
  if (!banners.length) {
    return (
      <div className="relative w-full h-72 md:h-[32rem] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={defaultImage}
            alt="Welcome to GrowFitness"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center h-full bg-black/30 text-center px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Welcome to GrowFitness
            </h1>
            <p className="text-white text-lg md:text-xl mb-6">
              Start your fitness journey with us today and achieve your goals
            </p>
            <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-full transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative h-72 overflow-hidden md:h-[32rem]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.imageUrl || defaultImage}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default image if the banner image fails to load
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full mx-1 transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Prev */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-30 p-2 rounded-full bg-white/40 hover:bg-white/70"
      >
        ‹
      </button>

      {/* Next */}
      <button
        onClick={handleNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 z-30 p-2 rounded-full bg-white/40 hover:bg-white/70"
      >
        ›
      </button>
    </div>
  );
};

export default HeroBanner;
