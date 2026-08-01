export default function SeeItInAction() {
  return (
    <section style={{ background: "var(--gf-green-deep)" }}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-20 pt-16">
         <span
            className="gf-eyebrow inline-block text-md font-bold my-8"
            style={{ color: "var(--gf-leaf)" }}
          >
            SEE IT IN ACTION
          </span>
        <p className="gf-h-display font-bold text-white text-4xl md:text-5xl mb-8">
          What a real session looks like.
        </p>

        <div
          className="rounded-3xl h-[300px] sm:h-[340px] md:h-[380px] lg:h-[420px] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <video
            src="/images/home/final.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}