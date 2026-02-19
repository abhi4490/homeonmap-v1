"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 30.6942,
  lng: 76.8606,
};

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
  }

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>HomeOnMap</h1>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.latitude, lng: p.longitude }}
            onClick={() => setSelected(p)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{
              lat: selected.latitude,
              lng: selected.longitude,
            }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ width: 220 }}>
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                />
              )}

              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                ₹{selected.price?.toLocaleString()}
              </div>

              <div>{selected.title}</div>

              <div style={{ fontSize: 13, color: "#666" }}>
                📍 {selected.city}
              </div>

              {/* CONTACT BUTTONS */}
              {selected.phone && (
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <a
                    href={`tel:${selected.phone}`}
                    style={{
                      background: "#0f766e",
                      color: "white",
                      padding: "5px 8px",
                      borderRadius: 5,
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    Call
                  </a>

                  <a
                    href={`https://wa.me/${selected.phone}`}
                    target="_blank"
                    style={{
                      background: "#25D366",
                      color: "white",
                      padding: "5px 8px",
                      borderRadius: 5,
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
