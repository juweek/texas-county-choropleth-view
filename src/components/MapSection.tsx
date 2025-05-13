import React from 'react';
import TexasMap from '@/components/TexasMap';
import { CountyData } from '@/types/county';

interface MapSectionProps {
  counties: CountyData[];
  lastUpdated?: string | null;
}

const MapSection: React.FC<MapSectionProps> = ({ counties, lastUpdated }) => {
  return (
    <section id="map-section" className="py-12 bg-gray-100">
      <div className="container mx-auto px-40 sm:px-20 md:px-40 lg:px-80">
        <h2 className="text-4xl font-condensed-bold font-bold text-center mb-12">Current Risk Alerts in Texas</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
        Explore current weather conditions across the state. Click on a county for detailed information.
        </p>
        <div className="bg-white rounded-lg">
          <TexasMap counties={counties} lastUpdated={lastUpdated} />
        </div>
      </div>
    </section>
  );
};

export default MapSection; 