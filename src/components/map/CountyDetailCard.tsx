
import React from 'react';
import { Card } from '@/components/ui/card';
import { CountyData } from '@/types/county';

interface CountyDetailCardProps {
  county: CountyData;
}

const CountyDetailCard: React.FC<CountyDetailCardProps> = ({ county }) => {
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
    <Card className="absolute bottom-4 right-4 z-10 p-4 max-w-[300px] bg-white/90 backdrop-blur-sm">
      <h3 className="font-bold text-lg">{county.countyName} County</h3>
      <div className="mt-2 space-y-1 text-sm">
        <p>Temperature: {formatTemperature(county.data.temperature.value)}</p>
        <p>Humidity: {county.data.relativeHumidity.value}%</p>
        <p>Visibility: {formatVisibility(county.data.visibility.value)}</p>
        <p>Hazards: {county.data.hazards.length ? county.data.hazards.join(', ') : 'None'}</p>
        <p>Precipitation Probability: {county.data.probabilityOfPrecipitation.value}%</p>
      </div>
    </Card>
  );
};

export default CountyDetailCard;
