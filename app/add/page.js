"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddProperty() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("owner");
  const [image, setImage] = useState(null);
  const [marker, setMarker] = useState(center);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return <div>Loading map...</div>;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // 🧠 STEP 1 — COUNT EXISTING LISTINGS
      const { data: existing } = await supabase
        .from("properties")
        .select("id")
        .eq("phone", phone);

      if (existing && existing.length >= 5) {
        alert("Free listing limit reached (5). Upgrade coming soon 🚀");
        setLoading(false);
        return;
      }

      // 🖼️ STEP 2 — IMAGE UPLOAD
      let imageUrl = null;

      if (image) {
        const fileName =
          Date.now() + "_" + image.name.replace(/\s+/g, "_");

        await supabase.storage
          .from("property-images")
          .upload(fileName, image);

        imageUrl = `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${fileName}`;
      }

      // 📍 STEP 3 — INSERT PROPERTY
      await supabase.from("properties").insert([
        {
          title,
          price,
          phone,
          role,
          lat: marker.lat,
          lng: marker.lng,
          image_url: imageUrl,
        },
      ]);

      alert("Property added successfully!");
      setTitle("");
      setPrice("");
      setPhone("");
      setImage(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <br /><br />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <br /><br />

        {/* ROLE SELECT */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="owner">Owner</option>
          <option value="broker">Broker</option>
        </select>
        <br /><br />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <br /><br />

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Property"}
        </button>
      </form>

      <h3>Click map to set location</h3>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: 300 }}
        center={marker}
        zoom={12}
        onClick={(e) =>
          setMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          })
        }
      >
        <Marker position={marker} />
      </GoogleMap>
    </div>
  );
}