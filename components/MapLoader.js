"use client";

import { LoadScript } from "@react-google-maps/api";

export default function MapLoader({ children }) {
  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={["maps"]}
      id="homeonmap-map"
    >
      {children}
    </LoadScript>
  );
}