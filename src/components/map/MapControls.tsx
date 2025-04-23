import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Legend } from '@/components/Legend';
import { DataType } from '@/types/county';

interface MapControlsProps {
  dataType: DataType;
  onDataTypeChange: (value: DataType) => void;
}

const MapControls: React.FC<MapControlsProps> = ({ dataType, onDataTypeChange }) => {
  return (
    <div className="w-full">
      <Tabs defaultValue={dataType} onValueChange={(value) => onDataTypeChange(value as DataType)}>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="temperature" className="font-condensed-bold font-bold">Temperature</TabsTrigger>
          <TabsTrigger value="precipitation" className="font-condensed-bold font-bold">Precipitation</TabsTrigger>
          <TabsTrigger value="hazards" className="font-condensed-bold font-bold">Hazards</TabsTrigger>
          <TabsTrigger value="visibility" className="font-condensed-bold font-bold">Visibility</TabsTrigger>
          <TabsTrigger value="alerts" className="font-condensed-bold font-bold">Alerts</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-center">
          <TabsContent value="temperature" className="w-full max-w-xl">
            <Legend 
              title="Temperature" 
              items={[
                { color: '#9EC5FE', label: 'Below 0°C' },
                { color: '#64B6FF', label: '0-10°C' },
                { color: '#FFD166', label: '10-20°C' },
                { color: '#FF9966', label: '20-30°C' },
                { color: '#FF5F5F', label: 'Above 30°C' }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="precipitation" className="w-full max-w-xl">
            <Legend 
              title="Precipitation Probability" 
              items={[
                { color: '#FFFFFF', label: '0%' },
                { color: '#E6F0FF', label: '1-20%' },
                { color: '#B3D9FF', label: '21-40%' },
                { color: '#80C2FF', label: '41-60%' },
                { color: '#4DA6FF', label: '61-80%' },
                { color: '#1A8CFF', label: '81-100%' }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="hazards" className="w-full max-w-xl">
            <Legend 
              title="Hazards" 
              items={[
                { color: '#FF5F5F', label: 'Hazards present' },
                { color: '#64B6FF', label: 'No hazards' }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="visibility" className="w-full max-w-xl">
            <Legend 
              title="Visibility" 
              items={[
                { color: '#FF5F5F', label: 'Very poor (<1km)' },
                { color: '#FF9966', label: 'Poor (1-5km)' },
                { color: '#FFD166', label: 'Moderate (5-10km)' },
                { color: '#64B6FF', label: 'Good (>10km)' },
                { color: '#9CA3AF', label: 'Data not available' }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="alerts" className="w-full max-w-xl">
            <Legend 
              title="Weather Alerts" 
              items={[
                { color: '#FF0000', label: 'Severe Alerts' },
                { color: '#FFA500', label: 'Moderate Alerts' },
                { color: '#FFFF00', label: 'Minor Alerts' },
                { color: '#64B6FF', label: 'No Alerts' }
              ]} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MapControls;
