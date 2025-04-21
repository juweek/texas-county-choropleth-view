import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full bg-white shadow-md z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className={`transition-all duration-300 ${scrolled ? 'h-8' : 'h-10'}`}>
            <a href="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="TDIS Logo" 
                className="h-full w-auto" 
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150x50?text=TDIS+Logo';
                }}
              />
              <span className="ml-2 text-xl font-condensed-bold font-bold text-custom-blue">TDIS</span>
            </a>
          </div>

          {/* Navigation Links */}
          <nav className={`transition-all duration-300 ${scrolled ? 'text-sm' : 'text-base'}`}>
            <ul className="flex space-x-6">
              <li>
                <button 
                  onClick={() => scrollToSection('what-we-do')}
                  className="font-condensed-bold font-bold text-gray-600 hover:text-custom-blue transition"
                >
                  What We Do
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('who-works-with-us')}
                  className="font-condensed-bold font-bold text-gray-600 hover:text-custom-blue transition"
                >
                  Who Works With Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('current-risks')}
                  className="font-condensed-bold font-bold text-gray-600 hover:text-custom-blue transition"
                >
                  Current Risk Alerts
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact-us')}
                  className="font-condensed-bold font-bold text-gray-600 hover:text-custom-blue transition"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 