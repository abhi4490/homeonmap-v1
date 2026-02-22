"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
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
  const { isLoaded } = useJsApiLoader({
    id: "homeonmap-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*");

    if (!error) setProperties(data || []);
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return "₹" + Number(price).toLocaleString("en-IN");
  };

  if (!isLoaded) return null;

  return (
    <div className="relative">
      {/* MAP */}
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
            <div className="w-64">
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}

              <h3 className="font-semibold text-sm">
                {selected.title}
              </h3>

              <p className="text-sm text-gray-600">
                {formatPrice(selected.price)}
              </p>

              {selected.locality && (
                <p className="text-xs text-gray-500">
                  {selected.locality}
                </p>
              )}

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex-1 text-center bg-black text-white py-1 rounded-lg text-sm"
                  >
                    Call
                  </a>
                )}

                {selected.phone && (
                  <a
                    href={`https://wa.me/91${selected.phone}`}
                    target="_blank"
                    className="flex-1 text-center border border-black py-1 rounded-lg text-sm"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* FLOATING BUYER POPUP */}
      <BuyerIntentFloating />
    </div>
  );
}