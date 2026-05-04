import { Phone, Lightbulb, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "../layout/Container";

const steps = [
  {
    icon: Phone,
    title: "Discovery",
    desc: "We understand your child's current needs over a call.",
    dark: false,
  },
  {
    icon: Lightbulb,
    title: "Program selection",
    desc: "We recommend you a program. Group sessions, personal training sessions, or both.",
    dark: false,
  },
  {
    icon: Megaphone,
    title: "First session",
    desc: "Group sessions have fixed time slots. If you'd like to enroll into personal training, we discuss times and dates for sessions.",
    dark: true,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-primary/10">
      <Container>
        <h2 className="font-insanibc text-3xl md:text-4xl text-center text-foreground uppercase tracking-wide mb-12 font-bold">
          How Grow Fitness Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`rounded-3xl p-8 shadow-card transition-transform hover:-translate-y-1 
                ${
                s.dark
                  ? "bg-brand-dark text-white"
                  : "bg-card text-foreground"
              }`}
            >
              <span
                className={`grid place-items-center w-16 h-16 rounded-2xl mb-6 ${
                  s.dark ? "bg-accent text-brand-dark" : "bg-primary text-primary-foreground"
                }`}
              >
                <s.icon className="w-7 h-7" />
              </span>
              <div className={`text-xs font-bold mb-2 ${s.dark ? "text-accent" : "text-primary"}`}> 
                Step {i + 1}
              </div>
              <h3 className="font-insanibc text-2xl mb-3 leading-snug font-bold">{s.title}</h3>
              <div className={`h-px w-12 mb-3 ${s.dark ? "bg-white/20" : "bg-border"}`} />
              <p className={`text-base leading-relaxed ${s.dark ? "text-white/80" : "text-muted-foreground"}`}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button className="rounded-full bg-brand-dark hover:bg-brand-dark/90 text-white h-12 px-8">
            Try the first session
          </Button>
        </div>
      </Container>
    </section>
  );
}
