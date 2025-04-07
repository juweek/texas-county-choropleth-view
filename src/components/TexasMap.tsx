import React, { useState } from 'react';
import { CountyData, DataType } from '@/types/county';
import MapContainer from './map/MapContainer';
import MapControls from './map/MapControls';
import CountyDetailCard from './map/CountyDetailCard';

interface TexasMapProps {
  counties: CountyData[];
}

const TexasMap: React.FC<TexasMapProps> = ({ counties }) => {
  const [dataType, setDataType] = useState<DataType>('temperature');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  
  console.log('Counties in TexasMap:', counties.length, counties.map(c => c.countyName));
  
  return (
    <div className="relative h-[calc(100vh-6rem)]">
      {/* Map Controls */}
      <MapControls 
        dataType={dataType} 
        onDataTypeChange={setDataType} 
      />
      
      {/* County Details Card */}
      {selectedCounty && (
        <CountyDetailCard county={selectedCounty} />
      )}
      
      {/* Map Container */}
      <MapContainer 
        counties={counties} 
        dataType={dataType} 
        onCountySelect={setSelectedCounty}
      />
    </div>
  );
};

export default TexasMap;
