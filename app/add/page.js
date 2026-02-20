"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { signInWithGoogle, getCurrentUser } from "../../lib/auth";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function AddProperty() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleMapClick = (e) => {
    setSelectedLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert("Select location on map");
      return;
    }

    let imageUrl = "";

    if (image) {
      const fileName = `${Date.now()}_${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, image);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${fileName}`;
    }

    const { error } = await supabase.from("properties").insert([
      {
        title,
        price,
        phone,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        image_url: imageUrl,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Property added!");
      window.location.href = "/";
    }
  };

  // 🛑 If NOT logged in
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>Login to Add Property</h2>
        <button
          onClick={signInWithGoogle}
          style={{
            padding: "12px 20px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    );
  }

  // ✅ Logged in view
  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <br />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <br />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <br />

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onClick={handleMapClick}
          >
            {selectedLocation && (
              <Marker position={selectedLocation} />
            )}
          </GoogleMap>
        )}

        <br />
        <button type="submit">Add Property</button>
      </form>
    </div>
  );
}