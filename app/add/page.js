"use client";

import { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const containerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "0.75rem",
};

const center = { lat: 30.7333, lng: 76.7794 };

export default function AddProperty() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(center);
  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
    image: null,
  });

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.phone) {
      alert("Please fill in the required fields.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first to post a property.");
        setIsSubmitting(false);
        return;
      }

      let imageUrl = null;

      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, form.image);

        if (uploadError) throw uploadError;

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${fileName}`;
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

      alert("Property posted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error adding property:", error);
      alert("Failed to post property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 space-y-6">
        
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Post a Property</h1>
          <p className="text-gray-500 mt-2">Fill in the details below to list your property on the map.</p>
        </div>

        <div className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Property Title</label>
            <input
              placeholder="e.g., Luxury 3BHK Villa"
              className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* GRID FOR PRICE & LOCALITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                placeholder="e.g., 15000000"
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Locality</label>
              <input
                placeholder="e.g., Panchkula Extension-2"
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
              />
            </div>
          </div>

          {/* PHONE & IMAGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp/Phone</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Property Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-200 p-3.5 rounded-xl text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
              />
            </div>
          </div>

          {/* MAP */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Location on Map</label>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={marker}
                  zoom={13}
                  onClick={(e) =>
                    setMarker({
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng(),
                    })
                  }
                >
                  <Marker position={marker} />
                </GoogleMap>
              ) : (
                <div className="h-[250px] bg-gray-100 flex items-center justify-center text-gray-400">
                  Loading map...
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
              isSubmitting 
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : "bg-black text-white hover:bg-gray-800 hover:shadow-xl"
            }`}
          >
            {isSubmitting ? "Posting Property..." : "Post Property"}
          </button>
        </div>
      </div>
    </div>
  );
}