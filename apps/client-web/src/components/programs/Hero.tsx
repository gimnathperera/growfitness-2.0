export function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--gf-green-deep)" }}>
      <img
        src="/images/Grow VI Elements/Icons/Yellow abs.png"
        alt="flower"
        className="absolute pointer-events-none animate-spin-slow"
        style={{
          width: "clamp(180px, 20vw, 360px)",
          right: "clamp(-40px, -5vw, -60px)",
          top: "clamp(-40px, -5vw, -80px)",
          opacity: 0.1
        }}
        loading="lazy"
        decoding="async"
      />
      <img
        src="/images/Grow VI Elements/Icons/Mix abs.png"
        alt="Mix Abs"
        className="absolute pointer-events-none"
        style={{
          width: "clamp(120px, 15vw, 240px)",
          left: "clamp(-20px, -3vw, -40px)",
          bottom: "clamp(-10px, -2vw, -20px)",
          opacity: 0.1
        }}
        loading="lazy"
        decoding="async"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div
            className="mb-6 inline-flex w-fit items-center rounded-full px-4 py-2 md:px-5"
            style={{
              background: "var(--gf-sun)",
              border: "2px solid var(--gf-green-deep)",
              boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
            }}
          >
            <span
              className="mr-2 inline-block h-2 w-2 rotate-45 flex-shrink-0"
              style={{ backgroundColor: "var(--gf-green-deep)" }}
            />
            <span
              className="font-bold text-[11px] sm:text-[13px] whitespace-nowrap"
              style={{ color: "var(--gf-green-deep)" }}
            >
              FOR KIDS AGED 4 AND ABOVE
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold uppercase leading-[0.95] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Two ways
            <br />
            <span style={{ color: "var(--gf-sun)" }}>to train.</span>
          </h1>
          <p
            className="mt-4 sm:mt-6 flex items-center gap-2 text-2xl sm:text-3xl md:text-4xl font-semibold"
            style={{ color: "var(--gf-leaf)" }}
          >
            Pick what fits your kid.
          </p>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <img
            src="/images/Grow VI Elements/Icons/Grow buddy 2 yellow.png"
            alt="yellowbuddy"
            className="pointer-events-none"
            style={{
              width: "clamp(120px, 20vw, 360px)",
              maxWidth: "360px",
              minWidth: "320px",
              height: "auto"
            }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}