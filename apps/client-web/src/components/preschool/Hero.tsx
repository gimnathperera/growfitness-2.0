import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import { TbBrandWhatsapp } from "react-icons/tb";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import type { Banner } from "@grow-fitness/shared-types";

interface HeroSectionProps {
  slide: number;
  setSlide: React.Dispatch<React.SetStateAction<number>>;
}

export default function Hero({ slide, setSlide }: HeroSectionProps) {
  const [banners] = useState<Banner[]>([
    { id: '1', imageUrl: '/images/pre-school/DSC00706.jpg' } as Banner,
    { id: '2', imageUrl: '/images/pre-school/1.jpeg' } as Banner,
    { id: '3', imageUrl: '/images/pre-school/DSC00914-2.jpg' } as Banner,
    { id: '4', imageUrl: '/images/pre-school/DSC00991-2.jpg' } as Banner,
    { id: '5', imageUrl: '/images/pre-school/DSC01063-2.jpg' } as Banner,
  ]);
  const [loading] = useState(false);
  
  useEffect(() => {
    const displayBanners = banners.length > 0 ? banners : [{ id: 'default', imageUrl: '/images/kids-jumping.png' } as Banner];
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
        setSlide(prev => (prev + 1) % displayBanners.length);
      }, 8000);
      return () => clearInterval(interval);
    }, [banners.length, setSlide]);
  
    const defaultImage = '/images/kids-jumping.png';
    const displayBanners = banners.length > 0 ? banners : [{ id: 'default', imageUrl: defaultImage } as Banner];
    const total = displayBanners.length;
    const currentBanner = displayBanners[slide];

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--gf-green-deep)" }}
    >
      <img
        src="/images/Grow VI Elements/Icons/Yellow abs.png"
        alt="flower"
        className="absolute w-[360px] opacity-10 pointer-events-none animate-spin-slow"
        style={{ right: -60, top: -80 }}
        loading="lazy"
        decoding="async"
      />
      <img
        src="/images/Grow VI Elements/Icons/Mix abs 2.png"
        alt="mix abs"
        className="absolute w-[240px] opacity-30 pointer-events-none"
        style={{ left: -40, bottom: -20 }}
        loading="lazy"
        decoding="async"
      />
      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-16 sm:pt-20 md:pt-28 grid md:grid-cols-2 gap-8 md:gap-14 items-center relative">
        <div>
          <span
            className="gf-eyebrow inline-block px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "rgba(175,226,125,0.14)", color: "var(--gf-sun)", border: "1px solid var(--gf-sun)" }}
          >
            For Preschool Directors
          </span>

          <h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold uppercase leading-[0.95] tracking-tight text-white"
            style={{
              marginTop: 8,
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
            }}
          >
            If your preschool
            <br />
            says the same
            <br />
            <span style={{ color: "var(--gf-sun)" }}>three things.</span>
          </h2>

          <p
            className="gf-h-display text-2xl sm:text-3xl font-semibold my-8"
            style={{ color: "var(--gf-leaf)" }}
          >
            We give you a fourth.
          </p>

          <p
            className="leading-relaxed text-lg sm:text-xl"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            Grow Fitness runs structured movement programs inside preschools.
            <br />
            Real results, no disruption, one week to prove it.
          </p>
        </div>

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
                      loading="eager"
                      decoding="async"
                      width="600"
                      height="600"
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
                      src="/images/Grow VI Elements/Icons/Cup.png"
                      alt="users"
                      className="w-[60px] h-[60px] object-contain"
                      style={{ color: "#23b685" }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[15px]" style={{ color: "var(--gf-green-deep)" }}>Running since 2023</p>
                    <p className="text-xs" style={{ color: "var(--fg-3)" }}>5+ preschool partners</p>
                  </div>
                </div>
        </div>
      </div>

      {/* Call strip */}
        <div className="mx-auto max-w-[1200px] py-10 pb-20 flex items-center justify-start gap-4 flex-wrap">
          <button 
            onClick={() => window.location.href = '/free-session'}
            className="gf-btn-pop relative" 
            style={{ 
              background: "var(--gf-sun)", 
              color: "var(--gf-green-deep)", 
              boxShadow: "0 6px 0 #c7c400", 
              fontSize: 20, 
              padding: "16px 50px" 
            }}
          >
            Book your first session <ArrowRight size={20} />
          </button>
          <Button
            onClick={() => window.location.href = 'https://wa.me/94770569954'}
            variant="outline"
            className="gf-btn-pop relative bg-transparent text-white hover:text-white"
            style={{ 
              border: "1px solid var(--fg-3)", 
              backgroundColor: "var(--fg-2)",
              fontSize: 18, 
              padding: "32px 40px",
              marginTop: 16
            }}
          >
            <TbBrandWhatsapp style={{ width: 26, height: 26 }} />
            WhatsApp
          </Button>
      </div>
    </section>
  );
}