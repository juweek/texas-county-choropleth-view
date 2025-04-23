import React, { useEffect, useState } from 'react';
import { CountyData } from '@/types/county';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TabbedRiskView from '@/components/TabbedRiskView';
import MapSection from '@/components/MapSection';
import ContactFormSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { getAssetPath } from '@/utils/paths';

export default function Home() {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch county data
        const countyResponse = await fetch(getAssetPath('texas_counties_weather.json'));
        if (!countyResponse.ok) {
          throw new Error('Failed to fetch county data');
        }
        const countyData = await countyResponse.json();
        setCounties(countyData);
        
        // Fetch timestamp data
        try {
          const timestampResponse = await fetch(getAssetPath('weather_timestamp.json'));
          if (timestampResponse.ok) {
            const timestampData = await timestampResponse.json();
            setLastUpdated(timestampData.last_updated);
          }
        } catch (timestampErr) {
          console.warn('Could not load timestamp data:', timestampErr);
          // Don't set error state here, just log the warning
        }
      } catch (err) {
        console.error('Error fetching county data:', err);
        setError('Failed to load county data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading county data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
        <div id="what-we-do" className="bg-custom-blue border-t-[3px] border-b-[3px] border-black">
          <TabbedRiskView />
        </div>
        <div id="who-works-with-us">
          <FeaturesSection />
        </div>
        <div id="current-risks">
          <MapSection counties={counties} />
        </div>
        <div id="contact-us">
          <ContactFormSection />
        </div>
        <CTASection />
      </main>
      
      {/* Add timestamp display */}
      {lastUpdated && (
        <div className="text-sm text-gray-600 p-2 text-center">
          Data last updated: {lastUpdated}
        </div>
      )}
    </>
  );
}
