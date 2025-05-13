import React, { useEffect, useState, useRef } from 'react';
import { getAssetPath } from '@/utils/paths';

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const videoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Smooth animation loop using requestAnimationFrame
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      // Get current scroll position
      const currentScrollY = window.scrollY;
      
      // Update state with current scroll position
      setScrollY(currentScrollY);
      
      // Apply transforms directly to DOM for smoother animation
      if (videoRef.current) {
        videoRef.current.style.transform = `translate3d(0, ${currentScrollY * 0.5}px, 0)`;
      }
      
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${currentScrollY * 0.2}px, 0)`;
      }
      
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = `translate3d(-50%, ${currentScrollY * -0.3}px, 0)`;
      }
    }
    
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const scrollToMap = () => {
    const mapSection = document.getElementById('map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen pt-24 bg-gradient-to-r from-blue-700 to-indigo-900 overflow-hidden will-change-transform"
    >
      {/* Background Video with Parallax */}
      <div 
        ref={videoRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{ transform: `translate3d(0, ${scrollY * 0.5}px, 0)` }}
      >
        <video 
          className="absolute object-cover w-full h-full"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={getAssetPath('videos/houston-video.mp4')} type="video/mp4" />
          {/* Fallback image if video doesn't load */}
          <img 
            src={getAssetPath('images/placeholder-image.jpg')} 
            alt="Texas landscape" 
            className="absolute object-cover w-full h-full" 
          />
        </video>
        {/* Overlay to make text more readable */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      {/* Content with different parallax speed */}
      <div 
        ref={contentRef}
        className="relative h-full container mx-auto px-4 flex items-center will-change-transform"
        style={{ transform: `translate3d(0, ${scrollY * 0.2}px, 0)` }}
      >
        <div className="max-w-2xl text-left text-white ml-16">
          <h1 className="text-8xl md:text-8xl font-condensed-bold font-bold mb-8 leading-tight">
          Disaster support for a better Texas
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 font-condensed-light font-light">
          TDIS provides tools that empower communities across Texas to prepare, respond, and recover from disasters more effectively.  
          </p>
          <button 
            onClick={scrollToMap}
            className="bg-custom-blue hover:bg-blue-700 text-white font-condensed-bold font-bold py-4 px-10 rounded-full transition duration-300 text-lg"
          >
            Is Texas at risk for disaster?
          </button>
        </div>
      </div>
      
      {/* Scroll indicator with different parallax rate */}
      <div 
        ref={indicatorRef}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce will-change-transform"
        style={{ transform: `translate3d(-50%, ${scrollY * -0.3}px, 0)` }}
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection; 