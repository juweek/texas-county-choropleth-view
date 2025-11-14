import React from 'react';
import { Card } from '@/components/ui/card';
import { CountyData, DataType } from '@/types/county';
import { Badge } from '@/components/ui/badge';

interface CountyDetailCardProps {
  county: CountyData;
  position: 'fixed' | 'follow-cursor';
  mousePosition?: { x: number; y: number };
  lastUpdated?: string | null;
  activeTab?: DataType;
}

const CountyDetailCard: React.FC<CountyDetailCardProps> = ({ 
  county, 
  position, 
  mousePosition = { x: 0, y: 0 },
  lastUpdated = null,
  activeTab = 'temperature'
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
        if (hazard.phenomenon) return hazard.phenomenon;
        
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

  // Function to extract a displayable string from a hazard object
  const getHazardDisplayText = (hazard: any): string => {
    if (typeof hazard === 'string') return hazard;
    if (hazard && typeof hazard === 'object') {
      // Try to find a meaningful property to display
      if (hazard.event) return hazard.event;
      if (hazard.type) return hazard.type;
      if (hazard.name) return hazard.name;
      if (hazard.description) return hazard.description;
      if (hazard.phenomenon) return hazard.phenomenon;
      
      // If we can't find a good property, try to stringify it
      try {
        return JSON.stringify(hazard);
      } catch (e) {
        return 'Unknown hazard';
      }
    }
    return 'Unknown hazard';
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
  const hasAlerts = county.data?.alerts && county.data.alerts.length > 0;

  // Get badge color for visibility
  const getVisibilityBadgeColor = (meters: number | null) => {
    if (meters === null) return 'bg-gray-400 text-white';
    if (meters < 1000) return 'bg-red-500 text-white';
    if (meters < 5000) return 'bg-orange-500';
    if (meters < 10000) return 'bg-yellow-400';
    return 'bg-green-500 text-white';
  };

  // Get visibility label
  const getVisibilityLabel = (meters: number | null) => {
    if (meters === null) return 'Not available';
    const miles = (meters / 1609.34).toFixed(1);
    if (meters < 1000) return `Very poor (${miles} mi)`;
    if (meters < 5000) return `Poor (${miles} mi)`;
    if (meters < 10000) return `Moderate (${miles} mi)`;
    return `Good (${miles} mi)`;
  };

  // Get precipitation badge color
  const getPrecipitationBadgeColor = (probability: number) => {
    if (probability === 0) return 'bg-white text-black border border-gray-300';
    if (probability <= 20) return 'bg-blue-100 text-blue-800';
    if (probability <= 40) return 'bg-blue-200 text-blue-800';
    if (probability <= 60) return 'bg-blue-300 text-blue-800';
    if (probability <= 80) return 'bg-blue-400 text-white';
    return 'bg-blue-500 text-white';
  };

  // Get temperature category (Fahrenheit) + badge color; bins every 20°F
  const getTemperatureBadge = (celsius: number | null | undefined) => {
    if (celsius === null || celsius === undefined) {
      return { label: 'Not available', className: 'bg-gray-400 text-white' };
    }
    const f = (celsius * 9/5) + 32;
    if (f < 0) return { label: '< 0°F', className: 'bg-[#313695] text-white' };
    if (f < 10) return { label: '0–10°F', className: 'bg-[#3f88bf] text-white' };
    if (f < 20) return { label: '10–20°F', className: 'bg-[#4575b4] text-white' };
    if (f < 30) return { label: '20–30°F', className: 'bg-[#74add1] text-black' };
    if (f < 40) return { label: '30–40°F', className: 'bg-[#abd9e9] text-black' };
    if (f < 50) return { label: '40–50°F', className: 'bg-[#e0f3f8] text-black' };
    if (f < 60) return { label: '50–60°F', className: 'bg-[#ffffbf] text-black' };
    if (f < 70) return { label: '60–70°F', className: 'bg-[#fee090] text-black' };
    if (f < 80) return { label: '70–80°F', className: 'bg-[#fdae61] text-white' };
    if (f < 90) return { label: '80–90°F', className: 'bg-[#f46d43] text-white' };
    if (f < 100) return { label: '90–100°F', className: 'bg-[#d73027] text-white' };
    return { label: '≥ 100°F', className: 'bg-[#7f0000] text-white' };
  };

  return (
    <Card 
      className={`z-10 p-2 max-w-[300px] bg-white/90 backdrop-blur-sm ${position === 'fixed' ? 'absolute' : 'fixed'}`}
      style={positionStyles}
    >
      <h3 className="font-bold text-md">{county.countyName} County</h3>
      <div className="space-y-1 text-xs">
        <p className="flex items-center gap-2">
          <span>Temperature: {county.data.temperature.value !== null && county.data.temperature.value !== undefined ? formatTemperature(county.data.temperature.value) : 'Not available'}</span>
          <Badge className={getTemperatureBadge(county.data.temperature.value).className}>
            {getTemperatureBadge(county.data.temperature.value).label}
          </Badge>
        </p>
        <p>Humidity: {county.data.relativeHumidity.value}%</p>
        
        {/* Always show visibility row */}
        <p>
          Visibility: {' '}
          {activeTab === 'visibility' ? (
            <Badge className={getVisibilityBadgeColor(county.data.visibility.value)}>
              {getVisibilityLabel(county.data.visibility.value)}
            </Badge>
          ) : (
            formatVisibility(county.data.visibility.value)
          )}
        </p>
        
        {/* Hazards shown within Alerts context when no explicit alerts */}
        {activeTab === 'alerts' && (!hasAlerts) && county.data.hazards && county.data.hazards.length > 0 && (
          <div className="mt-3">
            <p className="font-semibold">Hazards:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {county.data.hazards.map((hazard, index) => (
                <Badge key={index} className="bg-[#8b5cf6] text-white">
                  {getHazardDisplayText(hazard)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Only show precipitation probability if it's not 0% */}
        {county.data.probabilityOfPrecipitation.value > 0 && (
          <p>
            Precipitation: {' '}
            {activeTab === 'precipitation' ? (
              <Badge className={getPrecipitationBadgeColor(county.data.probabilityOfPrecipitation.value)}>
                {county.data.probabilityOfPrecipitation.value}%
              </Badge>
            ) : (
              `${county.data.probabilityOfPrecipitation.value}%`
            )}
          </p>
        )}
        
        {/* Alerts section */}
        {hasAlerts && county.data.alerts && (
          <div className="mt-3">
            <p className="font-semibold">Active Alerts:</p>
            {activeTab === 'alerts' ? (
            <div className="mt-1 space-y-2">
              {county.data.alerts.map((alert, index) => (
                <div key={index} className="border-l-2 border-red-500 pl-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity || 'Alert'}
                  </Badge>
                    <p className="font-xs mt-1">{alert.event}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{alert.headline}</p>
                </div>
              ))}
            </div>
            ) : (
              <p>{county.data.alerts.length} active alert(s)</p>
            )}
          </div>
        )}
        {!hasAlerts && activeTab === 'alerts' && (!(county.data.hazards && county.data.hazards.length > 0)) && (
          <div className="mt-3">
            <p className="font-semibold">Alerts:</p>
            <div className="mt-1">
              <Badge className="bg-gray-400 text-white">No Alerts</Badge>
            </div>
          </div>
        )}
        
        {/* Timestamp section */}
        {lastUpdated && (
          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Data last updated: {lastUpdated}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CountyDetailCard;
