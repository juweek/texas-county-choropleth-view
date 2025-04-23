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
import CountyDetailCard from '@/components/map/CountyDetailCard';

export default function Home() {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
            console.log('Timestamp data fetched:', timestampData);
            setLastUpdated(timestampData.last_updated);
            
            // Alert to debug
          } else {
            console.warn('Timestamp response not OK:', timestampResponse.status);
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
          <MapSection counties={counties} lastUpdated={lastUpdated} />
        </div>
        <div id="contact-us">
          <ContactFormSection />
        </div>
        <CTASection />
      </main>
      
      <Footer />
    

      {/* If a county is selected, show its details in a fixed card */}
      {selectedCounty && (
        <CountyDetailCard
          county={selectedCounty}
          position="fixed"
          lastUpdated={lastUpdated}
        />
      )}

      {/* If hovering over a county (and it's not the selected one), show a details card that follows cursor */}
      {hoveredCounty && hoveredCounty.countyName !== selectedCounty?.countyName && (
        <CountyDetailCard
          county={hoveredCounty}
          position="follow-cursor"
          mousePosition={mousePosition}
          lastUpdated={lastUpdated}
        />
      )}
    </>
  );
}
