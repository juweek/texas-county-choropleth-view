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
import Chatbot from '@/components/Chatbot';
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
        
        // Fetch county data with cache-busting
        const timestamp = new Date().getTime();
        const countyResponse = await fetch(`${getAssetPath('texas_counties_weather.json')}?t=${timestamp}`);
        if (!countyResponse.ok) {
          throw new Error('Failed to fetch county data');
        }
        const countyData = await countyResponse.json();
        setCounties(countyData);
        
        // Fetch timestamp data with cache-busting
        try {
          const timestampResponse = await fetch(`${getAssetPath('weather_timestamp.json')}?t=${timestamp}`);
          if (timestampResponse.ok) {
            const timestampData = await timestampResponse.json();
            console.log('Timestamp data fetched:', timestampData);
            setLastUpdated(timestampData.last_updated);
          } else {
            console.warn('Timestamp response not OK:', timestampResponse.status);
          }
        } catch (timestampErr) {
          console.warn('Could not load timestamp data:', timestampErr);
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
        <div id="what-we-do" className="bg-custom-blue border-t-[2px] border-b-[3px] border-black shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
          <TabbedRiskView />
        </div>
        <div id="who-works-with-us">
          <FeaturesSection />
        </div>
        <div id="current-risks">
          <MapSection counties={counties} lastUpdated={lastUpdated} />
        </div>
        <div id="contact-us">
          <ContactFormSection />
        </div>
        <CTASection />
        <Chatbot />
      </main>
    </>
  );
}
