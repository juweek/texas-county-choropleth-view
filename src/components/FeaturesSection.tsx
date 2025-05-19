import React, { useEffect, useRef, useState } from 'react';
import { getAssetPath } from '@/utils/paths';

/**
 * FeaturesSection Component
 * 
 * This component displays information about who works with TDIS with a parallax
 * background effect and animated cards that fade in and slide in from the left
 * as the user scrolls down to this section.
 * 
 * Key features:
 * - Horizontal parallax background effect
 * - Staggered fade-in and slide-in animations for cards
 * - Optimized performance using requestAnimationFrame
 * - Animations only trigger when the section is in viewport
 */
const FeaturesSection = () => {
  // State to track scroll position
  const [scrollY, setScrollY] = useState(0);
  // State to control card visibility animations
  const [cardsVisible, setCardsVisible] = useState(false);
  
  // Refs for DOM elements we need to manipulate
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  // Refs for animation frame handling
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  /**
   * Checks if the section is currently visible in the viewport
   * We use this to trigger animations only when the section comes into view
   * and to optimize by only applying parallax when visible
   * 
   * @returns {boolean} Whether the section is visible in the viewport
   */
  const isInViewport = () => {
    if (!sectionRef.current) return false;
    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Consider the section "in view" when it's 75% into the viewport
    // This creates a better user experience by starting animations slightly earlier
    return (
      rect.top <= windowHeight * 0.75 && 
      rect.bottom >= 0
    );
  };

  /**
   * Main animation loop using requestAnimationFrame for smooth performance
   * This function:
   * 1. Updates scroll position state
   * 2. Applies parallax transform to the background
   * 3. Triggers card visibility animations when section enters viewport
   * 
   * Using requestAnimationFrame ensures animations run at 60fps and are 
   * properly synchronized with the browser's render cycle
   * 
   * @param {number} time - The current timestamp (provided by requestAnimationFrame)
   */
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      // Get current scroll position
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Apply horizontal parallax only when section is in viewport
      if (bgRef.current && isInViewport()) {
        // Calculate the relative scroll position within this section
        const sectionTop = sectionRef.current?.offsetTop || 0;
        const relativeScroll = currentScrollY - sectionTop + window.innerHeight;
        
        // Apply horizontal parallax (move background right as user scrolls down)
        // Increased multiplier from 0.05 to 0.15 for more dramatic movement
        const xOffset = relativeScroll * 0.15;
        
        // Apply the transform using translate3d for GPU acceleration
        bgRef.current.style.transform = `translate3d(${xOffset}px, 0, 0)`;
        
        // Trigger card animations when section comes into view
        // This only happens once (when the section first becomes visible)
        if (!cardsVisible) {
          setCardsVisible(true);
        }
      }
    }
    
    // Store the current time for the next frame
    previousTimeRef.current = time;
    // Request the next animation frame to continue the loop
    requestRef.current = requestAnimationFrame(animate);
  };

  /**
   * Sets up the animation loop when the component mounts
   * and cleans it up when the component unmounts
   * 
   * This ensures we don't have memory leaks or unnecessary
   * animations running when the component isn't visible
   */
  useEffect(() => {
    // Start the animation loop
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup function that runs when component unmounts
    return () => {
      // Cancel any pending animation frames
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Card data for mapping over in the render
  const cardData = [
    {
      title: "Public Sector Employees",
      description: "TDIS equips emergency managers, city planners, and public officials with powerful tools to make data-informed decisions during all phases of disaster management.",
      icon: getAssetPath('images/public-sector-icon.svg')
    },
    {
      title: "Funders",
      description: "As a state-level grant provider, your funding supports critical data systems that help communities prepare for and recover from emergencies more effectively.",
      icon: getAssetPath('images/funders-icon.svg')
    },
    {
      title: "Researchers/Academics",
      description: "TDIS connects academic institutions with real-world challenges, facilitating research that improves disaster science and policy.",
      icon: getAssetPath('images/research-icon.svg')
    },
    {
      title: "Texans",
      description: "Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis.",
      icon: getAssetPath('images/texans-icon.svg')
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-16 relative overflow-hidden"
    >
      {/* Background image with parallax effect */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-[200%] h-full will-change-transform -z-10"
        style={{
          backgroundImage: `url(${getAssetPath('images/temp_image_3.jpg')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3)',
          left: '-50%' // Adjusted to match the wider width
        }}
      ></div>
      
      <div className="container mx-auto px-12 md:px-10 lg:px-24 relative z-10">
        {/* Title with fade and slide-in animation */}
        <h2 
          className={`text-5xl font-condensed-bold font-bold mb-12 text-white md:text-left transition-all duration-1000 transform ${
            cardsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          Who works with us?
        </h2>
        
        {/* Card grid with staggered animations */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 gap-8 max-w-2xl"
        >
          {cardData.map((card, index) => (
            <div 
              key={index}
              className={`bg-custom-blue bg-opacity-30 p-6 rounded-lg shadow-md backdrop-blur-sm transition-all duration-1000 transform ${
                cardsVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-10'
              }`}
              style={{ 
                // Stagger the animations with 200ms delay between each card
                transitionDelay: `${index * 200}ms`
              }}
            >
              <div className="mb-4">
                <img 
                  src={card.icon} 
                  alt={`${card.title} icon`}
                  className="w-12 h-12 brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48?text=Icon';
                  }}
                />
              </div>
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