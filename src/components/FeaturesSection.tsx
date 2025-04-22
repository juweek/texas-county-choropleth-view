import React, { useEffect, useRef, useState } from 'react';
import { getAssetPath } from '@/utils/paths';

const FeaturesSection = () => {
  const [scrollY, setScrollY] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  // Calculate when the section is in viewport
  const isInViewport = () => {
    if (!sectionRef.current) return false;
    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return (
      rect.top <= windowHeight * 0.75 && 
      rect.bottom >= 0
    );
  };

  // Smooth animation loop using requestAnimationFrame
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      // Get current scroll position
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Apply horizontal parallax only when section is in viewport
      if (bgRef.current && isInViewport()) {
        const sectionTop = sectionRef.current?.offsetTop || 0;
        const relativeScroll = currentScrollY - sectionTop + window.innerHeight;
        const xOffset = relativeScroll * 0.05; // Adjust speed as needed
        
        bgRef.current.style.transform = `translate3d(${xOffset}px, 0, 0)`;
        
        // Trigger card animations when section comes into view
        if (!cardsVisible) {
          setCardsVisible(true);
        }
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

  return (
    <section 
      ref={sectionRef}
      className="py-16 relative overflow-hidden"
    >
      {/* Background image with parallax effect */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-[120%] h-full will-change-transform -z-10"
        style={{
          backgroundImage: `url(${getAssetPath('images/temp_image_3.jpg')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }}
      ></div>
      
      <div className="container mx-auto px-4 md:px-10 lg:px-16 relative z-10">
        <h2 
          className={`text-5xl font-condensed-bold font-bold mb-12 text-white md:text-left transition-all duration-1000 transform ${
            cardsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          Who works with us?
        </h2>
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8 max-w-2xl"
        >
          {[
            {
              title: "Public Sector Employees",
              description: "TDIS equips emergency managers, city planners, and public officials with powerful tools to make data-informed decisions during all phases of disaster management."
            },
            {
              title: "Funders",
              description: "As a state-level grant provider, your funding supports critical data systems that help communities prepare for and recover from emergencies more effectively."
            },
            {
              title: "Researchers/Academics",
              description: "TDIS connects academic institutions with real-world challenges, facilitating research that improves disaster science and policy."
            },
            {
              title: "Texans",
              description: "Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis."
            }
          ].map((card, index) => (
            <div 
              key={index}
              className={`bg-custom-blue bg-opacity-30 p-6 rounded-lg shadow-md backdrop-blur-sm transition-all duration-1000 transform ${
                cardsVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-10'
              }`}
              style={{ 
                transitionDelay: `${index * 200}ms`
              }}
            >
              <h3 className="text-xl font-condensed-bold font-bold mb-3 text-white">
                {card.title}
              </h3>
              <p className="text-gray-700 text-sm text-white">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 