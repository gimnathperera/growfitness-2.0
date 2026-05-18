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
    <section className="relative overflow-hidden bg-white pb-8 pt-16 sm:pb-12 sm:pt-20 md:pb-16 md:pt-24 lg:pb-20 lg:pt-32">
      {/* Decorative background elements */}
      <div className="absolute -left-2 top-16 -z-10 h-16 w-16 animate-pulse rounded-full bg-brand-light opacity-50 sm:left-10 sm:top-20 sm:h-24 sm:w-24"></div>
      <div className="absolute bottom-6 right-1/2 -z-10 h-12 w-12 animate-bounce rounded-full bg-brand-light opacity-30 sm:bottom-10 sm:h-16 sm:w-16"></div>

      <Container className="flex flex-col items-center gap-6 sm:gap-8 md:gap-10 lg:flex-row lg:items-center lg:gap-12">
        {/* Left Content */}
        <div className="w-full flex-1 text-left">
          <div className="mb-3 sm:mb-4 md:mb-5 inline-flex items-center gap-2 rounded-full bg-brand-light px-2 py-1.5 text-[10px] font-bold text-brand-green sm:px-3 sm:py-2 sm:text-xs md:px-4 md:py-2 sm:text-sm">
            <span className="animate-pulse">✨</span> Sri Lanka's #1 Kids Fitness Program
          </div>

          <h1 className="mb-3 sm:mb-4 md:mb-5 lg:mb-6 font-insanibc text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            <span className="text-brand-green">Childhood used to happen
              outside</span> <br />
            now it happens on screens.
          </h1>

          <p className="mb-5 sm:mb-6 md:mb-8 lg:mb-10 max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
            Grow Fitness helps kids fall in love with <span className="text-brand-black font-bold">physical activity</span>. So we can bring back the <span className="text-brand-green font-bold">lifelong</span> healthy habits.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <AnimatedButton
              href="/free-session"
              variant="default"
              size="lg"
              className="rounded-full bg-brand-green px-4 py-2.5 text-sm text-white shadow-xl hover:bg-brand-dark sm:px-6 sm:py-4 sm:text-base md:px-8 md:py-6 md:text-lg hover:text-white"
              rightIcon={ArrowRight}
            >
              Enroll Your Child
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
          <div className="relative z-10 h-[200px] overflow-hidden rounded-2xl border-2 border-brand-light shadow-2xl sm:h-[280px] sm:rounded-3xl sm:border-4 md:h-[400px] md:rounded-[3rem] md:border-8 lg:h-[500px]">
            {loading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : (
              displayBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex
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
