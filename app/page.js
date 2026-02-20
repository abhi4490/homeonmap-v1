"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100vh" };
const center = { lat: 30.7333, lng: 76.7794 };

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
  }

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {properties.map((p) => {
        if (!p.lat || !p.lng) return null;

        return (
          <Marker
            key={p.id}
            position={{ lat: Number(p.lat), lng: Number(p.lng) }}
            onClick={() => setSelected(p)}
          />
        );
      })}

      {selected && (
        <InfoWindow
          position={{
            lat: Number(selected.lat),
            lng: Number(selected.lng),
          }}
          onCloseClick={() => setSelected(null)}
        >
          <div
            style={{
              width: 220,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* FORCE IMAGE RENDER */}
            {selected.image_url ? (
              <img
                src={selected.image_url}
                alt="property"
                style={{
                  width: "100%",
                  height: 130,
                  objectFit: "cover",
                  borderRadius: 8,
                  background: "#eee",
                }}
                onError={(e) => {
                  e.target.style.border = "2px solid red";
                  console.log("Image failed:", selected.image_url);
                }}
                onLoad={() => {
                  console.log("Image loaded:", selected.image_url);
                }}
              />
            ) : (
              <div style={{ fontSize: 12, color: "gray" }}>
                No image URL
              </div>
            )}

            {/* DEBUG URL (temporary) */}
            <div
              style={{
                fontSize: 10,
                wordBreak: "break-all",
                color: "#888",
              }}
            >
              {selected.image_url}
            </div>

            <strong>{selected.title}</strong>
            <span>₹ {selected.price}</span>

            <a
              href={`tel:${selected.phone}`}
              style={{ color: "green", fontWeight: "bold" }}
            >
              📞 Call Now
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}