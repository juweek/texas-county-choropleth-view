import React, { useState, useEffect, useRef } from 'react';
import { getAssetPath } from '@/utils/paths';

/**
 * ContactFormSection Component
 * 
 * This component displays a contact form with a parallax background effect
 * and animated form elements that fade in and slide up from the bottom
 * as the user scrolls down to this section.
 * 
 * Key features:
 * - Horizontal parallax background effect (matching the FeaturesSection)
 * - Fade-in and slide-up animations for the form and heading
 * - Optimized performance using requestAnimationFrame
 * - Form validation and submission handling
 * - Modern frosted glass UI effect
 */
const ContactFormSection = () => {
  // Form state to track input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  // State to track scroll position
  const [scrollY, setScrollY] = useState(0);
  // State to control form visibility animations
  const [formVisible, setFormVisible] = useState(false);
  
  // Refs for DOM elements we need to manipulate
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
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
   * 3. Triggers form visibility animations when section enters viewport
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
        // Using the same multiplier as FeaturesSection for consistency
        const xOffset = relativeScroll * 0.15;
        
        // Apply the transform using translate3d for GPU acceleration
        bgRef.current.style.transform = `translate3d(${xOffset}px, 0, 0)`;
        
        // Trigger form animation when section comes into view
        // This only happens once (when the section first becomes visible)
        if (!formVisible) {
          setFormVisible(true);
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

  /**
   * Handles form input changes by updating the formData state
   * @param {React.ChangeEvent} e - The change event from the input field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission
   * Currently displays an alert and resets the form
   * In a production app, this would send data to an API
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add actual form submission logic here
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 relative overflow-hidden"
    >
      {/* Background image with parallax effect */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-[150%] h-full will-change-transform -z-10"
        style={{
          backgroundImage: `url(${getAssetPath('images/temp_image_3.jpg')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.2)',
          left: '-25%' // Start with the image shifted left to allow more movement space
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading with fade and slide-up animation */}
        <h2 
          className={`text-4xl font-condensed-bold font-bold text-center mb-12 text-white transition-all duration-1000 transform ${
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Contact Us
        </h2>
        
        {/* Form container with frosted glass effect and fade-in animation */}
        <div 
          className={`max-w-md mx-auto bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-lg transition-all duration-1000 transform ${
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
              />
            </div>
            
            {/* Submit button with custom blue background */}
            <button
              type="submit"
              className="w-full bg-custom-blue text-white py-2 px-4 rounded-md hover:bg-custom-blue/80 transition duration-300 font-condensed-bold font-bold"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection; 