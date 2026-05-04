import { Check } from "lucide-react";
import { Container } from "../layout/Container";


const benefits = [
  { text: "Increased screen addiction" },
  { text: "Reduced outdoor play" },
  { text: "Declining physical literacy" },
];

export function ChallengesSection() {
  return (
    <section id="about" className="py-20 relative shadow-xl">
      <Container>
        <div className="bg-card rounded-[2.5rem] p-8 md:p-14 shadow-card border border-border/60 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl leading-tight font-display">
              <span className="text-foreground">Today's kids face</span>{" "}
              <span className="text-primary">three major challenges</span>
            </h2>
            <p className="text-muted-foreground text-lg mt-5 mb-8 leading-relaxed max-w-lg">
              These affect confidence, attention, and long-term health. We battle them through
              physical activity.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.text}
                  className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4"
                >
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </span>
                  <span className="text-foreground font-bold text-sm leading-snug">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-72 h-72 rounded-full bg-primary/10 grid place-items-center">
              <div className="absolute inset-4 rounded-full bg-primary/5" />
              <img
                src="/character.png"
                alt="GROW Buddy mascot"
                width={512}
                height={512}
                loading="lazy"
                className="relative w-56 h-56 object-contain animate-bounce"
                style={{ animationDuration: "2.5s" }}
              />
              <div className="absolute -top-2 right-6 w-12 h-12 rounded-2xl bg-accent grid place-items-center shadow-soft rotate-12">
                <span className="text-2xl">🌱</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
