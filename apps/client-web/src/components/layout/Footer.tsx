import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

const logo = "/Grow Logo Versions-01.svg";

export function Footer() {
  const contactLinks = [
    {
      label: 'growfitnesslk@gmail.com',
      href: 'mailto:growfitnesslk@gmail.com',
      icon: Mail,
    },
    {
      label: '0770569954',
      href: 'tel:0770569954',
      icon: Phone,
    },
    {
      label: 'Maharagama, Sri Lanka',
      href: '#',
      icon: MapPin,
    },
  ];

  const socialLinks = [
    { Icon: Facebook, href: 'https://www.facebook.com/grow.fitness.lk' },
    { Icon: Instagram, href: 'https://www.instagram.com/growfitnesslk' },
    { Icon: Linkedin, href: 'https://www.linkedin.com/company/grow-fitnesslk/' },
    { Icon: Youtube, href: 'https://youtube.com/@growfitnesslk' },
  ];

  return (
    <footer className="bg-brand-dark text-white py-20 border-t border-white/5">
      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-6">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="bg-white p-2 rounded-2xl transition-transform group-hover:scale-110">
                <img src={logo} alt="Grow Fitness" className="h-10 w-auto" />
              </div>
              <span className="text-2xl font-bold font-insanibc">
                <span className="text-white">GrowFitness</span>
              </span>
            </Link>

            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Empowering children through fitness and fun activities. Building healthy habits for a lifetime.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-green hover:border-brand-green transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 lg:col-start-9">
            <h3 className="font-bold text-white text-lg mb-8 uppercase tracking-widest">
              Contact
            </h3>

            <ul className="space-y-4">
              {contactLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-brand-green transition-colors flex items-center gap-3 group"
                  >
                    <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GROW Kids Fitness Center. All rights reserved.
          </p>

          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export function DashboardFooter() {
  return (
    <footer className="border-t border-border/60 bg-background px-6 py-4">
      <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} GrowFitness</p>
        <p>Dashboard for coaches and parents</p>
      </div>
    </footer>
  );
}