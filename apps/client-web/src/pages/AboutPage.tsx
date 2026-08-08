import { ArrowRight } from "lucide-react";
import WhyWeStarted from "@/components/about/WhyWeStarted";
import WhoWeAre from "@/components/about/WhoWeAre";

export default function AboutPage() {
  return (
    <div className="gf-scope pt-20" style={{ minHeight: "100vh", background: "var(--gf-cream)" }}>
      {/* HERO DROPZONE */}
      <section 
        style={{ 
          maxWidth: 1180, 
          margin: "0 auto", 
          padding: "8px 24px 64px" 
        }}
      >
        <div
          className="
            border border-gray-200 
            rounded-3xl 
            overflow-hidden
            aspect-[16/9]
            w-full
          "
          style={{ 
            border: "3px solid var(--gf-green-deep)",
            boxShadow: "0 10px 0 var(--gf-ink)",
          }}
        >
          <img
            src="/images/team/DSC00079.jpg"
            alt="Grow Fitness Team"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            width="1180"
            height="664"
          />
        </div>
      </section>

      {/* TITLE */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px 56px", textAlign: "center" }}>
        <h1
          className="text-6xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-8xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Why we<br /><span style={{ color: "var(--gf-green)" }}>started</span>
        </h1>
        <p className="text-xl" style={{ marginTop: 24, lineHeight: 1.6, color: "var(--fg-2)", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
          The story behind Grow Fitness, and the two people who built it.
        </p>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ borderTop: "1px solid var(--line)" }} />
      </div>

      {/* WHY WE STARTED SECTION */}
      <WhyWeStarted />

      {/* WHO WE ARE SECTION */}
      <WhoWeAre />

      {/* TESTIMONIAL */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--gf-sun)" }}>
        <img
          src="/images/Grow VI Elements/Icons/Mix abs.png"
          alt="mix abs"
          className="absolute w-[200px] opacity-10 pointer-events-none"
          style={{ top: -40, left: -70 }}
          loading="lazy"
          decoding="async"
        />
        <img
          src="/images/Grow VI Elements/Icons/Mix abs.png"
          alt="mix abs"
          className="absolute w-[200px] opacity-10 pointer-events-none"
          style={{ bottom: -10, right: 50 }}
          loading="lazy"
          decoding="async"
        />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "96px 24px", position: "relative", textAlign: "start" }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gf-green-deep)", marginBottom: 24 }}>In their words</p>
          <p style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 900, lineHeight: 1.35, color: "var(--gf-green-deep)", marginBottom: 24 }}>
            &ldquo;Aadith has been part of the program for a while now, and it&apos;s really helped him stay away from the TV and phone. His fitness level, and even his focus in his studies, have both improved. I&apos;d highly recommend the sessions and the coaches.&rdquo;
          </p>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-2)" }}>Parent of Aadith</p>
        </div>
      </section>

      {/* CTA */}
      <section className="gf-scope" style={{ position: "relative", overflow: "hidden", background: "var(--gf-green-deep)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "112px 24px", position: "relative", textAlign: "center" }}>
          <h2 className="text-6xl" style={{ fontFamily: "var(--font-display)", lineHeight: 1.05, textTransform: "uppercase", color: "#fff", margin: 0 }}>
            Everything we do<br />comes back to<br /><span style={{ color: "var(--gf-sun)" }}>one thing.</span>
          </h2>
          <p className="text-2xl" style={{ marginTop: 24, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            A happy, confident kid who moves well. That&apos;s not a slogan for us. It&apos;s the actual goal of every session, every coach, every week.
          </p>
          <button className="gf-btn-pop relative" style={{ marginTop: 36, background: "var(--gf-sun)", color: "var(--gf-green-deep)", boxShadow: "0 6px 0 #c7c400", fontSize: 20, padding: "16px 50px" }}>
            Book your first session <ArrowRight size={20} />
          </button>
        </div>
        <img
          src="/images/Grow VI Elements/Icons/Yellow abs.png"
          alt="flower"
          className="absolute w-[360px] opacity-10 pointer-events-none"
          style={{ right: -60, bottom: -80 }}
          loading="lazy"
          decoding="async"
        />
      </section>
      <div className="gf-scope" style={{ borderTop: ".5px solid rgba(15, 18, 15, 0.75)" }} />
    </div>
  );
}