import { useEffect, useState } from 'react';
import { Trophy, Users, Heart, Award } from 'lucide-react';
import { testimonialsService } from '@/services/testimonials.service';
import type { Testimonial } from '@grow-fitness/shared-types';
import { TestimonialCard } from '../common/TestimonialCard';

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsService.getTestimonials(1, 10, true);
      setTestimonials(response.data); // ✅ fix paginated structure
    } catch (error) {
      console.error('Failed to fetch testimonials', error);
    } finally {
      setLoading(false);
    }
  };

  const trustStats = [
    {
      icon: Trophy,
      value: '4.9/5',
      label: 'Average Rating',
    },
    {
      icon: Users,
      value: '500+',
      label: 'Happy Families',
    },
    {
      icon: Heart,
      value: '98%',
      label: 'Would Recommend',
    },
    {
      icon: Award,
      value: '2026',
      label: 'Best Kids Fitness',
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-white">

      {/* Decorative Glow Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Parents Are Saying
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from families who experienced the GROW difference 💕
          </p>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="text-center text-gray-500 text-lg">
            Loading testimonials...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
            {testimonials.map((item) => (
              <TestimonialCard
                key={item.id}
                name={item.authorName}
                childName={item.childName}
                childAge={item.childAge}
                membershipDuration={item.membershipDuration}
                testimonial={item.content}
                rating={item.rating}
              />
            ))}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {trustStats.map((stat, index) => (
            <div
              key={index}
              className="group backdrop-blur-xl bg-gradient-to-b from-white via-primary/20 to-accent/20 bg-white/60 border border-white/30 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-7 w-7 text-white" />
              </div>

              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>

              <div className="text-sm text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
