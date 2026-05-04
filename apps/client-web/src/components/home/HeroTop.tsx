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
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const defaultImage = '/images/kids-jumping.png';
  const displayBanners = banners.length > 0 ? banners : [{ id: 'default', imageUrl: defaultImage }];

  return (
    <section className="relative overflow-hidden bg-white pb-14 pt-24 sm:pb-16 sm:pt-28 md:pb-20 md:pt-32">
      {/* Decorative background elements */}
      <div className="absolute -left-2 top-16 -z-10 h-16 w-16 animate-pulse rounded-full bg-brand-light opacity-50 sm:left-10 sm:top-20 sm:h-24 sm:w-24"></div>
      <div className="absolute bottom-6 right-1/2 -z-10 h-12 w-12 animate-bounce rounded-full bg-brand-light opacity-30 sm:bottom-10 sm:h-16 sm:w-16"></div>

      <Container className="flex flex-col items-center gap-8 md:gap-10 lg:flex-row lg:items-center lg:gap-12">
        {/* Left Content */}
        <div className="w-full flex-1 text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-2 text-xs font-bold text-brand-green sm:mb-6 sm:px-4 sm:text-sm">
            <span className="animate-pulse">✨</span> Sri Lanka's #1 Kids Fitness Program
          </div>

          <h1 className="mb-5 font-insanibc text-4xl font-bold leading-tight text-gray-900 sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl">
            <span className="text-brand-green">Childhood used to happen
            outside</span> <br />
            now it happens on screens.
          </h1>

          <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-600 sm:text-lg md:mb-10">
            Grow Fitness helps kids fall in love with <span className="text-brand-black font-bold">physical activity</span>. So we can bring back the <span className="text-brand-green font-bold">lifelong</span> healthy habits.
          </p>  

          <div className="flex flex-wrap gap-3 sm:gap-4">
            <AnimatedButton
              href="/free-session"
              variant="default"
              size="lg"
              className="rounded-full bg-brand-green px-6 py-4 text-base text-white shadow-xl hover:bg-brand-dark sm:px-8 sm:py-6 sm:text-lg"
              rightIcon={ArrowRight}
            >
              Book a Free Session
            </AnimatedButton>

            {/* <AnimatedButton
              href="#programs"
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-gray-200 px-6 py-4 text-base text-gray-700 hover:border-brand-green hover:text-brand-green sm:px-8 sm:py-6 sm:text-lg"
            >
              Explore Programs
            </AnimatedButton> */}
          </div>
        </div>

        {/* Right Content - Image Block Slider */}
        <div className="relative w-full flex-1">
          <div className="relative z-10 h-[300px] overflow-hidden rounded-3xl border-4 border-brand-light shadow-2xl sm:h-[360px] md:h-[500px] md:rounded-[3rem] md:border-8">
            {loading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : (
              displayBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
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
          <div className="absolute -right-1 top-2 z-20 hidden animate-bounce items-center gap-2 rounded-xl bg-white p-3 shadow-2xl sm:-right-3 sm:top-0 sm:flex md:-right-6 md:-top-6 md:gap-3 md:rounded-2xl md:p-4">
            <div className="w-10 h-10 bg-brand-accent/20 rounded-full flex items-center justify-center">
              <Star className="text-brand-accent fill-brand-accent w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900">4.9/5</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
          </div>

          <div className="absolute -bottom-2 left-1 z-20 hidden animate-bounce items-center gap-2 rounded-xl bg-white p-3 shadow-2xl sm:-bottom-3 sm:left-0 sm:flex md:-bottom-6 md:-left-6 md:gap-3 md:rounded-2xl md:p-4">
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
