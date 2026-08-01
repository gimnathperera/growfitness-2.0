import React from 'react';
import { ArrowRight } from "lucide-react";


export const ProgramsSection: React.FC = () => (
  <section className="px-6 md:px-12 pb-24" style={{ background: "white" }}>
    <div className="max-w-[1240px] mx-auto">
      <div className="rounded-[32px] overflow-hidden" style={{ border: "3px solid var(--gf-green-deep)" }}>
        <div
          className="flex items-center justify-between flex-wrap gap-3 px-9 py-5"
          style={{ background: "var(--gf-green-deep)" }}
        >
          <div>
            <p className="font-bold text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gf-leaf)" }}>
              Your two options
            </p>
            <h3 style={{ fontFamily: "var(--font-alt)", fontWeight: 900, fontSize: 24, color: "white" }}>
              How would you like to train?
            </h3>
          </div>
          <a
            href="/programs"
            className="gf-btn-pop text-sm px-[22px] py-3"
            style={{ color: "var(--gf-green-deep)", background: "var(--gf-sun)", boxShadow: "0 4px 0 rgba(255,253,119,0.25)" }}
          >
            See all programs
            <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="p-9 flex flex-col gap-4" style={{ borderRight: "1.5px solid var(--line)" }}>
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0">
                <img src="/images/Grow VI Elements/Icons/Heart.png" alt='Personal' className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-bold text-[11px] uppercase tracking-widest mb-0.5" style={{ color: "var(--gf-green)" }}>Option 1</p>
                <h4 style={{ fontFamily: "var(--font-alt)", fontWeight: 900, fontSize: 22, color: "var(--gf-green-deep)" }}>Group Sessions</h4>
              </div>
            </div>
            <div className="w-full h-96 sm:h-[28rem] rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--line)" }}>
              <img src="/images/home/IMG_4248.jpg" alt="Group session photo" className="w-full h-full object-cover" />
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--fg-2)" }}>
              Weekly sessions in a small group setting. Kids build movement skills, make friends, and thrive on the energy of training together. Best for: kids who want to move, play, and belong.
            </p>
          </div>
          <div className="p-9 flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0">
                 <img src="/images/Grow VI Elements/Icons/Dumbell.png" alt='Group' className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-bold text-[11px] uppercase tracking-widest mb-0.5" style={{ color: "var(--gf-green)" }}>Option 2</p>
                <h4 style={{ fontFamily: "var(--font-alt)", fontWeight: 900, fontSize: 22, color: "var(--gf-green-deep)" }}>Personal Training</h4>
              </div>
            </div>
            <div className="w-full h-96 sm:h-[28rem] rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--line)" }}>
              <img src="/images/home/IMG_7293.jpg" alt="PT session photo" className="w-full h-full object-cover" />
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--fg-2)" }}>
              1-on-1 sessions built specifically around your child. Their strengths, gaps, and goals. Tracked and reported back to you every step. Best for: kids who need targeted development or sport prep.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);