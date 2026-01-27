import {
  CheckCircle,
  Target,
  Users,
  Award,
  Star,
  ArrowRight,
} from 'lucide-react';
import { MascotCharacter } from '@/components/ui/mascot-character';
import { AnimatedButton } from '@/components/ui/animated-button';
import HeroSection from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import HeroBanner from '@/components/home/HeroBanner';
import { useEffect, useState } from 'react';
import type { Banner } from '@grow-fitness/shared-types';
import { bannersService } from '@/services/banners.service';

function BenefitsSection() {
  const benefits = [
    { icon: CheckCircle, text: 'Age-appropriate fitness programs' },
    { icon: Target, text: 'Progress tracking and goal setting' },
    { icon: Users, text: 'Social interaction and teamwork' },
    { icon: Award, text: 'Confidence and self-esteem building' },
  ];

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-r from-accent via-primary to-accent relative overflow-hidden">
      {/* Animated Background Mascots (hide on small screens) */}
      <div className="hidden md:block absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <MascotCharacter
            src="/images/character3.png"
            alt="Mascot 3"
            size="md"
          />
        </div>
        <div className="absolute bottom-10 right-10">
          <MascotCharacter
            src="/images/character1.png"
            alt="Mascot 1"
            size="md"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 sm:mb-8 font-insanibc">
              Building Healthy Habits for Life
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 sm:gap-4 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-foreground rounded-full flex items-center justify-center group-hover:animate-spin">
                    <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  </div>
                  <span className="text-foreground font-bold text-base sm:text-lg">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="relative w-40 h-40 md:w-60 md:h-60 rounded-full bg-transparent mx-auto">
              <MascotCharacter
                size="3xl"
                className="w-full h-full object-contain"
                animated
                withSparkles
              />

              {/* Additional floating stars */}
              <div className="absolute inset-0">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-6 h-6 text-accent animate-spin ${
                      i === 0
                        ? 'top-0 left-0'
                        : i === 1
                          ? 'top-0 right-0 delay-300'
                          : i === 2
                            ? 'bottom-0 left-0 delay-500'
                            : 'bottom-0 right-0 delay-700'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-12 sm:py-20 bg-foreground relative overflow-hidden">
      {/* Animated background elements */}
      <div className="hidden md:block absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-20 h-20 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-16 h-16 bg-accent rounded-full animate-bounce"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-6">
            <MascotCharacter size="md" animated />
            <MascotCharacter size="md" animated />
            <MascotCharacter size="md" animated />
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 font-insanibc">
          Ready to Start Your Child's Fitness Journey?
        </h2>
        <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8">
          Join thousands of families who trust GROW for their children's health
          and wellness 🚀
        </p>

        <AnimatedButton
          href="/free-session"
          variant="gradient"
          size="lg"
          rightIcon={ArrowRight}
          rounded="full"
          headingLevel="h6"
          className="!text-white border-4 border-white"
        >
          Book a free session
        </AnimatedButton>
      </div>
    </section>
  );
}

function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersService.getBanners(1, 10);
        setBanners(response.data);
      } catch (error) {
        console.error('Failed to load banners', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div>
      <HeroBanner 
        key={banners.length} 
        banners={banners} 
        loading={isLoading} 
      />

      <div className="bg-gradient-to-br from-primary via-accent to-primary overflow-hidden relative">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 bg-accent/20 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-primary/20 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-white/20 rounded-full animate-pulse delay-500"></div>
        </div>

        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </div>
  );
}

export default HomePage;
export { HomePage };