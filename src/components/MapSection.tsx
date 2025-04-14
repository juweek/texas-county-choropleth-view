import React from 'react';
import TexasMap from '@/components/TexasMap';
import { CountyData } from '@/types/county';

interface MapSectionProps {
  counties: CountyData[];
}

const MapSection: React.FC<MapSectionProps> = ({ counties }) => {
  return (
    <section id="map-section" className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Texas Weather Map</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          Explore current weather conditions across all 254 counties in Texas. Click on any county for detailed information.
        </p>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <TexasMap counties={counties} />
        </div>
      </div>
    </section>
  );
};

export default MapSection; 