const FOUNDERS = [
  {
    name: "Samuel",
    role: "FOUNDER",
    borderColor: "var(--gf-sun)",
    circle: "var(--gf-green)",
    roleColor: "var(--gf-green)",
    image: "/images/team/Samuel.jpg",
    paragraphs: [
      "Before Grow Fitness, Samuel worked in marketing. Good training in understanding people, but not where he wanted to build a career. Frustrated with an education system that boxes kids into what they're \"good at\" too early, he set out to build the opposite: a place where kids discover their own talent, at their own pace.",
      "He's studying the NSCA Essentials of Strength Training and Conditioning, and is a CPD certified Nutrition Advisor for recreational athletes. But the real reason runs deeper than fitness: Samuel believes sport builds the same muscle as entrepreneurship, and sees Grow Fitness as one step toward raising a generation of Sri Lankan kids who grow up to build things of their own."
    ]
  },
  {
    name: "Stephan",
    role: "HEAD COACH",
    borderColor: "var(--gf-green)",
    circle: "var(--gf-sun)",
    roleColor: "var(--gf-sun)",
    image: "/images/team/Stephan.jpg",
    paragraphs: [
      "Stephan is a former professional rugby player (CR&FC, Havelock SC) and former Vice-Captain of the St. Peter's College 1st XV. He later became a Certified Physical Fitness Trainer and fitness trainer for the D.S. Senanayake College 1st XV.",
      "Samuel wouldn't stop nagging him about doing something bigger with all that experience. Stephan didn't need much convincing. He naturally enjoys being around kids, playing with them, building games. The talent and the love were already there; Grow Fitness just became the place where both could matter."
    ]
  }
];

const CREW = [
  {
    name: "Apsara",
    role: "PROJECT MANAGER",
    image: "/images/team/apsara.jpg",
    body: "CAPM qualified, with a Level 5 Diploma in Astronomy and Astrophysics. The unsung hero of the team, focused on the projects that push Grow Fitness to the next level."
  },
  {
    name: "Steve Mathies",
    role: "SALES & PARTNERSHIPS",
    image: "/images/team/Steve .jpg",
    body: "We call him our Swiss Knife. Sales, partnerships, coaching support, session coordination. If it needs doing and nobody's sure whose job it is, it's probably his by the end of the day."
  },
  {
    name: "Sheron Yoshuwa",
    role: "CONTENT CREATOR",
    image: "/images/team/sheron.jpg",
    body: "Sheron tells our story. If a photo, video, or post made you stop scrolling and look us up, that was probably him."
  },
  {
    name: "Rivin Sathnidu",
    role: "ASST. HEAD COACH",
    image: "/images/team/Riven.jpg",
    body: "A former award-winning gymnast and schoolboy rugby player, Level 5 certified personal trainer, and former physical trainer of the D.S. Senanayake College 1st XV Rugby Team."
  }
];

export default function WhoWeAre() {
  return (
    <section style={{
      position: "relative",
      overflow: "hidden",
      background: "var(--gf-green-deep)"
    }}>
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "96px 24px",
        position: "relative"
      }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--gf-leaf)"
          }}>
            Part Two
          </p>
           <h2 
            className="text-4xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-6xl"
            style={{
              marginTop: 16,
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
              color: "#fff"
            }}>
              Who we are
          </h2>
        </div>

        {/* Founders */}
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gf-leaf)",
          marginBottom: 24
        }}>
          The founders
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          marginBottom: 80
        }}>
          {FOUNDERS.map((f) => (
            <div
              key={f.name}
              className="gf-card-lift"
              style={{
                borderRadius: 22,
                padding: 32,
                background: "rgba(255,255,255,0.03)",
                border: `1.5px solid ${f.borderColor}`
              }}
            >
              <div style={{
                width: 100,
                height: 100,
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: 20,
                border: `3px solid ${f.circle}`,
                background: "rgba(255,255,255,0.04)"
              }}>
                <img
                  src={f.image}
                  alt={f.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  loading="lazy"
                  decoding="async"
                  width="100"
                  height="100"
                />
              </div>
              <p style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 2
              }}>
                {f.name}
              </p>
              <p style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: f.roleColor,
                marginBottom: 16
              }}>
                {f.role}
              </p>
              {f.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  style={{
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.75)",
                    marginBottom: 16
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ borderTop: "1px solid rgba(82, 99, 82, 0.75)" }} />
        </div>

        {/* Crew */}
        <p style={{
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gf-leaf)",
          marginBottom: 24,
          marginTop: 72
        }}>
          The rest of the crew
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 64
        }}>
          {CREW.map((c) => (
            <div
              key={c.name}
              className="gf-card-lift"
              style={{
                borderRadius: 20,
                padding: 24,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                marginTop: 16
              }}
            >
              <div style={{
                width: 76,
                height: 76,
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: 16,
                border: "3px solid var(--gf-green)",
                background: "rgba(255,255,255,0.04)"
              }}>
                <img
                  src={c.image}
                  alt={c.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  loading="lazy"
                  decoding="async"
                  width="76"
                  height="76"
                />
              </div>
              <p style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4
              }}>
                {c.name}
              </p>
              <p style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--gf-leaf)",
                marginBottom: 12
              }}>
                {c.role}
              </p>
              <p style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.65)"
              }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: "center",
          fontStyle: "italic",
          fontSize: 17,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.55)",
          maxWidth: 600,
          margin: "0 auto"
        }}>
          There are many coaches who've been part of this journey along the way, including Coach Aahil, Jason, and Lankesh. We won't tell every story here. That's not what this page is for. But we haven't forgotten. We never will.
        </p>
      </div>
    </section>
  );
}