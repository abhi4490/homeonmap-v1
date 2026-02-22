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
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    if (!form.title) return "Title required";
    if (!form.price) return "Price required";
    if (!form.locality) return "Locality required";
    if (!/^\d{10}$/.test(form.phone)) return "Enter valid 10-digit phone";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first");
        setLoading(false);
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Add Property</h1>
          <p className="text-sm text-gray-500">
            Post your property on the map
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 space-y-5 mt-5">
        {/* TITLE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">Title</label>
          <input
            className="w-full mt-1 text-lg outline-none"
            placeholder="2BHK Flat, Corner Plot..."
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        {/* PRICE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">Price (₹)</label>
          <input
            className="w-full mt-1 text-lg outline-none"
            placeholder="e.g. 2500000"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />
        </div>

        {/* LOCALITY */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">Locality</label>
          <input
            className="w-full mt-1 text-lg outline-none"
            placeholder="Sector 20 Panchkula"
            value={form.locality}
            onChange={(e) =>
              setForm({ ...form, locality: e.target.value })
            }
          />
        </div>

        {/* PHONE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">Phone</label>
          <input
            maxLength={10}
            className="w-full mt-1 text-lg outline-none"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />
        </div>

        {/* IMAGE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">Photo</label>
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) =>
              handleImage(e.target.files?.[0])
            }
          />

          {imagePreview && (
            <img
              src={imagePreview}
              className="mt-3 rounded-xl w-full h-48 object-cover"
            />
          )}
        </div>

        {/* MAP */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">
            Tap map to place pin
          </label>

          <div className="mt-3">
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
          </div>
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg shadow-sm"
        >
          {loading ? "Posting..." : "Post Property"}
        </button>
      </div>
    </div>
  );
}