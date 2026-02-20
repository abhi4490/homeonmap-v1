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
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
  }

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <header style={header}>
        <div style={brand}>🏠 HomeOnMap</div>
        <div style={tagline}>Find properties directly on the map</div>
      </header>

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
              <div style={card}>
                {selected.image_url && (
                  <img src={selected.image_url} style={img} />
                )}

                <div style={title}>{selected.title}</div>
                <div style={price}>₹ {selected.price}</div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <a href="/add" style={fab}>
        ＋ Add Property
      </a>
    </div>
  );
}

/* styles */
const header = {
  height: 70,
  padding: "12px 20px",
  background: "#fff",
  borderBottom: "1px solid #eee",
};

const brand = { fontSize: 18, fontWeight: 700 };
const tagline = { fontSize: 12, color: "#666" };

const card = { width: 260 };
const img = { width: "100%", height: 150, objectFit: "cover" };
const title = { fontWeight: 600 };
const price = { color: "#16a34a", fontWeight: 700 };

const fab = {
  position: "fixed",
  bottom: 20,
  right: 20,
  background: "#16a34a",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 30,
  textDecoration: "none",
};