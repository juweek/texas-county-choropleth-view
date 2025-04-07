import { CountyData, DataType } from '@/types/county';
import { normalizeCountyName } from '@/services/countyService';

// Get color based on data type and value
export const getColor = (county: CountyData, dataType: DataType): string => {
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
