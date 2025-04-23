import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { CountyData, DataType } from '@/types/county';
import { findCountyByName, generateFillColorExpression } from './mapUtils';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getAssetPath } from '@/utils/paths';

interface MapContainerProps {
  counties: CountyData[];
  dataType: DataType;
  onCountySelect: (county: CountyData | null) => void;
  onCountyHover: (county: CountyData | null) => void;
  showStateOutlines?: boolean;
  initialZoom?: number;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  counties, 
  dataType,
  onCountySelect,
  onCountyHover,
  showStateOutlines = false,
  initialZoom = 5.5
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/backdrop/style.json?key=n8jpMekOIC6L0dhGpdyS',
      center: [-99.5, 31.2], // Center on Texas
      zoom: initialZoom
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Create a popup but don't add it to the map yet
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      // Variable to track the currently hovered county
      let hoveredCountyId = null;

      // Load US states GeoJSON if showStateOutlines is true
      if (showStateOutlines) {
        fetch(getAssetPath('us_states.geojson'))
          .then(response => response.json())
          .then(geojsonData => {
            if (!map.current) return;
            
            // Add US states source
            map.current.addSource('us-states', {
              type: 'geojson',
              data: geojsonData
            });

            // Add US states outline layer
            map.current.addLayer({
              id: 'us-states-line',
              type: 'line',
              source: 'us-states',
              paint: {
                'line-color': '#777',
                'line-width': 1,
                'line-opacity': 0.8
              }
            });
          })
          .catch(error => {
            console.error('Error loading US states GeoJSON:', error);
          });
      }

      // Load Texas counties GeoJSON from public directory
      fetch(getAssetPath('tx_counties.geojson'))
        .then(response => response.json())
        .then(geojsonData => {
          if (!map.current) return;
          
          // Add Texas counties source
          map.current.addSource('texas-counties', {
            type: 'geojson',
            data: geojsonData
          });

          // Add a background dimming layer for non-Texas areas
          map.current.addLayer({
            id: 'non-texas-dimmer',
            type: 'background',
            paint: {
              'background-color': '#ffffff',
              'background-opacity': 0.7
            }
          });

          // Add Texas counties fill layer (choropleth)
          map.current.addLayer({
            id: 'texas-counties-fill',
            type: 'fill',
            source: 'texas-counties',
            paint: {
              'fill-color': generateFillColorExpression(counties, dataType) as any,
              'fill-opacity': [
                'case',
                ['boolean', ['==', ['get', 'COUNTY'], ['literal', hoveredCountyId]], false],
                0.9, // Hovered county opacity
                0.7  // Normal opacity
              ]
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

          // Add hover effect layer
          map.current.addLayer({
            id: 'texas-counties-hover',
            type: 'line',
            source: 'texas-counties',
            paint: {
              'line-color': '#fff',
              'line-width': 2,
              'line-opacity': [
                'case',
                ['boolean', ['==', ['get', 'COUNTY'], ['literal', hoveredCountyId]], false],
                1,
                0
              ]
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
          
          // Handle mousemove over the counties layer
          map.current.on('mousemove', 'texas-counties-fill', (e) => {
            if (!map.current || !e.features || !e.features[0]) return;
            
            // Change cursor
            map.current.getCanvas().style.cursor = 'pointer';
            
            // Get the county ID
            const countyId = e.features[0].properties.COUNTY;
            
            // If we're entering a new county
            if (hoveredCountyId !== countyId) {
              // Update hover state
              hoveredCountyId = countyId;
              
              // Update the filter for the hover effect
              map.current.setFilter('texas-counties-hover', ['==', 'COUNTY', hoveredCountyId]);
              
              // Update the fill opacity expression
              map.current.setPaintProperty('texas-counties-fill', 'fill-opacity', [
                'case',
                ['boolean', ['==', ['get', 'COUNTY'], ['literal', hoveredCountyId]], false],
                0.9, // Hovered county opacity
                0.7  // Normal opacity
              ]);
              
              // Get county data for popup
              const props = e.features[0].properties;
              const countyName = props.COUNTY.replace(' County', '');
              const countyData = findCountyByName(counties, countyName);
              
              // Update the hovered county in parent component
              if (countyData) {
                onCountyHover(countyData);
              }
              
              // Create popup content
              let popupContent = `<strong>${props.COUNTY}</strong>`;
              if (countyData) {
                if (dataType === 'temperature') {
                  popupContent += `<br>Temperature: ${countyData.data.temperature.value.toFixed(1)}°C`;
                } else if (dataType === 'visibility') {
                  const visibility = countyData.data.visibility.value;
                  popupContent += `<br>Visibility: ${visibility ? (visibility / 1609.34).toFixed(1) + ' miles' : 'Not available'}`;
                } else if (dataType === 'hazards') {
                  const hazards = countyData.data.hazards;
                  popupContent += `<br>Hazards: ${hazards.length > 0 ? hazards.join(', ') : 'None'}`;
                } else if (dataType === 'alerts') {
                  const alerts = countyData.data.alerts || [];
                  popupContent += `<br>Alerts: ${alerts.length > 0 ? alerts.length + ' active' : 'None'}`;
                }
              } else {
                popupContent += '<br>No data available';
              }
              
              // Position the popup at the cursor
              popup.setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map.current);
            } else {
              // Just update the popup position if we're still in the same county
              popup.setLngLat(e.lngLat);
            }
          });
          
          // Handle mouseleave from the counties layer
          map.current.on('mouseleave', 'texas-counties-fill', () => {
            if (!map.current) return;
            
            // Reset cursor
            map.current.getCanvas().style.cursor = '';
            
            // Reset hover state
            hoveredCountyId = null;
            
            // Reset the filter
            map.current.setFilter('texas-counties-hover', ['==', 'COUNTY', '']);
            
            // Reset the fill opacity
            map.current.setPaintProperty('texas-counties-fill', 'fill-opacity', 0.7);
            
            // Remove popup
            popup.remove();
            
            // Clear hovered county
            onCountyHover(null);
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
  }, [counties, dataType, onCountySelect, onCountyHover, showStateOutlines, initialZoom]);

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
