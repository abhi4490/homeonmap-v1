"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function AddProperty() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(center);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker}
        zoom={12}
        onClick={(e) =>
          setMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          })
        }
      >
        <Marker position={marker} />
      </GoogleMap>
    </div>
  );
}