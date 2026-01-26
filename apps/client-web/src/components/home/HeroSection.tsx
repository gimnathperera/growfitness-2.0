import { Users, Heart, Trophy, Star } from 'lucide-react';
import { MascotCharacter as CircleImage } from '@/components/ui/mascot-character';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function HeroSection() {
  const stats = [
    { icon: Users, number: '500+', label: 'Happy Kids' },
    {
      icon: Trophy,
      number: '1000+',
      label: 'Achievements',
      iconColor: 'text-accent',
    },
    {
      icon: Star,
      number: '50+',
      label: 'Expert Coaches',
      iconColor: 'text-accent fill-current',
    },
    {
      icon: Heart,
      number: '100%',
      label: 'Fun Guaranteed',
      iconColor: 'text-red-400 fill-current',
    },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <AnimatedButton
            href="/free-session"
            variant="default"
            size="lg"
            leftIcon={Users}
            rightIcon={Heart}
            className="bg-white text-primary hover:bg-accent hover:text-foreground"
            rounded="full"
            headingLevel="h6"
          >
            Book a free session
          </AnimatedButton>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight font-insanibc">
            <span className="inline-block animate-pulse">THE ONLY BAD</span>{' '}
            <span className="inline-block text-accent animate-bounce">
              WORKOUT
            </span>{' '}
            <span className="inline-block">IS THE</span> <br />
            <span className="inline-block text-foreground animate-pulse delay-300">
              ONE THAT DIDN'T
            </span>{' '}
            <span className="inline-block text-accent animate-bounce delay-500">
              HAPPEN.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-black mb-8 max-w-4xl mx-auto leading-relaxed">
            Join GROW Kids Fitness Center where children develop healthy habits,
            build confidence, and have{' '}
            <span className="text-accent font-bold">FUN</span> while staying
            active! 🌟
          </p>
        </div>

        <div className="flex justify-center items-center mb-8 space-x-4 sm:space-x-8">
          <CircleImage
            src="/images/character3.png"
            alt="Mascot 1"
            size="md"
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover"
          />
          <CircleImage
            src="/images/character2.png"
            alt="Mascot 2"
            size="lg"
            withSparkles
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
          />
          <CircleImage
            src="/images/character1.png"
            alt="Mascot 3"
            size="md"
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center transform hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <stat.icon
                  className={`h-8 w-8 ${stat.iconColor || 'text-white'}`}
                />
              </div>
              <div className="text-3xl font-bold text-black">{stat.number}</div>
              <div className="text-black text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}