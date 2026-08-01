import React from 'react';
import { ArrowRight } from "lucide-react";

export const HeadCoachSection: React.FC = () => (
  <section className="relative overflow-hidden px-6 md:px-12 py-24" style={{ background: "var(--gf-green-deep)" }}>
    <img
      src="/images/Grow VI Elements/Icons/Yellow abs.png"
      alt="flower"
      className="absolute w-[360px] opacity-5 pointer-events-none"
      style={{ right: -80, top: -60 }}
    />

    <div className="max-w-[1240px] mx-auto grid md:grid-cols-[360px_1fr] gap-16 items-center relative z-10">
      <div className="relative">
        <div
          className="relative w-full aspect-[3/4] rounded-[28px] flex flex-col items-center justify-center gap-3.5 overflow-hidden"
          style={{ background: "var(--gf-green-100)", border: "2px solid rgba(255,255,255,0.12)" }}
        >
          <div
            className="absolute top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--gf-sun)", border: "2px solid var(--gf-green-deep)" }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--gf-green-deep)" }}>SS</span>
          </div>
          <img
            src="/images/team/Stephan.jpg"
            alt="Stephan Sivaraj - Head Coach"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute whitespace-nowrap rounded-full px-5 py-2"
          style={{ bottom: -20, left: "50%", transform: "translateX(-50%)", background: "var(--gf-sun)", border: "2px solid var(--gf-green-deep)", boxShadow: "0 4px 0 rgba(0,0,0,0.2)" }}
        >
          <p className="font-bold text-[13px]" style={{ color: "var(--gf-green-deep)" }}>Head Coach</p>
        </div>
      </div>

      <div className="flex flex-col gap-7">
        <div>
          <p className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gf-leaf)" }}>Meet your head coach</p>
          <h2 className="uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,6vw,76px)", lineHeight: 0.9, color: "white" }}>
            STEPHAN
            <br />
            SIVARAJ
          </h2>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { c: "var(--gf-green)", t: "Head Coach" },
            { c: "var(--gf-green)", t: "Certified Physical Fitness Trainer" },
            { c: "var(--gf-sun)", t: "Ex-professional rugby player & coach" },
          ].map((r) => (
            <div key={r.t} className="inline-flex items-center gap-2.5 w-fit">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.c }} />
              <p className="font-semibold text-[16px] text-white">{r.t}</p>
            </div>
          ))}
        </div>

        <div className="pl-5" style={{ borderLeft: "3px solid var(--gf-green)" }}>
          <p style={{ fontFamily: "var(--font-alt)", fontWeight: 700, fontSize: 22, lineHeight: 1.4, color: "var(--gf-leaf)", fontStyle: "italic" }}>
            "I've trained at the highest level of the game. Now I build the foundations that get kids there."
          </p>
        </div>

        <a href="#" className="inline-flex items-center gap-2 font-semibold text-[15px]" style={{ color: "var(--gf-leaf)" }}>
          Meet the team behind Grow Fitness and the story of why they started
          <ArrowRight size={14} strokeWidth={2.5} />
        </a>
      </div>
    </div>
    <img
      src="/images/Grow VI Elements/Icons/Mix abs.png"
      alt="mix abs"
      className="absolute w-[300px] opacity-10 pointer-events-none"
      style={{ left: -60, bottom: -80 }}
    />
  </section>
);