
import React, { useEffect, useState } from 'react';
import TexasMap from '@/components/TexasMap';
import { loadCountyData } from '@/services/countyService';
import { CountyData } from '@/types/county';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCountyData()
      .then(data => {
        setCounties(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load county data:', err);
        setError('Failed to load county data. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading Texas county data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800">Texas Counties Weather Map</h1>
        <p className="text-gray-600">Interactive choropleth map showing weather data across Texas counties</p>
      </header>
      
      <main className="flex-1">
        {counties.length > 0 ? (
          <TexasMap counties={counties} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No county data available.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
