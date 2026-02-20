"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: 30.7333, lng: 76.7794 };

export default function AddProperty() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [marker, setMarker] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return <div>Loading map...</div>;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;

    // -------- IMAGE UPLOAD (FIXED BUCKET NAME) --------
    if (image) {
      try {
        const cleanName =
          Date.now() + "_" + image.name.replace(/\s+/g, "_");

        const { error: uploadError } = await supabase.storage
          .from("property-images") // ✅ correct bucket name
          .upload(cleanName, image);

        if (!uploadError) {
          const { data } = supabase.storage
            .from("property-images")
            .getPublicUrl(cleanName);

          imageUrl = data.publicUrl;
        } else {
          console.error("Upload error:", uploadError);
        }
      } catch (err) {
        console.log("Image upload failed, continuing without image");
      }
    }

    // -------- INSERT PROPERTY --------
    const { data, error } = await supabase.from("properties").insert([
      {
        title: title,
        price: price,
        phone: phone,
        lat: marker.lat,
        lng: marker.lng,
        image_url: imageUrl,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Insert error:", error);
      alert("Insert failed: " + error.message);
    } else {
      alert("Property added successfully!");
      setTitle("");
      setPrice("");
      setPhone("");
      setImage(null);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
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
        mapContainerStyle={containerStyle}
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