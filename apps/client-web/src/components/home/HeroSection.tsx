import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Image as ImageIcon, Star } from "lucide-react";
import type { Banner } from '@grow-fitness/shared-types';
import { bannersService } from '@/services/banners.service';


interface HeroSectionProps {
  slide: number;
  setSlide: React.Dispatch<React.SetStateAction<number>>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slide, setSlide }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersService.getBanners(1, 10);
        setBanners(response.data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const displayBanners = banners.length > 0 ? banners : [{ id: 'default', imageUrl: '/images/kids-jumping.png' } as Banner];
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % displayBanners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length, setSlide]);

  const defaultImage = '/images/home/IMG_8014.jpg';
  const displayBanners = banners.length > 0 ? banners : [{ id: 'default', imageUrl: defaultImage } as Banner];
  const total = displayBanners.length;
  const currentBanner = displayBanners[slide];

  return (
  <section className="relative overflow-hidden px-6 md:px-12" style={{ background: "var(--gf-cream)", paddingTop: 88, paddingBottom: 96 }}>
    <img
    src="/images/Grow VI Elements/Icons/Yellow abs.png"
    alt="flower"
    className="absolute w-[360px] opacity-70 pointer-events-none animate-spin-slow"
    style={{ right: -60, top: -80 }}
  />
   <img
    src="/images/Grow VI Elements/Icons/Mix abs 2.png"
    alt="mix abs"
    className="absolute w-[240px] opacity-50 pointer-events-none"
    style={{ left: -40, bottom: -20 }}
   />

    <div className="max-w-[1240px] mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
      {/* Left */}
      <div className="flex flex-col gap-7">
        <div
          className="inline-flex items-center gap-2 rounded-full w-fit px-[18px] py-2"
          style={{ background: "var(--gf-sun)", border: "2px solid var(--gf-green-deep)", boxShadow: "0 4px 0 var(--gf-green-deep)" }}
        >
          <span className="font-bold text-[12px] uppercase tracking-widest" style={{ color: "var(--gf-green-deep)" }}>
            ✦ Sri Lanka's #1 Kids Fitness Program
            <br />
            &nbsp; &nbsp;Since 2023
          </span>
        </div>

        <h1
          className="uppercase"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 6.5vw, 92px)",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            color: "var(--gf-green-deep)",
          }}
        >
          CHILDHOOD
          <br />
          <span style={{ color: "var(--gf-green)" }}>HAPPENED</span>
          <br />
          OUTSIDE.
        </h1>

        <p style={{ fontFamily: "var(--font-alt)", fontWeight: 700, fontSize: 26, lineHeight: 1.2, color: "var(--fg-2)" }}>
          Let's bring it back.
        </p>

        <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--fg-2)", maxWidth: 440 }}>
          Grow Fitness helps kids fall in love with physical activity and
          rebuild the lifelong healthy habits that screens took away.
        </p>

        <div>
          <a
            href="/free-session"
            className="gf-btn-pop text-[17px] px-9 py-[18px]"
            style={{ color: "white", background: "var(--gf-green)", boxShadow: "0 8px 0 var(--gf-green-deep)" }}
          >
            Enroll your child
            <ArrowRight size={18} strokeWidth={2.5} />
          </a>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
            style={{ background: "white", border: "1.5px solid var(--line)", boxShadow: "var(--shadow-1)" }}
          >
            <Star size={20} fill="#243e36" stroke="none" />
            <div>
              <p className="font-bold text-[15px]" style={{ color: "var(--gf-green-deep)" }}>4.9 / 5</p>
              <p className="text-xs" style={{ color: "var(--fg-3)" }}>Parent rating</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
            style={{ background: "white", border: "1.5px solid var(--line)", boxShadow: "var(--shadow-1)" }}
          >
            <img
              src="/images/Grow VI Elements/Icons/Heart.png"
              alt="users"
              className="w-[26px] h-[26px] object-contain"
              style={{ color: "#23b685" }}
            />
            <div>
              <p className="font-bold text-[15px]" style={{ color: "var(--gf-green-deep)" }}>500+</p>
              <p className="text-xs" style={{ color: "var(--fg-3)" }}>Happy kids</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — slideshow */}
      <div className="relative">
        <div
          className="absolute rounded-[36px]"
          style={{ top: 10, left: 10, right: -10, bottom: -10, background: "var(--gf-leaf)", border: "2px solid var(--gf-green-deep)", opacity: 0.4 }}
        />
        <div
          className="absolute rounded-[36px]"
          style={{ top: 5, left: 5, right: -5, bottom: -5, background: "var(--gf-green-100)", border: "2px solid var(--gf-green-deep)", opacity: 0.6 }}
        />

        <div
          className="relative w-full aspect-square rounded-[36px] flex flex-col items-center justify-center gap-4 overflow-hidden"
          style={{ background: "var(--gf-green-100)", border: "2px solid var(--gf-green-deep)" }}
        >

          <div
            className="absolute top-5 right-5 rounded-full px-3.5 py-1.5 z-10"
            style={{ background: "var(--gf-green-deep)" }}
          >
            <p className="font-bold text-[13px] text-white tabular-nums">{slide + 1} / {total}</p>
          </div>

         <button
          onClick={() => setSlide((s) => (s - 1 + total) % total)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center z-10"
          style={{ boxShadow: "var(--shadow-1)" }}
        >
          <span style={{ color: "black" }} className='font-bold text-lg'> 
            <ChevronLeft className="w-4 h-4 font-bold" strokeWidth={2.5} />
          </span>
        </button>

        <button
          onClick={() => setSlide((s) => (s + 1) % total)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center z-10"
          style={{ boxShadow: "var(--shadow-1)" }}
        >
          <span style={{ color: "black" }} className='font-bold text-lg'> 
            <ChevronRight className="w-4 h-4 font-bold" strokeWidth={2.5} />
          </span>
        </button>

          {!loading && currentBanner ? (
            <img
              src={currentBanner.imageUrl || defaultImage}
              alt="hero image"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center relative z-[1]"
                style={{ background: "var(--gf-green)", boxShadow: "0 4px 0 var(--gf-green-deep)" }}
              >
                <ImageIcon size={32} color="white" strokeWidth={2} />
              </div>
              <div className="text-center relative z-[1]">
                <p style={{ fontFamily: "var(--font-alt)", fontWeight: 700, fontSize: 18, color: "var(--gf-green-deep)" }}>
                  {loading ? 'Loading...' : `Hero slideshow — ${total} photos`}
                </p>
                <p className="text-sm mt-1.5" style={{ color: "var(--fg-2)" }}>Real kids. Real sessions. Real energy.</p>
              </div>
            </>
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {displayBanners.map((_, i) => (
              <div
                key={i}
                className="rounded-full border-2"
                style={{
                  width: i === slide ? 24 : 8,
                  height: 8,
                  background: i === slide ? "var(--gf-green)" : "white",
                  border: "1.5px solid var(--gf-green-deep)",
                  borderRadius: i === slide ? 4 : 999,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="absolute rounded-2xl px-5 py-3.5 flex items-center gap-2.5"
          style={{ bottom: -20, left: -20, background: "white", boxShadow: "var(--shadow-pop)", border: "2px solid var(--gf-green-deep)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center">
            <img
              src="/images/Grow VI Elements/Icons/Dumbell.png"
              alt="users"
              className="w-[60px] h-[60px] object-contain"
              style={{ color: "#23b685" }}
            />
          </div>
          <div>
            <p className="font-bold text-[15px]" style={{ color: "var(--gf-green-deep)" }}>Weekly sessions</p>
            <p className="text-xs" style={{ color: "var(--fg-3)" }}>Structured &amp; fun</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

