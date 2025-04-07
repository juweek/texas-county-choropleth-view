
import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CountyData, DataType } from '@/types/county';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Legend } from '@/components/Legend';
import { normalizeCountyName } from '@/services/countyService';

interface TexasMapProps {
  counties: CountyData[];
}

const TexasMap: React.FC<TexasMapProps> = ({ counties }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [dataType, setDataType] = useState<DataType>('temperature');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  
  // Get color based on data type and value
  const getColor = (county: CountyData) => {
    if (dataType === 'temperature') {
      const temp = county.data.temperature.value;
      if (temp < 0) return '#9EC5FE'; // Cold blue
      if (temp < 10) return '#64B6FF';
      if (temp < 20) return '#FFD166'; // Warm yellow
      if (temp < 30) return '#FF9966'; // Orange
      return '#FF5F5F'; // Hot red
    } else if (dataType === 'hazards') {
      return county.data.hazards.length > 0 ? '#FF5F5F' : '#64B6FF';
    } else if (dataType === 'visibility') {
      const visibility = county.data.visibility.value;
      if (!visibility) return '#9CA3AF'; // Gray for null values
      if (visibility < 1000) return '#FF5F5F'; // Very poor visibility
      if (visibility < 5000) return '#FF9966'; // Poor visibility
      if (visibility < 10000) return '#FFD166'; // Moderate visibility
      return '#64B6FF'; // Good visibility
    }
    return '#9CA3AF'; // Default gray
  };

  // Find county data by name
  const findCountyByName = (name: string): CountyData | undefined => {
    const normalizedName = normalizeCountyName(name);
    return counties.find(county => 
      normalizeCountyName(county.countyName) === normalizedName
    );
  };

  // Generate a fill color expression for maplibre
  const generateFillColorExpression = () => {
    // Create a match expression for maplibre to color counties
    const matchExpression = ['match', ['get', 'NAME']];
    
    // Add each county with its color
    counties.forEach(county => {
      matchExpression.push(county.countyName, getColor(county));
    });
    
    // Default color for counties not in our dataset
    matchExpression.push('#CCCCCC');
    
    return matchExpression;
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-99.5, 31.2], // Center on Texas
      zoom: 5.5
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Load Texas counties GeoJSON from public directory
      fetch('/tx_counties.geojson')
        .then(response => response.json())
        .then(geojsonData => {
          if (!map.current) return;
          
          // Add Texas counties source
          map.current.addSource('texas-counties', {
            type: 'geojson',
            data: geojsonData
          });

          // Add Texas counties fill layer (choropleth)
          map.current.addLayer({
            id: 'texas-counties-fill',
            type: 'fill',
            source: 'texas-counties',
            paint: {
              'fill-color': generateFillColorExpression() as any,
              'fill-opacity': 0.7
            }
          });

          // Add county boundary lines
          map.current.addLayer({
            id: 'texas-counties-line',
            type: 'line',
            source: 'texas-counties',
            paint: {
              'line-color': '#444',
              'line-width': 0.5,
              'line-opacity': 0.8
            }
          });

          // Add Texas state boundary outline
          map.current.addLayer({
            id: 'texas-state-line',
            type: 'line',
            source: 'texas-counties',
            filter: ['==', 'STATE', '48'], // Texas FIPS code
            paint: {
              'line-color': '#000',
              'line-width': 2,
              'line-opacity': 1
            }
          });
          
          // Add click event to show county details
          map.current.on('click', 'texas-counties-fill', (e) => {
            if (e.features && e.features[0] && e.features[0].properties) {
              const props = e.features[0].properties;
              const countyName = props.NAME;
              const countyData = findCountyByName(countyName);
              
              if (countyData) {
                setSelectedCounty(countyData);
              } else {
                // No data for this county
                setSelectedCounty(null);
              }
            }
          });
          
          // Change cursor on hover
          map.current.on('mouseenter', 'texas-counties-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });
          
          map.current.on('mouseleave', 'texas-counties-fill', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
          });
        })
        .catch(error => {
          console.error('Error loading GeoJSON:', error);
        });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [counties]);

  // Update colors when data type changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getSource('texas-counties')) return;
    
    map.current.setPaintProperty(
      'texas-counties-fill', 
      'fill-color', 
      generateFillColorExpression() as any
    );
  }, [dataType, counties]);

  const formatTemperature = (celsius: number) => {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${celsius.toFixed(1)}°C / ${fahrenheit.toFixed(1)}°F`;
  };

  const formatVisibility = (meters: number | null) => {
    if (meters === null) return 'Not available';
    const miles = meters / 1609.34;
    return `${(miles).toFixed(1)} miles`;
  };

  return (
    <div className="relative h-[calc(100vh-6rem)]">
      <Card className="absolute top-4 left-4 z-10 w-[300px] bg-white/90 backdrop-blur-sm">
        <Tabs defaultValue="temperature" onValueChange={(value) => setDataType(value as DataType)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="hazards">Hazards</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
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
        </Tabs>
      </Card>
      
      {selectedCounty && (
        <Card className="absolute bottom-4 right-4 z-10 p-4 max-w-[300px] bg-white/90 backdrop-blur-sm">
          <h3 className="font-bold text-lg">{selectedCounty.countyName} County</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Temperature: {formatTemperature(selectedCounty.data.temperature.value)}</p>
            <p>Humidity: {selectedCounty.data.relativeHumidity.value}%</p>
            <p>Visibility: {formatVisibility(selectedCounty.data.visibility.value)}</p>
            <p>Hazards: {selectedCounty.data.hazards.length ? selectedCounty.data.hazards.join(', ') : 'None'}</p>
            <p>Precipitation Probability: {selectedCounty.data.probabilityOfPrecipitation.value}%</p>
          </div>
        </Card>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default TexasMap;
