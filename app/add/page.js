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
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [role, setRole] = useState("owner");
  const [image, setImage] = useState(null);
  const [marker, setMarker] = useState(center);

  if (!isLoaded) return <div>Loading map...</div>;

  // 📧 SEND EMAIL OTP
  async function sendOtp() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (!error) alert("OTP sent to your email 📧");
  }

  // 🔐 VERIFY EMAIL OTP
  async function verifyOtp() {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (!error) {
      setVerified(true);
      alert("Email verified ✅");
    } else {
      alert("Invalid OTP");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!verified) {
      alert("Please verify email first");
      return;
    }

    // Listing limit (5 free)
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("phone", phone);

    if (existing && existing.length >= 5) {
      alert("Free listing limit reached (5)");
      return;
    }

    let imageUrl = null;

    if (image) {
      const name = Date.now() + "_" + image.name.replace(/\s+/g, "_");

      await supabase.storage.from("property-images").upload(name, image);

      imageUrl = `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${name}`;
    }

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

    alert("Property added successfully 🎉");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} required /><br /><br />
        <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} required /><br /><br />
        <input placeholder="Phone (visible to buyers)" onChange={(e) => setPhone(e.target.value)} required /><br /><br />

        {/* EMAIL OTP */}
        <input
          placeholder="Email for verification"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="button" onClick={sendOtp}>Send OTP</button>
        <br /><br />

        <input
          placeholder="Enter Email OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="button" onClick={verifyOtp}>Verify OTP</button>

        {verified && <div style={{ color: "green" }}>Verified ✅</div>}
        <br /><br />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="owner">Owner</option>
          <option value="broker">Broker</option>
        </select>
        <br /><br />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <br /><br />

        <button>Add Property</button>
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