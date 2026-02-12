export function Footer() {
  const footerSections = [
    {
      title: 'For Parents',
      links: [
        { label: 'Track Progress', href: '/client-dashboard' },
        { label: 'Schedule Sessions', href: '/client-dashboard' },
        { label: 'View Reports', href: '/client-dashboard' },
      ],
    },
    {
      title: 'For Coaches',
      links: [
        { label: 'Manage Classes', href: '/coach-dashboard' },
        { label: 'Student Progress', href: '/coach-dashboard' },
        { label: 'Communication Tools', href: '/coach-dashboard' },
      ],
    },
    {
      title: 'Contact',
      links: [
        {
          label: 'support@growfitness.com',
          href: 'mailto:support@growfitness.com',
        },
        { label: '123 Fitness St, Health City', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-primary/20 py-12 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h1 className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center ml-12 ">
                <img
                  src="/images/logo.png"
                  alt="icon"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-primary">
                Grow Fitness
              </span>
            </h1>
            <p className="text-gray-600">
              Empowering children through fitness and fun activities.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-600">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary/20 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2025 GROW Kids Fitness Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}