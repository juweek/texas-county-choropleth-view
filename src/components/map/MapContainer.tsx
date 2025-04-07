import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { CountyData, DataType } from '@/types/county';
import { findCountyByName, generateFillColorExpression } from './mapUtils';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapContainerProps {
  counties: CountyData[];
  dataType: DataType;
  onCountySelect: (county: CountyData | null) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  counties, 
  dataType,
  onCountySelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

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
              'fill-color': generateFillColorExpression(counties, dataType) as any,
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
              const countyName = props.COUNTY.replace(' County', '');
              const countyData = findCountyByName(counties, countyName);
              
              if (countyData) {
                onCountySelect(countyData);
              } else {
                // No data for this county
                onCountySelect(null);
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
  }, [counties, dataType, onCountySelect]);

  // Update colors when data type changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getSource('texas-counties')) return;
    
    map.current.setPaintProperty(
      'texas-counties-fill', 
      'fill-color', 
      generateFillColorExpression(counties, dataType) as any
    );
  }, [dataType, counties]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapContainer;
