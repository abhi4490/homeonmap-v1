"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddProperty() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [marker, setMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, []);

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/add",
      },
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!marker) {
      alert("Please select location on map");
      return;
    }

    let imageUrl = null;

    // Upload image
    if (image) {
      const name = Date.now() + "_" + image.name.replace(/\s+/g, "_");

      await supabase.storage
        .from("property-images")
        .upload(name, image);

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${name}`;
    }

    // Insert property
    await supabase.from("properties").insert([
      {
        title,
        price,
        phone,
        lat: marker.lat,
        lng: marker.lng,
        image_url: imageUrl,
        user_id: user.id, // 🔥 ownership
      },
    ]);

    alert("Property added 🎉");
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Login Required</h2>
        <button onClick={loginWithGoogle}>
          Continue with Google
        </button>
      </div>
    );
  }

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>
      <p>Logged in as {user.email}</p>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          required
        /><br /><br />

        <input
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
          required
        /><br /><br />

        <input
          placeholder="Phone"
          onChange={(e) => setPhone(e.target.value)}
          required
        /><br /><br />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        /><br /><br />

        <GoogleMap
          mapContainerStyle={{ height: 300, width: "100%" }}
          center={center}
          zoom={12}
          onClick={(e) =>
            setMarker({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            })
          }
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>

        <br />
        <button>Add Property</button>
      </form>
    </div>
  );
}