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
    <Card className="absolute top-4 left-4 z-10 w-[360px] bg-white/90 backdrop-blur-sm">
      <Tabs defaultValue={dataType} onValueChange={(value) => onDataTypeChange(value as DataType)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="hazards">Hazards</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="temperature" className="pt-4">
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
        
        <TabsContent value="hazards" className="pt-4">
          <Legend 
            title="Hazards" 
            items={[
              { color: '#FF5F5F', label: 'Hazards present' },
              { color: '#64B6FF', label: 'No hazards' }
            ]} 
          />
        </TabsContent>
        
        <TabsContent value="visibility" className="pt-4">
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
        
        <TabsContent value="alerts" className="pt-4">
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
      </Tabs>
    </Card>
  );
};

export default MapControls;
