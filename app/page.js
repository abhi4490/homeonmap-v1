"use client";

import MapLoader from "@/components/MapLoader";
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
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="bg-white px-4 py-2 rounded-xl shadow font-semibold">
          🏠 HomeOnMap
        </div>

        <div className="flex gap-2">
          <a href="/add" className="bg-black text-white px-4 py-2 rounded-xl">
            + Add Property
          </a>
          <a href="/my-listings" className="bg-white px-4 py-2 rounded-xl shadow">
            My Listings
          </a>
        </div>
      </div>

      {/* MAP */}
      <MapLoader>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        />
      </MapLoader>
    </div>
  );
}