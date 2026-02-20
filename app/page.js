"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

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
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("id", { ascending: false });

    setProperties(data || []);
  }

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      {/* Header */}
      <header style={header}>
        <div>
          <div style={brand}>🏠 HomeOnMap</div>
          <div style={tagline}>Find properties directly on the map</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <a href="/my-listings" style={linkBtn}>My Listings</a>
          <a href="/add" style={addBtn}>Add Property</a>
        </div>
      </header>

      {/* Map */}
      <div style={{ height: "calc(100vh - 70px)" }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={12}
        >
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
              <div style={{ width: 240 }}>
                {selected.image_url && (
                  <img src={selected.image_url} style={{ width: "100%", borderRadius: 8 }} />
                )}
                <div style={{ fontWeight: 600 }}>{selected.title}</div>
                <div style={{ color: "#16a34a", fontWeight: 700 }}>
                  ₹ {selected.price}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <a href={`tel:${selected.phone}`}>📞 Call</a>
                  <a href={`https://wa.me/${selected.phone}`} target="_blank">
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

/* styles */

const header = {
  height: 70,
  padding: "12px 20px",
  background: "#fff",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const brand = { fontSize: 18, fontWeight: 700 };
const tagline = { fontSize: 12, color: "#666" };

const linkBtn = {
  padding: "6px 10px",
  background: "#f1f5f9",
  borderRadius: 6,
  textDecoration: "none",
  color: "#111",
};

const addBtn = {
  padding: "6px 10px",
  background: "#16a34a",
  borderRadius: 6,
  textDecoration: "none",
  color: "#fff",
};