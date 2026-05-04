import { Heart } from "lucide-react";
import { Container } from "../layout/Container";

const stats = [
  { value: "5+", label: "Pre-schools & branches" },
  { value: "75+", label: "Kids at group sessions" },
  { value: "20+", label: "Kids at personal training" },
];

export function StatsSection() {
  return (
    <section className="relative py-20 bg-slate-dark text-white overflow-hidden bg-grain">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full border border-white/10" />
      <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full border border-white/10" />

      <Container className="relative text-center">
        <h2 className="font-display text-3xl md:text-5xl tracking-wide uppercase">
          We Host Sessions Weekly For
        </h2>
        <p className="text-primary mt-3 font-bold max-w-xl mx-auto">
          We've been helping kids get fit since 2023. That's why parents like you trust us.
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </span>
              <div className="font-display text-5xl md:text-6xl text-white">{s.value}</div>
              <div className="mt-1 text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-14 text-white/70 max-w-2xl mx-auto leading-relaxed">
          Join GROW Kids Fitness Center where children develop healthy habits, build confidence, and
          have <span className="text-accent font-bold">FUN</span> while staying active!
        </p>
      </Container>
    </section>
  );
}
