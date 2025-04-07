
import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CountyData, DataType } from '@/types/county';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Legend } from '@/components/Legend';
import { texasStateBoundary, texasCountyBoundaries } from '@/utils/texasGeoJSON';

interface TexasMapProps {
  counties: CountyData[];
}

const TexasMap: React.FC<TexasMapProps> = ({ counties }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [dataType, setDataType] = useState<DataType>('temperature');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);

  // Convert counties to GeoJSON features for data points
  const createPointsGeoJSON = () => {
    return {
      type: "FeatureCollection" as const,
      features: counties.map((county) => ({
        type: "Feature" as const,
        properties: {
          countyName: county.countyName,
          temperature: county.data.temperature.value,
          hasHazards: county.data.hazards.length > 0,
          visibility: county.data.visibility.value,
          humidity: county.data.relativeHumidity.value,
          data: JSON.stringify(county)
        },
        geometry: {
          type: "Point" as const,
          coordinates: [county.coordinates.longitude, county.coordinates.latitude]
        }
      }))
    };
  };

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

      // Add Texas state boundary
      map.current.addSource('texas-state', {
        type: 'geojson',
        data: texasStateBoundary
      });

      map.current.addLayer({
        id: 'texas-state-line',
        type: 'line',
        source: 'texas-state',
        paint: {
          'line-color': '#000',
          'line-width': 2,
          'line-opacity': 0.7
        }
      });

      // Add Texas county boundaries
      map.current.addSource('texas-counties', {
        type: 'geojson',
        data: texasCountyBoundaries
      });

      map.current.addLayer({
        id: 'texas-counties-line',
        type: 'line',
        source: 'texas-counties',
        paint: {
          'line-color': '#444',
          'line-width': 1,
          'line-opacity': 0.5
        }
      });

      // Add county data points
      const pointsGeoJSON = createPointsGeoJSON();
      
      map.current.addSource('counties', {
        type: 'geojson',
        data: pointsGeoJSON
      });

      map.current.addLayer({
        id: 'county-circles',
        type: 'circle',
        source: 'counties',
        paint: {
          'circle-radius': 15,
          'circle-opacity': 0.7,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
          'circle-color': [
            'match',
            ['get', 'countyName'],
            ...counties.flatMap(county => [county.countyName, getColor(county)]),
            '#AAAAAA' // default color
          ] as maplibregl.CirclePaintProperty['circle-color']
        }
      });

      map.current.addLayer({
        id: 'county-labels',
        type: 'symbol',
        source: 'counties',
        layout: {
          'text-field': ['get', 'countyName'],
          'text-size': 11,
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      });
      
      // Add click event to show county details
      map.current.on('click', 'county-circles', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties as {
            countyName: string;
            data: string;
          };
          
          const countyData = JSON.parse(props.data) as CountyData;
          setSelectedCounty(countyData);
        }
      });
      
      // Change cursor on hover
      map.current.on('mouseenter', 'county-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'county-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [counties]);

  // Update colors when data type changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.setPaintProperty('county-circles', 'circle-color', [
      'match',
      ['get', 'countyName'],
      ...counties.flatMap(county => [county.countyName, getColor(county)]),
      '#AAAAAA' // default color
    ] as maplibregl.CirclePaintProperty['circle-color']);
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

