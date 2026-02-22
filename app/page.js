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
    id: "google-map-script",
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

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="animate-pulse text-xl font-semibold text-gray-500">Loading Map...</div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* MAP */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => setSelected(p)}
          />
        ))}
      </GoogleMap>

      {/* PREMIUM GLASS HEADER */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg flex justify-between items-center px-6 py-4 z-10">
        <div className="font-bold text-2xl tracking-tight text-gray-900">
          🏠 HomeOnMap
        </div>

        <div className="flex gap-4">
          <Link
            href="/add"
            className="bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
          >
            + Add Property
          </Link>
          <Link
            href="/my-listings"
            className="bg-white text-black border border-gray-200 px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-all duration-200"
          >
            My Listings
          </Link>
        </div>
      </div>

      {/* PREMIUM SELECTED CARD */}
      {selected && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center p-4 z-10">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slideUp relative">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all z-20"
            >
              ✕
            </button>

            {/* IMAGE */}
            {selected.image_url ? (
              <img
                src={selected.image_url}
                className="w-full h-72 object-cover"
                alt={selected.title}
              />
            ) : (
              <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
                  <p className="text-gray-500 font-medium mt-1">📍 {selected.locality}</p>
                </div>
                <div className="text-2xl font-extrabold text-black bg-gray-100 px-4 py-1.5 rounded-xl">
                  ₹ {Number(selected.price).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex-1 bg-black text-white text-center py-3.5 rounded-xl font-semibold shadow-md hover:bg-gray-800 transition-all"
                >
                  📞 Call Now
                </a>
                <a
                  href={`https://wa.me/91${selected.phone}`}
                  target="_blank"
                  className="flex-1 bg-green-500 text-white text-center py-3.5 rounded-xl font-semibold shadow-md hover:bg-green-600 transition-all"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}