import { Heart, Users, Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MascotCharacter as CircleImage } from '@/components/ui/mascot-character';
import { Container } from '../layout/Container';

export function FeaturesSection() {
  const features = [
    {
      icon: Heart,
      title: 'Fun & Engaging',
      description:
        'Interactive workouts and games designed specifically for children to make fitness enjoyable and sustainable 🎮',
      bgColor: 'bg-brand-light',
      iconColor: 'text-brand-green',
    },
    {
      icon: Users,
      title: 'Parent Dashboard',
      description:
        "Track your child's progress, schedule sessions, and communicate with coaches all in one place 📊",
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: Trophy,
      title: 'Expert Coaches',
      description:
        'Certified fitness professionals specialized in child development and age-appropriate training methods 🏆',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <section className="py-24 bg-white relative" id="programs">
      <Container>
        <div className="text-center mb-20">
          <div className="w-12 h-1 bg-brand-green mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed italic text-lg">
            "We provide a comprehensive platform for kids fitness with
            specialized tools for parents and coaches"
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group text-center"
            >
              <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-6 transition-transform`}>
                <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
              </div>
              <h3 className="text-gray-900 text-2xl font-bold mb-4 font-insanibc">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}