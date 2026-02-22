"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const center = { lat: 30.7333, lng: 76.7794 };

export default function HomePage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
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
      .order("created_at", { ascending: false });

    setProperties(data || []);
  }

  if (!isLoaded) return null;

  return (
    <div className="relative">
      {/* PREMIUM HEADER */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur px-5 py-3 rounded-2xl shadow-xl font-semibold text-lg">
          🏠 HomeOnMap
        </div>

        <div className="flex gap-3">
          <a
            href="/add"
            className="bg-black text-white px-5 py-3 rounded-2xl shadow-lg font-semibold"
          >
            + Add Property
          </a>

          <a
            href="/my-listings"
            className="bg-white px-5 py-3 rounded-2xl shadow-lg font-semibold"
          >
            My Listings
          </a>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
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
            <div className="w-64 font-sans">
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}

              <h3 className="font-semibold text-sm">
                {selected.title}
              </h3>

              <p className="text-sm text-gray-700">
                ₹{Number(selected.price).toLocaleString("en-IN")}
              </p>

              <p className="text-xs text-gray-500 mb-2">
                {selected.locality}
              </p>

              <div className="flex gap-2 mt-3">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex-1 text-center bg-black text-white py-1.5 rounded-lg text-xs font-medium"
                >
                  Call
                </a>

                <a
                  href={`https://wa.me/91${selected.phone}`}
                  target="_blank"
                  className="flex-1 text-center border border-black py-1.5 rounded-lg text-xs font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}