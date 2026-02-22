"use client";

import MapLoader from "@/components/MapLoader";
import BuyerIntentFloating from "@/components/BuyerIntentFloating";
import { GoogleMap } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* PREMIUM FLOATING HEADER */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* Logo */}
        <div className="bg-white/90 backdrop-blur px-5 py-3 rounded-2xl shadow-lg font-semibold text-lg">
          🏠 HomeOnMap
        </div>

        {/* Actions */}
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

      {/* GOOGLE MAP */}
      <MapLoader>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        />
      </MapLoader>

      {/* FLOATING BUYER POPUP */}
      <BuyerIntentFloating />
    </div>
  );
}