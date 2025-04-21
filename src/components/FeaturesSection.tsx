import React from 'react';

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-condensed-bold font-bold text-center mb-12">Who works with us?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-condensed-bold font-bold mb-3">Public Sector Employees</h3>
            <p className="text-gray-600">
            TDIS equips emergency managers, city planners, and public officials with powerful tools to make data-informed decisions during all phases of disaster management. 
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-condensed-bold font-bold mb-3">Funders</h3>
            <p className="text-gray-600">
            As a state-level grant provider, your funding supports critical data systems that help communities prepare for and recover from emergencies more effectively. 

            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-condensed-bold font-bold mb-3">Researchers/Academics</h3>
            <p className="text-gray-600">
            TDIS connects academic institutions with real-world challenges, facilitating research that improves disaster science and policy.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-condensed-bold font-bold mb-3">Texans</h3>
            <p className="text-gray-600">
              Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 