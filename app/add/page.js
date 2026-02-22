"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useRouter } from "next/navigation";

const containerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "16px",
};

const defaultCenter = { lat: 30.7333, lng: 76.7794 };

export default function AddPropertyPage() {
  const router = useRouter();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
    image: null,
  });

  const handleMapClick = (e) => {
    if (!e.latLng) return;
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const handleImage = (file) => {
    if (!file) return;
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.phone)
      return alert("Fill all fields");

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let imageUrl = null;

    if (form.image) {
      const fileName = `${Date.now()}-${form.image.name}`;
      await supabase.storage
        .from("property-images")
        .upload(fileName, form.image);

      imageUrl = `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${fileName}`;
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

    alert("Posted!");
    router.push("/");
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 bg-white border-b">
        <div className="max-w-xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Add Property</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 space-y-5 mt-5">
        <input
          placeholder="Title"
          className="w-full p-4 rounded-xl border"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          placeholder="Price"
          className="w-full p-4 rounded-xl border"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        <input
          placeholder="Locality"
          className="w-full p-4 rounded-xl border"
          value={form.locality}
          onChange={(e) =>
            setForm({ ...form, locality: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          className="w-full p-4 rounded-xl border"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          type="file"
          onChange={(e) => handleImage(e.target.files[0])}
        />

        {preview && (
          <img src={preview} className="w-full rounded-xl" />
        )}

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker}
          zoom={13}
          onClick={handleMapClick}
        >
          <Marker position={marker} />
        </GoogleMap>

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-4 rounded-xl"
        >
          Post Property
        </button>
      </div>
    </div>
  );
}