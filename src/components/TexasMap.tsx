import React, { useState } from 'react';
import { CountyData, DataType } from '@/types/county';
import MapContainer from './map/MapContainer';
import MapControls from './map/MapControls';
import CountyDetailCard from './map/CountyDetailCard';

interface TexasMapProps {
  counties: CountyData[];
  lastUpdated?: string | null;
}

const TexasMap: React.FC<TexasMapProps> = ({ counties, lastUpdated }) => {
  const [dataType, setDataType] = useState<DataType>('alerts');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  console.log('Counties in TexasMap:', counties.length, counties.map(c => c.countyName));
  console.log('Timestamp in TexasMap:', lastUpdated);
  
  // Track mouse position
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };
  
  return (
    <div className="flex flex-col space-y-4 border border-gray-300">
      {/* Map Controls - Full width at the top */}
      <div className="w-full bg-white rounded-sm border-b border-gray-300">
        <MapControls 
          dataType={dataType} 
          onDataTypeChange={setDataType} 
        />
      </div>
      
      {/* Map Container */}
      <div className="relative h-[calc(100vh-12rem)]" onMouseMove={handleMouseMove}>
        {/* County Details Card - for clicked county */}
        {selectedCounty && (
          <CountyDetailCard 
            county={selectedCounty} 
            position="fixed"
            lastUpdated={lastUpdated}
            activeTab={dataType}
          />
        )}
        
        {/* Hover Details Card - follows mouse */}
        {hoveredCounty && !selectedCounty && (
          <CountyDetailCard 
            county={hoveredCounty} 
            position="follow-cursor"
            mousePosition={mousePosition}
            lastUpdated={lastUpdated}
            activeTab={dataType}
          />
        )}
        
        {/* Map Container */}
        <MapContainer 
          counties={counties} 
          dataType={dataType} 
          onCountySelect={setSelectedCounty}
          onCountyHover={setHoveredCounty}
          showStateOutlines={true}
          initialZoom={5}
        />
      </div>
    </div>
  );
};

export default TexasMap;
