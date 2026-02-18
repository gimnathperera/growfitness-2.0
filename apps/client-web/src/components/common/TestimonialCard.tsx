import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialCardProps {
  name: string;
  initials?: string;
  childName?: string;
  childAge?: number;
  membershipDuration?: string | number;
  testimonial: string;
  rating?: number;
  variant?: 'default' | 'compact';
  avatarGradient?: string;
}

function getInitials(name: string) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function formatMembership(duration?: string | number) {
  if (!duration) return '';

  const months = Number(duration);
  if (isNaN(months)) return duration;

  return `Member for ${months} month${months > 1 ? 's' : ''}`;
}

export function TestimonialCard({
  name,
  initials,
  childName,
  childAge,
  membershipDuration,
  testimonial,
  rating = 5,
  variant = 'default',
  avatarGradient = 'from-primary via-accent to-primary',
}: TestimonialCardProps) {
  const safeRating = Math.min(Math.max(rating, 1), 5);
  const displayInitials = initials || getInitials(name);
  const formattedMembership = formatMembership(membershipDuration);

  const starSize = variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <Card className="group relative overflow-hidden border border-white/20 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl">

      {/* Glow background */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

      <CardContent className={`${variant === 'compact' ? 'p-6' : 'p-8'} text-center`}>

        {/* Quote Icon */}
        <div className="flex justify-center mb-4">
          <Quote className="w-8 h-8 text-primary/30" />
        </div>

        {/* Rating */}
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${starSize} transition-all duration-300 ${
                star <= safeRating
                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] group-hover:scale-110'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Testimonial Text */}
        <p className="text-gray-700 italic leading-relaxed mb-6 text-sm sm:text-base">
          {testimonial}
        </p>

        {/* Divider */}
        <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-accent mx-auto mb-6 rounded-full"></div>

        {/* Avatar */}
        <div className="relative mx-auto mb-4 w-fit">
          <div className="p-[3px] rounded-full bg-gradient-to-r from-primary to-accent">
            <div
              className={`w-14 h-14 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}
            >
              {displayInitials}
            </div>
          </div>
        </div>

        {/* Author Info */}
        <div>
          <p className="font-semibold text-foreground text-base">
            {name}
          </p>

          {childName && (
            <p className="text-sm text-gray-500 mt-1">
              {childName}
              {childAge ? `, age ${childAge}` : ''}
            </p>
          )}

          {formattedMembership && (
            <p className="text-xs text-primary font-medium mt-2 tracking-wide">
              {formattedMembership}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
