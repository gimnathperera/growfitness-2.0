import { Heart } from 'lucide-react';
import { Container } from '../layout/Container';

export const MidStats = () => {
  const stats = [
    { icon: Heart, number: '5+', label: 'Pre-Schoolers & branches' },
    { icon: Heart, number: '75+', label: 'Kids at group sessions' },
    { icon: Heart, number: '20+', label: 'Kids at personal training' },
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
         We Host Sessions Weekly For  <br />
        </h2>
        
        <p className="text-gray-300 text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
          <span className="text-brand-green font-bold">We've been helping kids get fit since 2023. That's why parents like you trust us.</span> 
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 transform hover:rotate-12 transition-transform">
                <stat.icon className="w-8 h-8 text-brand-green" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-insanibc">
                {stat.number}
              </div>
              <div className="text-gray-400 font-medium text-sm leading-relaxed">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-300 text-xl mt-16 max-w-2xl mx-auto leading-relaxed">
          Join GROW Kids Fitness Center where children develop healthy habits, build confidence, and have <span className="text-brand-green font-bold">FUN</span> while staying active!
        </p>
      </Container>
    </section>
  );
};
