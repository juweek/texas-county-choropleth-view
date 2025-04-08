import React from 'react';
import { Card } from '@/components/ui/card';
import { CountyData } from '@/types/county';
import { Badge } from '@/components/ui/badge';

interface CountyDetailCardProps {
  county: CountyData;
  position: 'fixed' | 'follow-cursor';
  mousePosition?: { x: number; y: number };
}

const CountyDetailCard: React.FC<CountyDetailCardProps> = ({ 
  county, 
  position, 
  mousePosition = { x: 0, y: 0 } 
}) => {
  const formatTemperature = (celsius: number) => {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${celsius.toFixed(1)}°C / ${fahrenheit.toFixed(1)}°F`;
  };

  const formatVisibility = (meters: number | null) => {
    if (meters === null) return 'Not available';
    const miles = meters / 1609.34;
    return `${(miles).toFixed(1)} miles`;
  };

  // Format hazards properly
  const formatHazards = (hazards: any[]) => {
    if (!hazards || hazards.length === 0) return 'None';
    
    // If hazards are objects with a property like 'event' or 'type', extract that
    return hazards.map(hazard => {
      if (typeof hazard === 'string') return hazard;
      if (hazard && typeof hazard === 'object') {
        // Try to find a meaningful property to display
        if (hazard.event) return hazard.event;
        if (hazard.type) return hazard.type;
        if (hazard.name) return hazard.name;
        if (hazard.description) return hazard.description;
        
        // If we can't find a good property, try to stringify it
        try {
          return JSON.stringify(hazard);
        } catch (e) {
          return 'Unknown hazard';
        }
      }
      return 'Unknown hazard';
    }).join(', ');
  };

  // Get severity color for alerts
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'bg-red-700 text-white';
      case 'severe':
        return 'bg-red-500 text-white';
      case 'moderate':
        return 'bg-orange-500';
      case 'minor':
        return 'bg-yellow-400';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  // Calculate position styles based on mode
  const positionStyles = position === 'fixed' 
    ? { bottom: '1rem', right: '1rem' } 
    : { 
        position: 'fixed' as const,
        left: `${mousePosition.x + 15}px`, 
        top: `${mousePosition.y + 15}px`,
        transform: 'none'
      };

  // Check if county has alerts
  const hasAlerts = county.data.alerts && county.data.alerts.length > 0;

  return (
    <Card 
      className={`z-10 p-4 max-w-[300px] bg-white/90 backdrop-blur-sm ${position === 'fixed' ? 'absolute' : 'fixed'}`}
      style={positionStyles}
    >
      <h3 className="font-bold text-lg">{county.countyName} County</h3>
      <div className="mt-2 space-y-1 text-sm">
        <p>Temperature: {formatTemperature(county.data.temperature.value)}</p>
        <p>Humidity: {county.data.relativeHumidity.value}%</p>
        <p>Visibility: {formatVisibility(county.data.visibility.value)}</p>
        <p>Hazards: {formatHazards(county.data.hazards)}</p>
        <p>Precipitation Probability: {county.data.probabilityOfPrecipitation.value}%</p>
        
        {/* Alerts section */}
        {hasAlerts && (
          <div className="mt-3">
            <p className="font-semibold">Active Alerts:</p>
            <div className="mt-1 space-y-2">
              {county.data.alerts.map((alert, index) => (
                <div key={index} className="border-l-2 border-red-500 pl-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity || 'Alert'}
                  </Badge>
                  <p className="font-medium mt-1">{alert.event}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.headline}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CountyDetailCard;
