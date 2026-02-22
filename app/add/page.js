"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddProperty() {
  const router = useRouter();
  const [marker, setMarker] = useState(center);
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  function handleMapClick(e) {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }

  async function handleSubmit() {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return alert("Login first");

    let imageUrl = null;

    if (image) {
      const name = Date.now() + image.name;
      await supabase.storage.from("property-images").upload(name, image);
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${name}`;
    }

    await supabase.from("properties").insert({
      ...form,
      lat: marker.lat,
      lng: marker.lng,
      image_url: imageUrl,
      user_id: user.user.id,
    });

    alert("Property added");
    router.push("/");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Property</h1>

      <input
        placeholder="Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        placeholder="Price"
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <input
        placeholder="Locality"
        onChange={(e) => setForm({ ...form, locality: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: 300 }}
          center={marker}
          zoom={12}
          onClick={handleMapClick}
        >
          <Marker position={marker} />
        </GoogleMap>
      )}

      <button onClick={handleSubmit}>Post Property</button>
    </div>
  );
}