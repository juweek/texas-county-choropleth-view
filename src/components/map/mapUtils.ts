import { CountyData, DataType } from '@/types/county';
import { normalizeCountyName } from '@/services/countyService';

// Get color based on data type and value
export const getColor = (county: CountyData, dataType: DataType): string => {
  if (dataType === 'temperature') {
    const temp = county.data.temperature.value;
    if (temp < 0) return '#9CA3AF'; // Cold blue
    if (temp < 10) return '#F7FCFD';
    if (temp < 20) return '#FFD166'; // Warm yellow
    if (temp < 30) return '#FF9966'; // Orange
    return '#FF5F5F'; // Hot red
  } else if (dataType === 'precipitation') {
    const precipProbability = county.data.probabilityOfPrecipitation.value;
    if (precipProbability === 0) return '#FFFFFF'; // White for 0%
    if (precipProbability <= 20) return '#E6F0FF'; // Very light blue
    if (precipProbability <= 40) return '#B3D9FF'; // Light blue
    if (precipProbability <= 60) return '#80C2FF'; // Medium blue
    if (precipProbability <= 80) return '#4DA6FF'; // Darker blue
    return '#1A8CFF'; // Darkest blue for 81-100%
  } else if (dataType === 'hazards') {
    return county.data.hazards.length > 0 ? '#FF5F5F' : '#F7FCFD';
  } else if (dataType === 'visibility') {
    const visibility = county.data.visibility.value;
    if (!visibility) return '#F7FCFD'; // Gray for null values
    if (visibility < 1000) return '#FF5F5F'; // Very poor visibility
    if (visibility < 5000) return '#FF9966'; // Poor visibility
    if (visibility < 10000) return '#FFD166'; // Moderate visibility
    return '#F7FCFD'; // Good visibility
  } else if (dataType === 'alerts') {
    // Check if county has alerts
    if (!county.data.alerts || county.data.alerts.length === 0) {
      return '#F7FCFD'; // No alerts - blue
    }
    
    // Find the most severe alert
    let highestSeverity = 'minor';
    county.data.alerts.forEach(alert => {
      const severity = alert.severity?.toLowerCase();
      if (severity === 'extreme') highestSeverity = 'extreme';
      else if (severity === 'severe' && highestSeverity !== 'extreme') highestSeverity = 'severe';
      else if (severity === 'moderate' && !['extreme', 'severe'].includes(highestSeverity)) highestSeverity = 'moderate';
    });
    
    // Return color based on severity
    switch (highestSeverity) {
      case 'extreme':
      case 'severe':
        return '#FF0000'; // Red for severe alerts
      case 'moderate':
        return '#FFA500'; // Orange for moderate alerts
      default:
        return '#FFFF00'; // Yellow for minor alerts
    }
  }
  return '#9CA3AF'; // Default gray
};

// Find county data by name
export const findCountyByName = (counties: CountyData[], name: string): CountyData | undefined => {
  const normalizedName = normalizeCountyName(name);
  return counties.find(county => 
    normalizeCountyName(county.countyName) === normalizedName
  );
};

// Generate a fill color expression for maplibre
export const generateFillColorExpression = (counties: CountyData[], dataType: DataType) => {
  const matchExpression = ['match', ['get', 'COUNTY']];
  
  counties.forEach(county => {
    // Add "County" to match the GeoJSON format
    matchExpression.push(`${county.countyName} County`, getColor(county, dataType));
  });
  
  matchExpression.push('#CCCCCC');
  return matchExpression;
};
