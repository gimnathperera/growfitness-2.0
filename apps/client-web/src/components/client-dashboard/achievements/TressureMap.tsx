"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const badges = [
  { id: 1, title: "Mystic Cat", img: "/badges/cat.png", earned: true },
  { id: 2, title: "Wizard", img: "/badges/wizard.png", earned: true },
  { id: 3, title: "Dragon", img: "/badges/dragon.png", earned: false },
  { id: 4, title: "Crystal Ball", img: "/badges/crystal.png", earned: false },
  { id: 5, title: "Enchanted Book", img: "/badges/book.png", earned: false },
];

export function BadgeMap() {
  return (
    <Card className="w-full max-w-5xl mx-auto bg-white text-[#243E36] shadow-sm border border-[#23B685]/20 p-4 sm:p-6">
      <CardHeader>
        <CardTitle className="text-center text-xl sm:text-2xl font-bold text-[#243E36]">
          🗺️ Badge Journey
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-6 md:gap-0">
          {/* SVG line - only visible on md and up */}
          <svg
            className="hidden md:block absolute top-1/2 left-0 w-full h-2 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#23B685" />
                <stop offset="100%" stopColor="#23B685" />
              </linearGradient>
            </defs>
          </svg>

          {/* Badges */}
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`relative z-10 flex flex-col items-center transition-all duration-300 ${
                badge.earned ? "scale-105" : "opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md border-2 ${
                  badge.earned
                    ? "border-[#23B685] bg-[#23B685]/10"
                    : "border-gray-300 bg-gray-100"
                }`}
              >
                <img
                  src={badge.img}
                  alt={badge.title}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-[#243E36] text-center">
                {badge.title}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}