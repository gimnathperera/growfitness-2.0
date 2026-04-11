import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

const logo = "/Grow Logo Versions-01.svg";

export function Footer() {
  const footerSections = [
    {
      title: 'For Parents',
      links: [
        { label: 'Track Progress', href: '#' },
        { label: 'Schedule Sessions', href: '#' },
        { label: 'View Reports', href: '#' },
      ],
    },
    {
      title: 'For Coaches',
      links: [
        { label: 'Manage Classes', href: '#' },
        { label: 'Student Progress', href: '#' },
        { label: 'Communication Tools', href: '#' },
      ],
    },
    {
      title: 'Contact',
      links: [
        {
          label: 'support@growfitness.com',
          href: 'mailto:support@growfitness.com',
          icon: Mail
        },
        { 
          label: '123 Fitness St, Health City', 
          href: '#',
          icon: MapPin
        },
      ],
    },
  ];

  return (
    <footer className="bg-brand-dark text-white py-20 border-t border-white/5">
      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="bg-white p-2 rounded-2xl transition-transform group-hover:scale-110">
                <img
                  src={logo}
                  alt="Grow Fitness"
                  className="h-10 w-auto"
                />
              </div>
              <span className="text-2xl font-bold font-insanibc">
                Grow<span className="text-brand-green">Fitness</span>
              </span>
            </Link>
            <p className="text-gray-400 text-lg mb-8 max-w-sm">
              Empowering children through fitness and fun activities. 
              Building healthy habits for a lifetime.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-green hover:border-brand-green transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-2">
              <h3 className="font-bold text-white text-lg mb-8 uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-brand-green transition-colors flex items-center gap-3 group"
                    >
                      {link.icon && <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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