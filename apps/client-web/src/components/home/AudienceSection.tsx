import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

const notFor = [
  "Believe screens are a replacement for outdoor play",
  "Want quick fixes instead of long-term development",
  "Prefer kids to stay comfortable rather than challenged",
  "Are looking only for competition or medals",
  "Think physical development will 'just happen' on its own",
];

const isFor = [
  "Spends too much time on screens",
  "Struggles with focus or coordination",
  "Has low confidence in sports",
  "Needs structured physical development",
];

export function AudienceSection() {
  return (
    <section className="py-20 bg-brand-dark text-white bg-grain">
      <Container className="grid md:grid-cols-2 gap-6">
        {/* NOT FOR */}
        <div className="bg-card text-foreground rounded-3xl p-8 md:p-10 shadow-card">
          <h3 className="font-insanibc text-3xl text-foreground leading-tight font-bold">
            THIS IS <span className="text-primary">NOT</span> FOR PARENTS
          </h3>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2 mb-6">
            Who notice their child
          </p>
          <ul className="space-y-3">
            {notFor.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="grid place-items-center w-6 h-6 rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span className="text-base leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* IS FOR */}
        <div className="bg-card text-foreground rounded-3xl p-8 md:p-10 shadow-card border-2 border-primary/30 relative">
          <span className="absolute -top-3 left-8 text-[10px] font-bold uppercase tracking-wider bg-accent text-slate-dark px-3 py-1 rounded-full">
            For You
          </span>
          <h3 className="font-insanibc text-3xl text-foreground leading-tight font-bold">
            THIS IS <span className="text-primary">FOR</span> PARENTS
          </h3>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2 mb-6">
            Who notice their child
          </p>
          <ul className="space-y-3 mb-8">
            {isFor.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="grid place-items-center w-6 h-6 rounded-full bg-primary/15 text-primary shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span className="text-base leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
          <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground w-full h-12">
            Try the first session
          </Button>
        </div>
      </Container>
    </section>
  );
}
