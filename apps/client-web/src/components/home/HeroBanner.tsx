import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Dumbbell } from "lucide-react";
import type { Banner } from "@grow-fitness/shared-types";

interface HeroBannerProps {
  banners: Banner[];
  loading?: boolean;
  defaultImage?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  banners,
  loading = false,
  defaultImage = "/images/heroBanner.jpg",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(
      () => setCurrentIndex((i) => (i + 1) % banners.length),
      10000
    );
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="h-[90vh] flex items-center justify-center bg-muted animate-pulse">
        <p className="text-white text-lg">Loading banners...</p>
      </div>
    );
  }

  const slides = banners.length ? banners : [{ id: "default", imageUrl: defaultImage }];

  return (
    <section className="relative min-h-[90vh] md:min-h-screen overflow-hidden pt-28">
      {/* Slides */}
      {slides.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={banner.imageUrl || defaultImage}
            className="w-full h-full object-cover"
            alt="Grow Fitness Banner"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(145,80%,10%)]/90 via-[hsl(142,72%,29%)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(145,80%,10%)]/50 via-transparent to-[hsl(145,80%,10%)]/30" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-2">
            <Dumbbell className="h-4 w-4 text-[hsl(142,69%,58%)]" />
            <span className="text-white/90 text-sm font-medium">
              Sri Lanka&apos;s #1 Kids Fitness Program
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Where Kids{" "}
            <span className="text-[hsl(142,69%,58%)]">Grow</span>
            <br />
            Stronger & Happier
          </h1>

          <p className="text-white/80 text-lg max-w-lg">
            Fun, safe, and expertly coached fitness programs that build
            confidence, coordination, and lifelong healthy habits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button size="lg" className="font-bold shadow-lg">
              Enroll Your Child
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20"
            >
              Explore Programs
            </Button>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroBanner;
