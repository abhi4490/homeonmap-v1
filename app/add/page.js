"use client";

import { useState } from "react";
import MapLoader from "@/components/MapLoader";
import { GoogleMap, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "16px",
};

const defaultCenter = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function AddPropertyPage() {
  const [marker, setMarker] = useState(defaultCenter);

  const handleMapClick = (e) => {
    if (!e.latLng) return;
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Add Property</h1>

      <MapLoader>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={marker}
          zoom={13}
          onClick={handleMapClick}
        >
          <Marker position={marker} />
        </GoogleMap>
      </MapLoader>
    </div>
  );
}