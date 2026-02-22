"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Link from "next/link";

const center = { lat: 30.7333, lng: 76.7794 };

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
  }

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      {/* HEADER */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          background: "white",
          padding: 12,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: "bold" }}>🏠 HomeOnMap</div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/add">+ Add Property</Link>
          <Link href="/my-listings">My Listings</Link>
        </div>
      </div>

      {/* MAP */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={11}
      >
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => setSelected(p)}
          />
        ))}
      </GoogleMap>

      {/* PREMIUM PROPERTY CARD */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          }}
        >
          {selected.image_url && (
            <img
              src={selected.image_url}
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
              }}
            />
          )}

          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>
              {selected.title}
            </h3>

            <p style={{ color: "#666" }}>₹ {selected.price}</p>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <a
                href={`tel:${selected.phone}`}
                style={{
                  flex: 1,
                  background: "#000",
                  color: "#fff",
                  textAlign: "center",
                  padding: 10,
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Call
              </a>

              <a
                href={`https://wa.me/91${selected.phone}`}
                style={{
                  flex: 1,
                  background: "#25D366",
                  color: "#fff",
                  textAlign: "center",
                  padding: 10,
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}