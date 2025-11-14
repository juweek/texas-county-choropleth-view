import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CountyData, DataType } from '@/types/county';
import MapContainer from './map/MapContainer';
import MapControls from './map/MapControls';
import CountyDetailCard from './map/CountyDetailCard';

interface TexasMapProps {
  counties: CountyData[];
  lastUpdated?: string | null;
}

const TexasMap: React.FC<TexasMapProps> = ({ counties, lastUpdated }) => {
  // Let user choice persist; compute a smart default from data only if user hasn't changed tabs
  // Always start on Temperature
  const [dataType, setDataType] = useState<DataType>('temperature');
  // Prevent auto-switching on initial data load
  const [userChangedTab, setUserChangedTab] = useState(true);

  const computeDefaultDataType = useCallback((): DataType => {
    if (!counties || counties.length === 0) return 'alerts';
    const hasAlerts = counties.some(c => (c.data.alerts?.length ?? 0) > 0);
    if (hasAlerts) return 'alerts';
    const hasPrecip = counties.some(c => c.data.probabilityOfPrecipitation?.value !== null && c.data.probabilityOfPrecipitation?.value !== undefined);
    if (hasPrecip) return 'precipitation';
    const hasTemp = counties.some(c => c.data.temperature?.value !== null && c.data.temperature?.value !== undefined);
    if (hasTemp) return 'temperature';
    const hasVisibility = counties.some(c => c.data.visibility?.value !== null && c.data.visibility?.value !== undefined);
    if (hasVisibility) return 'visibility';
    const hasHazards = counties.some(c => (c.data.hazards?.length ?? 0) > 0);
    if (hasHazards) return 'alerts';
    return 'alerts';
  }, [counties]);

  // Update default when fresh data arrives unless user already changed tabs
  useEffect(() => {
    if (!userChangedTab) {
      setDataType(computeDefaultDataType());
    }
  }, [computeDefaultDataType, userChangedTab]);
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
          onDataTypeChange={(value) => {
            setUserChangedTab(true);
            setDataType(value);
          }} 
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
