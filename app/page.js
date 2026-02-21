"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import GoogleMapProvider from "../components/GoogleMapProvider";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 30.7333, lng: 76.7794 };

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
  };

  return (
    <GoogleMapProvider>
      <div>
        {/* HEADER */}
        <div style={header}>
          <div style={brand}>
            <span style={logo}>🏠</span>
            <span style={title}>HomeOnMap</span>
          </div>

          <div style={nav}>
            <Link href="/add" style={primaryBtn}>
              + Add Property
            </Link>
            <Link href="/my-listings" style={secondaryBtn}>
              My Listings
            </Link>
          </div>
        </div>

        {/* MAP */}
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
          {properties.map((p) => (
            <Marker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              onClick={() => setSelected(p)}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={card}>
                {selected.image_url && (
                  <img src={selected.image_url} style={cardImage} />
                )}

                <div style={cardTitle}>{selected.title}</div>

                {selected.locality && (
                  <div style={cardSub}>📍 {selected.locality}</div>
                )}

                <div style={price}>
                  ₹ {Number(selected.price).toLocaleString("en-IN")}
                </div>

                <div style={actions}>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} style={callBtn}>
                      Call
                    </a>
                  )}

                  {selected.phone && (
                    <a
                      href={`https://wa.me/91${selected.phone}`}
                      target="_blank"
                      style={whatsappBtn}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </GoogleMapProvider>
  );
}

/* styles same as before */

const header = {
  position: "fixed",
  top: 14,
  left: 14,
  right: 14,
  height: 64,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(14px)",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 18px",
  zIndex: 10,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const brand = { display: "flex", alignItems: "center", gap: 8 };
const logo = { fontSize: 22 };
const title = { fontWeight: 700, fontSize: 18 };

const nav = { display: "flex", gap: 10 };

const primaryBtn = {
  background: "#000",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
};

const secondaryBtn = {
  border: "1px solid #000",
  padding: "8px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
};

const card = { width: 230 };
const cardImage = {
  width: "100%",
  height: 120,
  objectFit: "cover",
  borderRadius: 8,
  marginBottom: 6,
};

const cardTitle = { fontWeight: 700, fontSize: 15 };
const cardSub = { fontSize: 13, color: "#666" };
const price = { marginTop: 6, fontWeight: 700 };

const actions = { display: "flex", gap: 8, marginTop: 8 };

const callBtn = {
  flex: 1,
  textAlign: "center",
  background: "#111",
  color: "#fff",
  padding: "6px 8px",
  borderRadius: 6,
  textDecoration: "none",
};

const whatsappBtn = {
  flex: 1,
  textAlign: "center",
  background: "#16a34a",
  color: "#fff",
  padding: "6px 8px",
  borderRadius: 6,
  textDecoration: "none",
};