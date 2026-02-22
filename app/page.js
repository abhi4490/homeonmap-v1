"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function HomePage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script", // IMPORTANT: keep SAME everywhere
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

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

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="relative w-full h-screen">
      {/* MAP */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
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

      {/* HEADER */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-white rounded-xl shadow-lg flex justify-between items-center px-5 py-3">
        <div className="font-semibold text-lg">🏠 HomeOnMap</div>

        <div className="flex gap-3">
          <Link
            href="/add"
            className="bg-black text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Property
          </Link>

          <Link
            href="/my-listings"
            className="border px-4 py-2 rounded-lg font-medium"
          >
            My Listings
          </Link>
        </div>
      </div>

      {/* PREMIUM CARD */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            {/* IMAGE */}
            {selected.image_url && (
              <img
                src={selected.image_url}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-5 space-y-3">
              <h2 className="text-xl font-semibold">{selected.title}</h2>

              <div className="text-lg font-bold text-gray-800">
                ₹ {Number(selected.price).toLocaleString("en-IN")}
              </div>

              <div className="flex gap-3 mt-4">
                {/* CALL */}
                <a
                  href={`tel:${selected.phone}`}
                  className="flex-1 bg-black text-white text-center py-3 rounded-lg font-medium"
                >
                  Call
                </a>

                {/* WHATSAPP */}
                <a
                  href={`https://wa.me/91${selected.phone}`}
                  target="_blank"
                  className="flex-1 bg-green-500 text-white text-center py-3 rounded-lg font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}