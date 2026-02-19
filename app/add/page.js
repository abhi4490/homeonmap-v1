"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "350px",
};

const defaultCenter = {
  lat: 30.6942,
  lng: 76.8606,
};

export default function AddProperty() {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  });

  async function handleSubmit(e) {
    e.preventDefault();

    let imageUrl = null;

    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, image, {
          contentType: image.type,
        });

      if (uploadError) {
        alert("Image upload failed");
        return;
      }

      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("properties").insert([
      {
        title,
        city,
        price: Number(price),
        phone,
        latitude: location.lat,
        longitude: location.lng,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error adding property");
    } else {
      alert("Property added!");
      setTitle("");
      setCity("");
      setPrice("");
      setPhone("");
      setImage(null);
    }
  }

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Property</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginBottom: 10, width: "100%" }}
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          style={{ marginBottom: 10, width: "100%" }}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{ marginBottom: 10, width: "100%" }}
        />

        <input
          placeholder="Owner Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ marginBottom: 10, width: "100%" }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: 10 }}
        />

        <p>Click map to set location:</p>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={13}
          onClick={(e) =>
            setLocation({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            })
          }
        >
          <Marker position={location} />
        </GoogleMap>

        <button style={{ marginTop: 10 }}>Add Property</button>
      </form>
    </div>
  );
}
