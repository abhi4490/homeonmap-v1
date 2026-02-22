"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import MapLoader from "@/components/MapLoader";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

const mapContainerStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "16px",
};

const defaultCenter = {
  lat: 30.7333,
  lng: 76.7794,
};

export default function AddPropertyPage() {
  const router = useRouter();
  const [marker, setMarker] = useState(defaultCenter);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.title) return "Enter title";
    if (!form.price) return "Enter price";
    if (!form.locality) return "Enter locality";
    if (!/^\d{10}$/.test(form.phone)) return "Enter valid mobile number";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return alert(error);

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first");
        return;
      }

      let imageUrl = null;

      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, form.image);

        if (uploadError) throw uploadError;

        imageUrl = `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${fileName}`;
      }

      const { error: insertError } = await supabase.from("properties").insert({
        title: form.title,
        price: Number(form.price),
        locality: form.locality,
        phone: form.phone,
        lat: marker.lat,
        lng: marker.lng,
        image_url: imageUrl,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      alert("Property added successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Error adding property");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* PREMIUM HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-semibold">Add Property</h1>
          <p className="text-gray-500 text-sm">
            Post your property directly on the map
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 space-y-5 mt-6">
        {/* CARD */}
        <Card label="Title">
          <input
            placeholder="2BHK Flat, Corner Plot..."
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Card>

        <Card label="Price (₹)">
          <input
            placeholder="2500000"
            className="input"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </Card>

        <Card label="Locality">
          <input
            placeholder="Sector 20 Panchkula"
            className="input"
            value={form.locality}
            onChange={(e) => setForm({ ...form, locality: e.target.value })}
          />
        </Card>

        <Card label="Mobile Number">
          <input
            maxLength={10}
            placeholder="10-digit number"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Card>

        {/* IMAGE */}
        <Card label="Photo">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              className="mt-3 rounded-xl w-full h-48 object-cover"
            />
          )}
        </Card>

        {/* MAP */}
        <Card label="Tap map to place pin">
          <MapLoader>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={marker}
              zoom={13}
              onClick={handleMapClick}
            >
              <Marker position={marker} />
            </GoogleMap>
          </MapLoader>
        </Card>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl font-semibold shadow-lg"
        >
          {loading ? "Posting..." : "Post Property"}
        </button>
      </div>
    </div>
  );
}

/* Small reusable card */
function Card({ label, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <label className="text-sm text-gray-500">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}