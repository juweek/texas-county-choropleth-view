import React, { useState } from 'react';
import { CountyData, DataType } from '@/types/county';
import MapContainer from './map/MapContainer';
import MapControls from './map/MapControls';
import CountyDetailCard from './map/CountyDetailCard';

interface TexasMapProps {
  counties: CountyData[];
}

const TexasMap: React.FC<TexasMapProps> = ({ counties }) => {
  const [dataType, setDataType] = useState<DataType>('alerts');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  console.log('Counties in TexasMap:', counties.length, counties.map(c => c.countyName));
  
  // Track mouse position
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };
  
  return (
    <div className="relative h-[calc(100vh-6rem)]" onMouseMove={handleMouseMove}>
      {/* Map Controls */}
      <MapControls 
        dataType={dataType} 
        onDataTypeChange={setDataType} 
      />
      
      {/* County Details Card - for clicked county */}
      {selectedCounty && (
        <CountyDetailCard 
          county={selectedCounty} 
          position="fixed"
        />
      )}
      
      {/* Hover Details Card - follows mouse */}
      {hoveredCounty && !selectedCounty && (
        <CountyDetailCard 
          county={hoveredCounty} 
          position="follow-cursor"
          mousePosition={mousePosition}
        />
      )}
      
      {/* Map Container */}
      <MapContainer 
        counties={counties} 
        dataType={dataType} 
        onCountySelect={setSelectedCounty}
        onCountyHover={setHoveredCounty}
      />
    </div>
  );
};

export default TexasMap;
