import { Users, Trophy, Star, Heart } from 'lucide-react';
import { Container } from '../layout/Container';

export const MidStats = () => {
  const stats = [
    { icon: Users, number: '362+', label: 'Happy Kids' },
    { icon: Trophy, number: '575+', label: 'Achievements' },
    { icon: Star, number: '19+', label: 'Expert Coaches' },
    { icon: Heart, number: '100%', label: 'Fun Guaranteed' },
  ];

  return (
    <section className="bg-brand-dark py-24 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white rounded-full"></div>
      </div>

      <Container className="text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-wider font-insanibc leading-tight">
          THE ONLY BAD WORKOUT <br />
          IS THE ONE THAT <span className="text-brand-green">DIDN'T HAPPEN.</span>
        </h2>
        
        <p className="text-gray-300 text-lg mb-16 max-w-2xl mx-auto">
          Join GROW Kids Fitness Center where children develop healthy habits, 
          build confidence, and have <span className="text-brand-green font-bold">FUN</span> while staying active!
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 transform hover:rotate-12 transition-transform">
                <stat.icon className="w-8 h-8 text-brand-green" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-insanibc">
                {stat.number}
              </div>
              <div className="text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
