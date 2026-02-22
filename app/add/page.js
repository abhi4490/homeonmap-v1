"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

const mapStyle = {
  width: "100%",
  height: "260px",
  borderRadius: "18px",
};

const defaultCenter = { lat: 30.7333, lng: 76.7794 };

// 💰 Indian price formatter
function formatIndian(value) {
  const num = Number(value.replace(/,/g, ""));
  if (!num) return null;

  const formatted = num.toLocaleString("en-IN");

  let label = "";
  if (num >= 10000000) label = (num / 10000000).toFixed(2) + " Cr";
  else if (num >= 100000) label = (num / 100000).toFixed(1) + " Lakh";

  return { formatted, label };
}

export default function AddPropertyPage() {
  const router = useRouter();

  const [marker, setMarker] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
    image: null,
  });

  const priceInfo = formatIndian(form.price);

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
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.title) return "Enter title";
    if (!form.price) return "Enter price";
    if (!form.locality) return "Enter locality";
    if (!/^\d{10}$/.test(form.phone)) return "Enter valid 10-digit number";
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

      if (!user) return alert("Login required");

      let imageUrl = null;

      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name}`;

        await supabase.storage
          .from("property-images")
          .upload(fileName, form.image);

        imageUrl = `https://djxkfbavvjmoowqspwbg.supabase.co/storage/v1/object/public/property-images/${fileName}`;
      }

      await supabase.from("properties").insert({
        title: form.title,
        price: Number(form.price.replace(/,/g, "")),
        locality: form.locality,
        phone: form.phone,
        lat: marker.lat,
        lng: marker.lng,
        image_url: imageUrl,
        user_id: user.id,
      });

      alert("Property posted 🚀");
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("Error posting property");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      {/* 🧊 GLASS HEADER */}
      <div className="sticky top-0 bg-white/70 backdrop-blur border-b z-20">
        <div className="max-w-xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Add Property</h1>
          <p className="text-sm text-gray-500">
            List your property in seconds
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* TITLE */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <label className="text-xs text-gray-400">TITLE</label>
          <input
            className="w-full mt-1 text-xl font-semibold outline-none"
            placeholder="2BHK, Corner Plot..."
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        {/* PRICE */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <label className="text-xs text-gray-400">PRICE</label>
          <input
            inputMode="numeric"
            className="w-full mt-1 text-xl font-semibold outline-none"
            placeholder="2500000"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          {priceInfo && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              ₹{priceInfo.formatted}
              {priceInfo.label && ` • ${priceInfo.label}`}
            </div>
          )}
        </div>

        {/* LOCALITY */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <label className="text-xs text-gray-400">LOCALITY</label>
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
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <label className="text-xs text-gray-400">MOBILE</label>
          <input
            inputMode="numeric"
            maxLength={10}
            className="w-full mt-1 text-lg outline-none"
            placeholder="10-digit number"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />
        </div>

        {/* IMAGE */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <label className="text-xs text-gray-400">PHOTO</label>
          <input
            type="file"
            accept="image/*"
            className="mt-3"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />

          {preview && (
            <img
              src={preview}
              className="mt-4 rounded-2xl w-full h-48 object-cover"
            />
          )}
        </div>

        {/* MAP */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <label className="text-xs text-gray-400">
            TAP MAP TO PLACE PIN
          </label>

          <div className="mt-3">
            <GoogleMap
              mapContainerStyle={mapStyle}
              center={marker}
              zoom={13}
              onClick={handleMapClick}
            >
              <Marker position={marker} />
            </GoogleMap>
          </div>
        </div>
      </div>

      {/* 🚀 FLOATING CTA */}
      <div className="fixed bottom-5 left-0 right-0 px-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold shadow-lg active:scale-95 transition"
          >
            {loading ? "Posting..." : "Post Property"}
          </button>
        </div>
      </div>
    </div>
  );
}