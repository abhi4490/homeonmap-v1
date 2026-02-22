"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MapLoader from "@/components/MapLoader";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

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

  const formatPrice = (price) => {
    if (!price) return "";
    return "₹" + Number(price).toLocaleString("en-IN");
  };

  return (
    <div className="relative">
      {/* PREMIUM FLOATING HEADER */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="bg-white/85 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl font-semibold text-lg">
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

      {/* MAP */}
      <MapLoader>
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

          {/* PREMIUM PROPERTY CARD */}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="w-60 font-sans">
                {/* SMALL PREMIUM IMAGE */}
                {selected.image_url && (
                  <div className="mb-2 overflow-hidden rounded-xl">
                    <img
                      src={selected.image_url}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                )}

                {/* TITLE */}
                <h3 className="text-sm font-semibold leading-tight mb-1">
                  {selected.title}
                </h3>

                {/* PRICE */}
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {formatPrice(selected.price)}
                </p>

                {/* LOCALITY */}
                {selected.locality && (
                  <p className="text-xs text-gray-500 mb-2">
                    {selected.locality}
                  </p>
                )}

                {/* PREMIUM BUTTON ROW */}
                <div className="flex gap-2 mt-2">
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex-1 text-center bg-black text-white py-1.5 rounded-lg text-xs font-medium"
                    >
                      Call
                    </a>
                  )}

                  {selected.phone && (
                    <a
                      href={`https://wa.me/91${selected.phone}`}
                      target="_blank"
                      className="flex-1 text-center border border-black py-1.5 rounded-lg text-xs font-medium"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </MapLoader>
    </div>
  );
}