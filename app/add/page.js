"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { GoogleMap, Marker } from "@react-google-maps/api";
import GoogleMapProvider from "../../components/GoogleMapProvider";
import { useRouter } from "next/navigation";

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddPropertyPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [marker, setMarker] = useState(center);

  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

    await supabase.storage.from("property-images").upload(fileName, image);

    return `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${fileName}`;
  };

  const submit = async () => {
    if (!user) return alert("Login required");

    if (!/^\d{10}$/.test(form.phone)) {
      alert("Enter valid mobile number");
      return;
    }

    setLoading(true);

    const imageUrl = await uploadImage();

    await supabase.from("properties").insert({
      ...form,
      price: Number(form.price),
      lat: marker.lat,
      lng: marker.lng,
      image_url: imageUrl,
      user_id: user.id,
    });

    alert("Property added!");
    router.push("/");
  };

  if (!user) return <div style={{ padding: 20 }}>Checking login...</div>;

  return (
    <GoogleMapProvider>
      <div style={{ maxWidth: 520, margin: "auto", padding: 20 }}>
        <h2 style={{ marginBottom: 16 }}>Add Property</h2>

        {["title", "price", "locality", "phone"].map((f) => (
          <input
            key={f}
            placeholder={f.toUpperCase()}
            value={form[f]}
            onChange={(e) =>
              setForm({ ...form, [f]: e.target.value })
            }
            style={input}
          />
        ))}

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginTop: 10 }}
        />

        <div style={{ marginTop: 14 }}>
          <GoogleMap
            mapContainerStyle={{ height: 320, borderRadius: 12 }}
            center={marker}
            zoom={12}
            onClick={handleMapClick}
          >
            <Marker position={marker} />
          </GoogleMap>
        </div>

        <button onClick={submit} style={btn}>
          {loading ? "Posting..." : "Post Property"}
        </button>
      </div>
    </GoogleMapProvider>
  );
}

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const btn = {
  marginTop: 16,
  width: "100%",
  padding: 14,
  background: "#000",
  color: "#fff",
  borderRadius: 12,
  border: "none",
  fontWeight: 600,
};