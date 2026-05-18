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
    <section
      id="faq"
      className="relative overflow-hidden bg-brand-dark text-white bg-grain py-24 sm:py-24 md:py-32"
    >
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px] md:-right-64 md:-top-64 md:h-[500px] md:w-[500px] md:blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 h-[250px] w-[250px] rounded-full bg-primary/5 blur-[80px] md:-bottom-48 md:-left-48 md:h-[400px] md:w-[400px] md:blur-[100px]" />
      </div>

      <Container className="relative">
        {/* Header */}
        <div className="mx-auto mb-10 md:mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary">
            FAQ
          </span>

          <h2 className="mt-4 md:mt-5 font-insanibc text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wide text-white font-bold">
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

          <p className="mt-4 md:mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-white/70">
            Find quick answers to the questions we hear most from families.
          </p>
        </div>

        <div className="grid gap-8 md:gap-10 lg:grid-cols-[280px_1fr] lg:gap-12 xl:grid-cols-[300px_1fr]">

          {/* ── Sidebar ── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {/*
              Mobile:  2-column grid so all 4 tabs are fully visible — zero scrolling
              Desktop: vertical flex column (unchanged)
            */}
            <nav className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-2">
              {faqSections.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => handleTabChange(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all duration-200",
                    "sm:gap-3 sm:px-4 sm:py-3 sm:text-sm",
                    "lg:gap-3 lg:px-4 lg:py-3 lg:text-sm",
                    active === i
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border border-border/40 bg-secondary/20 text-white/70 hover:bg-secondary/40 hover:text-white"
                  )}
                >
                  <span className="shrink-0 leading-none">{SECTION_ICONS[i]}</span>
                  <span className="flex-1 leading-snug">{s.title}</span>
                  <span
                    className={cn(
                      "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      active === i ? "bg-black/20 text-white" : "bg-black/30 text-white/50"
                    )}
                  >
                    {s.faqs.length}
                  </span>
                </button>
              ))}
            </nav>

            {/* WhatsApp CTA — desktop only */}
            <a
              href="https://wa.me/94770569954"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 hidden lg:flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3.5 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
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

          {/* ── Accordion content ── */}
          <div
            ref={contentRef}
            className={cn(
              "transition-opacity duration-200",
              animating ? "opacity-0" : "opacity-100"
            )}
          >
            {/* Category header */}
            <div className="mb-4 md:mb-6 flex items-center gap-3">
              <span className="text-xl md:text-2xl text-primary">
                {SECTION_ICONS[active]}
              </span>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/50">
                  {current.faqs.length} question
                  {current.faqs.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Accordion */}
            <Accordion
              key={current.title}
              type="single"
              collapsible
              className="flex flex-col gap-2 md:gap-3 w-full"
            >
              {current.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="overflow-hidden rounded-xl border border-border/40 bg-secondary/40 hover:bg-secondary/60"
                >
                  {/* FIX: text-black → text-white (was invisible on dark background) */}
                  <AccordionTrigger className="px-4 py-3 sm:px-6 sm:py-4 md:py-5 text-sm sm:text-base font-semibold text-black hover:text-primary transition-colors text-left">
                    <span className="flex items-start gap-3 flex-1 text-left pr-4">
                      <span className="grid place-items-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{faq.q}</span>
                    </span>
                  </AccordionTrigger>

                  {/* FIX: removed hover:text-black which made answers invisible on hover */}
                  <AccordionContent className="px-4 py-4 sm:px-6 sm:py-6 text-sm sm:text-base leading-relaxed font-bold text-white/80 hover:text-black">
                    <div className="pl-10 sm:pl-11">{faq.a}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Mobile WhatsApp CTA */}
            <a
              href="https://wa.me/94770569954"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3.5 text-sm font-medium text-green-400 hover:bg-green-500/20 lg:hidden"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-white">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span>
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