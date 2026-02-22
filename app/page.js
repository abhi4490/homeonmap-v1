"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Link from "next/link";
import BuyerIntentFloating from "@/components/BuyerIntentFloating";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function HomePage() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    setProperties(data || []);
  };

  return (
    <div className="relative w-full h-screen">
      {/* Top Premium Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow font-semibold">
          🏡 HomeOnMap
        </div>

        <div className="flex gap-2">
          <Link
            href="/add"
            className="bg-black text-white px-4 py-2 rounded-xl shadow"
          >
            + Add Property
          </Link>

          <Link
            href="/my-listings"
            className="bg-white px-4 py-2 rounded-xl shadow border"
          >
            My Listings
          </Link>
        </div>
      </div>

      {/* Map */}
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
          />
        ))}
      </GoogleMap>

      {/* Floating buyer widget */}
      <BuyerIntentFloating />
    </div>
  );
}