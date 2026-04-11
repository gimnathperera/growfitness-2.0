import { useEffect, useState } from 'react';
import type { Banner } from '@grow-fitness/shared-types';
import { bannersService } from '@/services/banners.service';

import { HeroTop } from '@/components/home/HeroTop';
import { MidStats } from '@/components/home/MidStats';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { BottomStatsBar } from '@/components/home/BottomStatsBar';
import { CTASection } from '@/components/home/CTASection';

function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersService.getBanners(1, 10);
        setBanners(response.data);
      } catch (error) {
        // Silently fail or log, but we're moving to a more static layout as per mockup
        console.error('Failed to load banners', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="bg-white">
      {/* 
         Note: HeroBanner is removed for now to match the static hero design 
         in the mockup. If dynamic banners are needed, we can integrate them 
         into the new design later.
      */}
      
      <HeroTop banners={banners} loading={isLoading} />
      <MidStats />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <BottomStatsBar />
      <CTASection />
    </div>
  );
}

export default HomePage;
export { HomePage };
