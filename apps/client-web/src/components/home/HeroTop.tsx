import React, { useEffect, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import type { Banner } from '@grow-fitness/shared-types';
import { Container } from '../layout/Container';

interface HeroTopProps {
  banners: Banner[];
  loading?: boolean;
}

export const HeroTop: React.FC<HeroTopProps> = ({ banners, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const defaultImage = "/images/kids-jumping.png";
  const displayBanners = banners.length > 0 ? banners : [{ id: 'default', imageUrl: defaultImage }];

  return (
    <section className="relative bg-white pt-32 pb-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-brand-light rounded-full opacity-50 -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/2 w-16 h-16 bg-brand-light rounded-full opacity-30 -z-10 animate-bounce"></div>

      <Container className="flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-light text-brand-green text-sm font-bold mb-6">
            <span className="animate-pulse">✨</span> Sri Lanka's #1 Kids Fitness Program
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight font-insanibc">
            Where Kids <br />
            <span className="text-brand-green">Grow</span> <br />
            Stronger & Happier
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed">
            Fun, safe, and expertly coached fitness programs that build confidence, 
            coordination, and <span className="text-brand-green font-bold">lifelong</span> healthy habits.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <AnimatedButton
              href="/free-session"
              variant="default"
              size="lg"
              className="bg-brand-green hover:bg-brand-dark text-white rounded-full px-8 py-6 text-lg shadow-xl"
              rightIcon={ArrowRight}
            >
              Enroll Your Child
            </AnimatedButton>
            
            <AnimatedButton
              href="#programs"
              variant="outline"
              size="lg"
              className="border-2 border-gray-200 text-gray-700 hover:border-brand-green hover:text-brand-green rounded-full px-8 py-6 text-lg"
            >
              Explore Programs
            </AnimatedButton>
          </div>
        </div>

        {/* Right Content - Image Block Slider */}
        <div className="flex-1 relative">
          <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-brand-light shadow-2xl h-[400px] md:h-[500px]">
            {loading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : (
              displayBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img 
                    src={banner.imageUrl || defaultImage} 
                    alt="Grow Fitness Hero" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            )}
          </div>

          {/* Floating Badges */}
          <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce delay-700 z-20">
            <div className="w-10 h-10 bg-brand-accent/20 rounded-full flex items-center justify-center">
              <Star className="text-brand-accent fill-brand-accent w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900">4.9/5</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-20">
            <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
              <span className="text-brand-green font-bold">🏃</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">500+</div>
              <div className="text-xs text-gray-500">Happy Kids</div>
            </div>
          </div>

          {/* Decorative dots grid (simplified) */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 opacity-20 hidden lg:block">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-brand-green rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
