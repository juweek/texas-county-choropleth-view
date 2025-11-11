import { createRoot } from "react-dom/client";
import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import TexasMap from "@/components/TexasMap";
import { CountyData } from "@/types/county";
import { getAssetPath } from "@/utils/paths";

const useQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const heightParam = params.get("height");
  const bgParam = params.get("bg"); // e.g., "transparent" or hex like "ffffff"
  const parsedHeight = heightParam ? Math.max(300, parseInt(heightParam, 10) || 0) : 600;
  const background = bgParam ? (bgParam === "transparent" ? "transparent" : `#${bgParam.replace(/^#/, "")}`) : "#ffffff";
  return { height: parsedHeight, background };
};

const EmbedApp: React.FC = () => {
  const { height, background } = useQueryParams();
  const [counties, setCounties] = useState<CountyData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const countyResponse = await fetch(`${getAssetPath("texas_counties_weather.json")}?t=${timestamp}`);
        if (!countyResponse.ok) {
          throw new Error("Failed to fetch county data");
        }
        const countyData = await countyResponse.json();
        setCounties(countyData);

        try {
          const timestampResponse = await fetch(`${getAssetPath("weather_timestamp.json")}?t=${timestamp}`);
          if (timestampResponse.ok) {
            const timestampData = await timestampResponse.json();
            setLastUpdated(timestampData.last_updated);
          }
        } catch {
          // non-fatal
        }
      } catch (err) {
        setError("Failed to load county data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerStyle = useMemo<React.CSSProperties>(() => ({
    width: "100%",
    height: `${height}px`,
    background,
  }), [height, background]);

  if (loading) return <div style={containerStyle} className="flex items-center justify-center">Loading…</div>;
  if (error) return <div style={containerStyle} className="flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div style={containerStyle}>
      <TexasMap counties={counties} lastUpdated={lastUpdated} />
    </div>
  );
};

createRoot(document.getElementById("embed-root")!).render(<EmbedApp />);


