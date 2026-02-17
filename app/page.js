"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const defaultCenter = {
  lat: 30.7333, // Chandigarh fallback
  lng: 76.7794,
};

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved");

    if (error) {
      console.error(error);
    } else {
      setProperties(data);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        HomeOnMap Live Listings
      </h1>

      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
        <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12}>
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={{
                lat: property.latitude,
                lng: property.longitude,
              }}
              title={property.title}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
