"use client";

import { useJsApiLoader } from "@react-google-maps/api";

export default function GoogleMapProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script", // GLOBAL SINGLE LOADER
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div style={{ padding: 20 }}>Loading map...</div>;

  return children;
}