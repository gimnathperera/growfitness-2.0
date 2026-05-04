import { useEffect, useState } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialsService } from '@/services/testimonials.service';
import type { Testimonial } from '@grow-fitness/shared-types';
import { Container } from '../layout/Container';

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsService.getTestimonials(1, 10, true);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Failed to fetch testimonials', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const mascotPlaceholders = [
    "/images/character1.png",
    "/images/character2.png",
    "/images/character3.png",
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-brand-light/20">
      <Container className="relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-insanibc">
            What Parents Are <span className="text-brand-green">Saying</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto italic leading-relaxed">
            "Real stories from families who experienced the GROW difference 💕"
          </p>
        </div>

        {/* Testimonials Grid/Carousel Container */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500 text-lg animate-pulse">
              Loading testimonials...
            </div>
          ) : (
            <div className="relative group">
              {testimonials.length > 0 ? (
                <div className="relative">
                  {testimonials.map((item, index) => (
                    <div
                      key={item.id}
                      className={`transition-all duration-700 ${
                        index === activeIndex 
                          ? 'opacity-100 translate-x-0 relative z-10' 
                          : 'opacity-0 translate-x-8 absolute inset-0 z-0 pointer-events-none'
                      }`}
                    >
                      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-10 items-center">
                        <div className="relative">
                          <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-4 border-brand-light rotate-3">
                            <img 
                              src={item.authorAvatar || mascotPlaceholders[index % mascotPlaceholders.length]} 
                              alt={item.authorName} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-6 h-6 ${i < (item.rating || 5) ? 'text-brand-accent fill-brand-accent' : 'text-gray-200'}`} 
                              />
                            ))}
                          </div>
                          
                          <p className="text-xl md:text-2xl text-gray-800 font-medium mb-8 leading-relaxed italic">
                            "{item.content}"
                          </p>
                          
                          <div>
                            <div className="font-bold text-xl text-gray-900 font-insanibc">{item.authorName}</div>
                            <div className="text-gray-500 font-medium">
                              {item.childName}, age {item.childAge}
                            </div>
                            <div className="text-brand-green font-bold text-sm tracking-widest uppercase mt-1">
                              Member for {item.membershipDuration}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No testimonials yet. Be the first to share your story!
                </div>
              )}
              
              {/* Carousel Controls */}
              {testimonials.length > 1 && (
                <div className="flex justify-center items-center gap-6 mt-12">
                  <button 
                    onClick={prevTestimonial}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-green hover:text-brand-green transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`transition-all duration-300 rounded-full ${
                          i === activeIndex ? 'w-8 h-3 bg-brand-green' : 'w-3 h-3 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={nextTestimonial}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-green hover:text-brand-green transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
