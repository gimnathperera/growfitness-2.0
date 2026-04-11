import { ArrowRight } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Container } from '../layout/Container';

export const CTASection = () => {
  return (
    <section className="py-24">
      <Container>
        <div className="relative bg-gradient-to-br from-brand-green to-brand-dark rounded-[4rem] p-12 md:p-20 text-center overflow-hidden shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-bounce">
               <span className="text-3xl">🚀</span>
             </div>
             
             <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-insanibc leading-tight">
               Ready to Start Your Child's <br />
               <span className="text-brand-accent">Fitness Journey?</span>
             </h2>
             
             <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
               Join thousands of families who trust GROW for their children's health
               and wellness. Get started today!
             </p>

             <AnimatedButton
               href="/free-session"
               variant="default"
               size="lg"
               className="bg-white text-brand-green hover:bg-brand-light font-bold rounded-full px-10 py-8 text-xl shadow-2xl transition-all"
               rightIcon={ArrowRight}
             >
               Book a free session
             </AnimatedButton>
             
             <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-sm font-medium">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                 No credit card required
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                 Free consultation
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
                 Cancel anytime
               </div>
             </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
