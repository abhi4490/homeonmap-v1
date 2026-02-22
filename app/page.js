"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Link from "next/link";

const mapStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = { lat: 30.7333, lng: 76.7794 };

// 💰 Price formatter
function formatPrice(price) {
  if (!price) return "";
  const num = Number(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (data) setProperties(data);
  }

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {/* 🧊 PREMIUM HEADER */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-xl">
        <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-lg">🏠 HomeOnMap</div>

          <div className="flex gap-2 text-sm">
            <Link
              href="/add"
              className="bg-black text-white px-3 py-1.5 rounded-lg font-medium"
            >
              + Add
            </Link>

            <Link
              href="/my-listings"
              className="border px-3 py-1.5 rounded-lg font-medium"
            >
              My Listings
            </Link>
          </div>
        </div>
      </div>

      {/* 🗺 MAP */}
      <GoogleMap
        mapContainerStyle={mapStyle}
        center={defaultCenter}
        zoom={12}
      >
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => setSelected(p)}
          />
        ))}
      </GoogleMap>

      {/* 💎 PREMIUM PROPERTY CARD */}
      {selected && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-20">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_.25s_ease]">
            {/* IMAGE */}
            {selected.image_url && (
              <img
                src={selected.image_url}
                className="w-full h-44 object-cover"
              />
            )}

            {/* CONTENT */}
            <div className="p-4 space-y-2">
              <div className="text-lg font-semibold leading-tight">
                {selected.title}
              </div>

              <div className="text-black font-bold text-xl">
                {formatPrice(selected.price)}
              </div>

              <div className="text-gray-500 text-sm">
                {selected.locality}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex-1 bg-black text-white text-center py-2 rounded-lg text-sm font-medium"
                >
                  Call
                </a>

                <a
                  href={`https://wa.me/91${selected.phone}`}
                  target="_blank"
                  className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg text-sm font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}