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
      <Tabs value={dataType} onValueChange={(value) => onDataTypeChange(value as DataType)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="temperature" className="font-condensed-bold font-bold">Temperature</TabsTrigger>
          <TabsTrigger value="precipitation" className="font-condensed-bold font-bold">Precipitation</TabsTrigger>
          <TabsTrigger value="visibility" className="font-condensed-bold font-bold">Visibility</TabsTrigger>
          <TabsTrigger value="alerts" className="font-condensed-bold font-bold">Alerts</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-center">
          <TabsContent value="temperature" className="w-full max-w-xl">
            <Legend 
              title="Temperature (°F)" 
              columns={2}
              splitIndex={6}
              items={[
                { color: '#313695', label: '< 0°F' },
                { color: '#3f88bf', label: '0–10°F' },
                { color: '#4575b4', label: '10–20°F' },
                { color: '#74add1', label: '20–30°F' },
                { color: '#abd9e9', label: '30–40°F' },
                { color: '#e0f3f8', label: '40–50°F' },
                { color: '#ffffbf', label: '50–60°F' },
                { color: '#fee090', label: '60–70°F' },
                { color: '#fdae61', label: '70–80°F' },
                { color: '#f46d43', label: '80–90°F' },
                { color: '#d73027', label: '90–100°F' },
                { color: '#7f0000', label: '≥ 100°F' }
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
          
          {/* Hazards merged into Alerts */}
          
          <TabsContent value="visibility" className="w-full max-w-xl">
            <Legend 
              title="Visibility" 
              items={[
                { color: '#22C55E', label: 'Available' },
                { color: '#9CA3AF', label: 'Not available' }
              ]} 
            />
          </TabsContent>
          
          <TabsContent value="alerts" className="w-full max-w-xl">
            <Legend 
              title="Alerts & Hazards" 
              items={[
                { color: '#FF0000', label: 'Severe Alerts' },
                { color: '#FFA500', label: 'Moderate Alerts' },
                { color: '#FFFF00', label: 'Minor Alerts' },
                { color: '#8b5cf6', label: 'Hazards present' },
                { color: '#FFFFFF', label: 'No Alerts/Hazards (no fill)' }
              ]} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MapControls;
