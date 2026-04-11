import { Check } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    { text: 'Age-appropriate fitness programs' },
    { text: 'Progress tracking and goal setting' },
    { text: 'Social interaction and teamwork' },
    { text: 'Confidence and self-esteem building' },
  ];

  return (
    <section className="py-24 bg-brand-light/30 relative overflow-hidden" id="about">
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-green/5 rounded-full"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-green/5 rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] p-12 md:p-16 shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-insanibc leading-tight">
              Building Healthy <br />
              <span className="text-brand-green">Habits for Life</span>
            </h2>
            <p className="text-gray-600 text-lg mb-10 max-w-lg leading-relaxed">
              Our programs are designed to create lasting positive changes in your child's life, 
              focusing on both physical ability and mental resilience.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-semibold text-lg">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full flex justify-center">
            {/* You could add a mascot image here or more decorative elements */}
            <div className="relative w-64 h-64 bg-brand-light rounded-full flex items-center justify-center">
               <img src="/images/character1.png" alt="Mascot" className="w-48 h-48 object-contain animate-bounce" />
               <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-pulse">
                 <span className="text-2xl">🌱</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
