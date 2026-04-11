import { Star, Users, Heart, Award } from 'lucide-react';

export const BottomStatsBar = () => {
  const trustStats = [
    {
      icon: Star,
      value: '4.9/5',
      label: 'Average Rating',
    },
    {
      icon: Users,
      value: '367+',
      label: 'Happy Families',
    },
    {
      icon: Heart,
      value: '97%',
      label: 'Would Recommend',
    },
    {
      icon: Award,
      value: '814',
      label: 'Best Kids Fitness',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            {trustStats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-3xl font-bold text-gray-900 mb-1 font-insanibc">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
