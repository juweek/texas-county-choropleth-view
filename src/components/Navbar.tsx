import React, { useState, useEffect } from 'react';
import { getAssetPath } from '@/utils/paths';

// Define the section IDs for easier reference
const SECTIONS = [
  { id: 'what-we-do', label: 'What We Do' },
  { id: 'who-works-with-us', label: 'Who Works With Us' },
  { id: 'current-risks', label: 'Current Risk Alerts' },
  { id: 'contact-us', label: 'Contact Us' }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled down enough to change the navbar appearance
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }

      // Determine which section is currently in view
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      // Check each section from bottom to top (to handle overlap correctly)
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }

      // Set hero section as active when at the top
      if (scrollPosition < window.innerHeight) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Run once on mount to set initial active section
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setIsMobileMenuOpen(false); // Close mobile menu after clicking
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 px-6 md:px-10 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="container mx-auto px-0">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className={`transition-all duration-300 ${scrolled ? 'h-6' : 'h-8'}`}>
            <a href="/" className="flex items-center">
              <div className={`bg-white rounded-full shadow-md transition-all duration-300 ${
                scrolled ? 'py-2 px-4' : 'py-3 px-5'
              }`}>
                <img 
                  src={getAssetPath('images/tdis-logo.svg')} 
                  alt="TDIS Logo" 
                  className={`w-auto transition-all duration-300 ${
                    scrolled ? 'h-6' : 'h-8'
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150x50?text=TDIS+Logo';
                  }}
                />
              </div>
            </a>
          </div>

          {/* Hamburger Menu Button - Mobile Only */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-custom-blue transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-custom-blue transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 bg-custom-blue transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div 
              className={`bg-custom-blue/90 backdrop-blur-sm rounded-full shadow-md px-6 transition-all duration-300 ${
                scrolled ? 'py-2' : 'py-3'
              }`}
            >
              <ul className="flex space-x-6">
                {SECTIONS.map(section => (
                  <li key={section.id}>
                    <button 
                      onClick={() => scrollToSection(section.id)}
                      className={`font-condensed-bold font-bold transition ${
                        activeSection === section.id 
                          ? 'text-white' 
                          : 'text-white hover:text-gray-600'
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Mobile Navigation Menu */}
          <div 
            className={`fixed top-0 right-0 h-full w-64 bg-custom-blue/95 backdrop-blur-sm transform transition-transform duration-300 ease-in-out md:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="pt-20 px-6">
              <ul className="space-y-4">
                {SECTIONS.map(section => (
                  <li key={section.id}>
                    <button 
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left font-condensed-bold font-bold text-lg transition ${
                        activeSection === section.id 
                          ? 'text-white' 
                          : 'text-white hover:text-gray-600'
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 