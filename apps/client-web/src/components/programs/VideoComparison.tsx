export function VideoComparison() {
  return (
    <section className="px-6 py-16" style={{ backgroundColor: "var(--gf-ink)" }}>
      <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/50">
        See both programs in action
      </p>

      <div
        className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="relative grid grid-cols-1 md:grid-cols-2">
          {/* Group Sessions */}
          <div
            className="relative h-[60vh] min-h-[500px] max-h-[750px] overflow-hidden"
            style={{ backgroundColor: "rgba(35,182,133,0.18)" }}
          >
            <video
              src="/images/programs/final.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-center text-3xl font-extrabold uppercase text-white">
                Group
                <br />
                <span style={{ color: "var(--gf-green)" }}>
                  Sessions
                </span>
              </p>
            </div>
          </div>

          {/* Personal Training */}
          <div
            className="relative h-[60vh] min-h-[500px] max-h-[750px] overflow-hidden"
            style={{ backgroundColor: "rgba(255,253,119,0.05)" }}
          >
            <video
              src="/images/programs/PT 1.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-center text-3xl font-extrabold uppercase text-white">
                Personal
                <br />
                <span style={{ color: "var(--gf-sun)" }}>
                  Training
                </span>
              </p>
            </div>
          </div>

          {/* VS Badge */}
          <span
            className="absolute left-1/2 top-1/2 flex h-12 w-12 opacity-80 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-base font-bold uppercase text-black"
            style={{
              backgroundColor: "white",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            VS
          </span>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-xs text-white/30">
        Drop your video file here once it&apos;s ready. One file, split-screen
        edit, under 90 seconds.
      </p>
    </section>
  );
}