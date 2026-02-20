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

  // 🔥 OAuth redirect fixer (SAFE)
  useEffect(() => {
    async function handleRedirect() {
      const returnToAdd = localStorage.getItem("returnToAdd");
      if (!returnToAdd) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        localStorage.removeItem("returnToAdd");
        window.location.href = "/add";
      }
    }
    handleRedirect();
  }, []);

  // Load properties
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
      {/* Premium Header */}
      <header style={header}>
        <div style={brand}>🏠 HomeOnMap</div>
        <div style={tagline}>Find properties directly on the map</div>
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
              <div style={card}>
                {selected.image_url && (
                  <img src={selected.image_url} style={img} />
                )}

                <div style={title}>{selected.title}</div>

                <div style={price}>₹ {selected.price}</div>

                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`tel:${selected.phone}`} style={callBtn}>
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/${selected.phone}`}
                    target="_blank"
                    style={waBtn}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Floating Add Button */}
      <a href="/add" style={fab}>
        ＋ Add Property
      </a>
    </div>
  );
}

/* Styles */

const header = {
  height: 70,
  padding: "12px 20px",
  background: "#ffffff",
  borderBottom: "1px solid #eee",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const brand = { fontSize: 18, fontWeight: 700 };
const tagline = { fontSize: 12, color: "#666" };

const card = { width: 260, fontFamily: "system-ui, sans-serif" };

const img = {
  width: "100%",
  height: 150,
  objectFit: "cover",
  borderRadius: 10,
  marginBottom: 8,
};

const title = { fontWeight: 600, fontSize: 16 };

const price = {
  fontSize: 18,
  fontWeight: 700,
  color: "#16a34a",
  margin: "4px 0 8px",
};

const fab = {
  position: "fixed",
  bottom: 20,
  right: 20,
  background: "#16a34a",
  color: "#fff",
  borderRadius: 30,
  padding: "12px 16px",
  textDecoration: "none",
  fontWeight: 600,
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
};

const callBtn = {
  flex: 1,
  textAlign: "center",
  padding: "6px 0",
  background: "#16a34a",
  color: "#fff",
  borderRadius: 6,
  fontSize: 14,
  textDecoration: "none",
};

const waBtn = {
  flex: 1,
  textAlign: "center",
  padding: "6px 0",
  background: "#25D366",
  color: "#fff",
  borderRadius: 6,
  fontSize: 14,
  textDecoration: "none",
};