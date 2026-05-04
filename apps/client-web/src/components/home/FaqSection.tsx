import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "../layout/Container";

const faqs = [
  {
    q: "Do I need to be home?",
    a: "No, many clients share entry details and come back to a clean space.",
  },
  {
    q: "Are supplies included?",
    a: "Yes, we bring eco-friendly products and equipment.",
  },
  {
    q: "Do you clean on weekends?",
    a: "Yes, limited weekend slots are available.",
  },
  {
    q: "How do you price a job?",
    a: "Prices depend on size, layout and level of detail.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 bg-brand-dark text-white bg-grain">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-insanibc text-4xl md:text-5xl uppercase tracking-wide text-white mb-4 font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Everything you need to know about Grow Kids Fitness programs
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-card text-foreground rounded-3xl p-8 md:p-12 shadow-card border border-border/60">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`item-${i}`}
                  className="border border-border/40 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary font-semibold text-base py-5 px-6 transition-colors">
                    <span className="flex items-center gap-3">
                      <span className="grid place-items-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed px-6 pb-5">
                    <div className="pl-11">
                      {f.a}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTA at bottom */}
            <div className="mt-8 pt-8 border-t border-border/40 text-center">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Still have questions?
              </p>
              <div className="inline-flex items-center gap-2 text-primary font-semibold hover:underline cursor-pointer">
                Contact our support team
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
