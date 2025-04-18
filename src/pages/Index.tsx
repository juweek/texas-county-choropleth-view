import React, { useEffect, useState } from 'react';
import { CountyData } from '@/types/county';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TabbedRiskView from '@/components/TabbedRiskView';
import MapSection from '@/components/MapSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { getAssetPath } from '@/utils/paths';

export default function Home() {
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(getAssetPath('texas_counties_weather.json'));
        if (!response.ok) {
          throw new Error('Failed to fetch county data');
        }
        const data = await response.json();
        setCounties(data);
      } catch (err) {
        console.error('Error fetching county data:', err);
        setError('Failed to load county data');
      } finally {
        setLoading(false);
      }
    };

    fetchCountyData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading county data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <main className="min-h-screen">
      <HeroSection />
      <TabbedRiskView />
      <FeaturesSection />
      <MapSection counties={counties} />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
