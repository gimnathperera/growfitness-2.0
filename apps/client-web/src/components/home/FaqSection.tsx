import { useState, useRef, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, ChevronRight, Info, Users, User, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { faqSections } from "@/data/faq-data";

const SECTION_ICONS = [
  <Info className="w-5 h-5" />,
  <Users className="w-5 h-5" />,
  <User className="w-5 h-5" />,
  <School className="w-5 h-5" />,
];

export function FaqSection() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const current = faqSections[active];
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (i: number) => {
    if (i === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(i);
      setAnimating(false);
    }, 180);
  };

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [active]);

  return (
    <section id="faq" className="relative overflow-hidden bg-brand-dark text-white bg-grain py-24 sm:py-32">
      {/* Subtle background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <Container className="relative">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            FAQ
          </span>
          <h2 className="mt-5 font-insanibc text-4xl md:text-5xl uppercase tracking-wide text-white font-bold">
            Everything parents
            <span className="relative ml-3 whitespace-nowrap text-primary">
              need to know
              <svg
                aria-hidden
                viewBox="0 0 220 12"
                fill="none"
                className="absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C60 3 120 3 218 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary/30"
                />
              </svg>
            </span>
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-white/70">
            Find quick answers to the questions we hear most from families.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12 xl:grid-cols-[300px_1fr]">
          {/* Left sidebar: category tabs */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {faqSections.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => handleTabChange(i)}
                  className={cn(
                    "group flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 lg:min-w-0 lg:w-full",
                    active === i
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-secondary/20 text-white/70 hover:bg-secondary/40 hover:text-white border border-border/40"
                  )}
                >
                  <span className="text-base leading-none">{SECTION_ICONS[i]}</span>
                  <span className="flex-1">{s.title}</span>
                  <span
                    className={cn(
                      "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      active === i
                        ? "bg-black/20 text-white"
                        : "bg-black/30 text-white/50"
                    )}
                  >
                    {s.faqs.length}
                  </span>
                </button>
              ))}
            </nav>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/94770569954"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 hidden lg:flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white shadow-sm">
                <MessageCircle className="h-4 w-4" />
              </span>

              <span className="leading-snug">
                Still have questions?
                <br />
                <span className="font-semibold text-white">WhatsApp us</span>
              </span>

              <ChevronRight className="ml-auto h-4 w-4 text-green-400/70" />
            </a>
          </aside>

          {/* Right: accordion panel */}
          <div
            ref={contentRef}
            className={cn(
              "transition-opacity duration-200",
              animating ? "opacity-0" : "opacity-100"
            )}
          >
            {/* Category heading */}
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl text-primary">{SECTION_ICONS[active]}</span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {current.title}
                </h3>
                <p className="text-sm text-white/50">
                  {current.faqs.length} question
                  {current.faqs.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <Accordion
              key={current.title}
              type="single"
              collapsible
              className="flex flex-col gap-3 w-full"
            >
              {current.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="overflow-hidden rounded-xl border border-border/40 bg-secondary/40 transition-colors hover:bg-secondary/60"
                >
                  <AccordionTrigger className="px-6 py-5 text-base font-semibold text-black hover:text-primary transition-colors text-left">
                    <span className="flex items-center gap-3 pr-4">
                      <span className="grid place-items-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-6 text-base leading-relaxed font-semibold text-white hover:text-black">
                    <div className="pl-11">
                      {faq.a}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Mobile WhatsApp CTA */}
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 lg:hidden"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white shadow-sm">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="hover:text-white">
                Still have questions?{" "}
                <span className="font-semibold text-white">WhatsApp us</span>
              </span>
              <ChevronRight className="ml-auto h-4 w-4 text-green-400/70" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
