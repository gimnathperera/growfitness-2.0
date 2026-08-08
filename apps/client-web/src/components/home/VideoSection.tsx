import React from 'react';

export const VideoSection: React.FC = () => (
  <section className="relative overflow-hidden px-6 md:px-12 py-24" style={{ background: "var(--gf-cream)" }}>
    <img src="/images/Grow VI Elements/Icons/Mix abs 2.png" alt='Personal' className="absolute w-[200px] opacity-30 pointer-events-none" style={{ left: -20, bottom: -20 }} loading="lazy" decoding="async" />

    <div className="max-w-[1240px] mx-auto relative z-10">
      <div className="text-center mb-13">
        <p className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "var(--gf-green)" }}>See it in action</p>
        <h2 className="uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px,5vw,64px)", lineHeight: 0.92, color: "var(--gf-green-deep)" }}>
          How sessions happen
        </h2>
      </div>

      <div
        className="relative mt-10 mx-auto w-full max-w-[900px] aspect-video rounded-[32px] overflow-hidden"
        style={{ border: "2px solid var(--gf-green-deep)", boxShadow: "var(--shadow-pop)" }}
      >
        <video
          src="/images/home/final.mp4"
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="w-full h-full object-cover rounded-[32px]"
        />
      </div>
      <p className="text-center text-[15px] mt-10" style={{ color: "var(--fg-2)" }}>Real kids. Real sessions. Real energy.</p>
    </div>
  </section>
);