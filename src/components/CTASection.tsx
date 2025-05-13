import React from 'react';

const CTASection = () => {
  return (
    <section className="py-16 bg-custom-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-condensed-bold font-bold text-center mb-12">Want to stay aware of TDIS activities?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
        Sign up for our email list to receive important updates.
        </p>
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-grow px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 