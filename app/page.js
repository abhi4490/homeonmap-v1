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
              width: 260,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {/* IMAGE */}
            {selected.image_url && (
              <img
                src={selected.image_url}
                alt="property"
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              />
            )}

            {/* TITLE */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              {selected.title}
            </div>

            {/* PRICE */}
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#16a34a",
                marginBottom: 6,
              }}
            >
              ₹ {selected.price}
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`tel:${selected.phone}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "6px 0",
                  background: "#16a34a",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                📞 Call
              </a>

              <a
                href={`https://wa.me/${selected.phone}`}
                target="_blank"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "6px 0",
                  background: "#25D366",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}