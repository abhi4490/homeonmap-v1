"use client";

import { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddProperty() {
  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script", // SAME ID
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(center);
  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
    image: null,
  });

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login first");
      return;
    }

    let imageUrl = null;

    if (form.image) {
      const fileName = Date.now() + form.image.name;

      await supabase.storage
        .from("property-images")
        .upload(fileName, form.image);

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${fileName}`;
    }

    await supabase.from("properties").insert({
      title: form.title,
      price: Number(form.price),
      locality: form.locality,
      phone: form.phone,
      lat: marker.lat,
      lng: marker.lng,
      image_url: imageUrl,
      user_id: user.id,
    });

    alert("Property added!");
    router.push("/");
  };

  return (
    <div className="max-w-xl mx-auto p-5 space-y-4">
      <h1 className="text-2xl font-bold">Add Property</h1>

      <input
        placeholder="Title"
        className="border p-3 rounded w-full"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <input
        placeholder="Price"
        className="border p-3 rounded w-full"
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <input
        placeholder="Locality"
        className="border p-3 rounded w-full"
        onChange={(e) => setForm({ ...form, locality: e.target.value })}
      />

      <input
        placeholder="Phone"
        className="border p-3 rounded w-full"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <input
        type="file"
        onChange={(e) =>
          setForm({ ...form, image: e.target.files[0] })
        }
      />

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker}
          zoom={13}
          onClick={(e) =>
            setMarker({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            })
          }
        >
          <Marker position={marker} />
        </GoogleMap>
      )}

      <button
        onClick={handleSubmit}
        className="bg-black text-white w-full py-3 rounded-lg"
      >
        Post Property
      </button>
    </div>
  );
}