import React from 'react';

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src="/placeholder-image.jpg" alt="How it works" className="rounded-lg shadow-md" />
          </div>
          <div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">1. Select a County</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.
              </p>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">2. View Weather Data</h3>
              <p className="text-gray-600">
                Nullam quis risus eget urna mollis ornare vel eu leo. Cras mattis consectetur purus sit amet fermentum.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">3. Track Changes Over Time</h3>
              <p className="text-gray-600">
                Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 