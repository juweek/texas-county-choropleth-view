import React from 'react';
import { getAssetPath } from '@/utils/paths';

const HeroSection = () => {
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
    <section className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
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
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl text-left text-white">
          <h1 className="text-6xl md:text-6xl font-condensed-bold font-bold mb-8 leading-tight">
            TDIS is here to help
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 font-condensed-light font-light">
          The Texas Disaster Information System (TDIS) is a tool for Texan communities with disaster recovery and mitigation. 
          </p>
          <button 
            onClick={scrollToMap}
            className="bg-custom-blue hover:bg-blue-700 text-white font-condensed-bold font-bold py-4 px-10 rounded-lg transition duration-300 text-lg"
          >
            Is Texas at risk for disaster?
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection; 