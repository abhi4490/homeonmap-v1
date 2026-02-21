"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddPropertyPage() {
  const router = useRouter();

  // 🔒 SAME LOADER ID AS HOMEPAGE
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [user, setUser] = useState(null);
  const [marker, setMarker] = useState(center);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [locality, setLocality] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleMapClick = (e) => {
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const uploadImage = async () => {
    if (!image) return null;

    const fileName = Date.now() + "_" + image.name;

    const { error } = await supabase.storage
      .from("property-images")
      .upload(fileName, image);

    if (error) {
      alert("Image upload failed");
      return null;
    }

    return `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${fileName}`;
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!title || !price || !locality) {
      alert("Please fill all fields");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      const { error } = await supabase.from("properties").insert({
        title,
        price: Number(price),
        locality,
        phone,
        lat: marker.lat,
        lng: marker.lng,
        image_url: imageUrl,
        user_id: user.id,
      });

      if (error) throw error;

      alert("Property added successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Error adding property");
    }

    setLoading(false);
  };

  if (!user) return <div style={{ padding: 20 }}>Checking login...</div>;
  if (!isLoaded) return <div style={{ padding: 20 }}>Loading map...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Add Property</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={input}
      />

      <input
        placeholder="Price"
        inputMode="numeric"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={input}
      />

      <input
        placeholder="Locality"
        value={locality}
        onChange={(e) => setLocality(e.target.value)}
        style={input}
      />

      <input
        placeholder="Mobile Number"
        inputMode="numeric"
        maxLength={10}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={input}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ marginTop: 12 }}
      />

      <p style={{ marginTop: 12 }}>Click map to place pin</p>

      <GoogleMap
        mapContainerStyle={{ height: 320, borderRadius: 12 }}
        center={marker}
        zoom={12}
        onClick={handleMapClick}
      >
        <Marker position={marker} />
      </GoogleMap>

      <button onClick={handleSubmit} style={btn} disabled={loading}>
        {loading ? "Posting..." : "Post Property"}
      </button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btn = {
  marginTop: 16,
  padding: 12,
  width: "100%",
  borderRadius: 10,
  border: "none",
  background: "#000",
  color: "#fff",
  fontWeight: 600,
};