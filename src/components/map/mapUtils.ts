import { CountyData, DataType } from '@/types/county';
import { normalizeCountyName } from '@/services/countyService';

// Get color based on data type and value
export const getColor = (county: CountyData, dataType: DataType): string => {
  if (dataType === 'temperature') {
    const tempC = county.data.temperature?.value ?? null;
    if (tempC === null || tempC === undefined) return '#F7FCFD'; // neutral for missing
    const tempF = (tempC * 9) / 5 + 32;
    // 10°F bins (ColorBrewer-like palette across cool→warm)
    if (tempF < 0) return '#313695';
    if (tempF < 10) return '#3f88bf';
    if (tempF < 20) return '#4575b4';
    if (tempF < 30) return '#74add1';
    if (tempF < 40) return '#abd9e9';
    if (tempF < 50) return '#e0f3f8';
    if (tempF < 60) return '#ffffbf';
    if (tempF < 70) return '#fee090';
    if (tempF < 80) return '#fdae61';
    if (tempF < 90) return '#f46d43';
    if (tempF < 100) return '#d73027';
    return '#7f0000'; // ≥ 100°F
  } else if (dataType === 'precipitation') {
    const precipProbability = county.data.probabilityOfPrecipitation?.value ?? null;
    if (precipProbability === null || precipProbability === undefined) return '#F7FCFD';
    if (precipProbability === 0) return '#FFFFFF'; // White for 0%
    if (precipProbability <= 20) return '#E6F0FF'; // Very light blue
    if (precipProbability <= 40) return '#B3D9FF'; // Light blue
    if (precipProbability <= 60) return '#80C2FF'; // Medium blue
    if (precipProbability <= 80) return '#4DA6FF'; // Darker blue
    return '#1A8CFF'; // Darkest blue for 81-100%
  } else if (dataType === 'hazards') {
    return (county.data.hazards?.length ?? 0) > 0 ? '#FF5F5F' : '#F7FCFD';
  } else if (dataType === 'visibility') {
    const visibility = county.data.visibility?.value ?? null;
    // Category-based coloring aligned with detail pill:
    // - Not available => gray
    // - Very poor (<1km) => red
    // - Poor (1–5km) => orange
    // - Moderate (5–10km) => yellow
    // - Good (>=10km) => green
    if (visibility === null || visibility === undefined) return '#9CA3AF'; // Not available
    if (visibility < 1000) return '#ef4444';       // red-500
    if (visibility < 5000) return '#f97316';       // orange-500
    if (visibility < 10000) return '#facc15';      // yellow-400
    return '#22C55E';                               // green-500
  } else if (dataType === 'alerts') {
    const alerts = county.data.alerts ?? [];
    const hazardsCount = county.data.hazards?.length ?? 0;
    // Prefer alerts if present
    if (alerts.length > 0) {
      // Find the most severe alert
      let highestSeverity = 'minor';
      alerts.forEach(alert => {
        const severity = alert.severity?.toLowerCase();
        if (severity === 'extreme') highestSeverity = 'extreme';
        else if (severity === 'severe' && highestSeverity !== 'extreme') highestSeverity = 'severe';
        else if (severity === 'moderate' && !['extreme', 'severe'].includes(highestSeverity)) highestSeverity = 'moderate';
      });
      switch (highestSeverity) {
        case 'extreme':
        case 'severe':
          return '#FF0000'; // severe
        case 'moderate':
          return '#FFA500'; // moderate
        default:
          return '#FFFF00'; // minor
      }
    }
    // Otherwise, show hazards presence
    if (hazardsCount > 0) {
      return '#8b5cf6'; // violet for hazards present
    }
    return 'rgba(0,0,0,0)'; // No alerts/hazards -> no fill
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
