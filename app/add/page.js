"use client";

import { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "1rem",
};

const center = { lat: 30.7333, lng: 76.7794 }; // Defaults to Chandigarh area

export default function AddProperty() {
  const router = useRouter();
  
  // Auth states
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marker, setMarker] = useState(center);
  const [form, setForm] = useState({
    title: "",
    price: "",
    locality: "",
    phone: "",
    image: null,
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthChecking(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/add` },
    });
  };

  // SMART PRICE UX: Calculates Lakhs and Crores dynamically
  const getPriceHint = (val) => {
    if (!val || isNaN(val)) return null;
    const num = Number(val);
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Crore`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.phone) {
      alert("Please fill in the required fields.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let imageUrl = null;

      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
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

      router.push("/");
    } catch (error) {
      console.error("Error adding property:", error);
      alert("Failed to post property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. LOADING STATE
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. GLASSMORPHIC LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

        <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white relative z-10 text-center">
          <div className="text-5xl mb-6 drop-shadow-sm">🏠</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mb-8 font-medium">Sign in to list your property on the map.</p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/80 border border-gray-200 text-gray-800 font-bold py-4 px-4 rounded-2xl hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // 3. ULTRA-PREMIUM ADD PROPERTY FORM
  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-sans">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full mix-blend-multiply filter blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/80 space-y-8 relative z-10">
        
        <div className="flex justify-between items-end border-b border-gray-200/50 pb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">List Property</h1>
            <p className="text-gray-500 font-medium mt-2">Drop a pin and add details to go live instantly.</p>
          </div>
          <button onClick={() => router.push("/")} className="text-gray-400 hover:text-black transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-xl border border-gray-100">
            ✕ Cancel
          </button>
        </div>

        <div className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Property Title</label>
            <input
              placeholder="e.g., Luxury 3BHK Villa in Mohali"
              className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm placeholder-gray-400 font-medium text-gray-800"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* GRID FOR PRICE & LOCALITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Price (₹)</label>
              <input
                type="number"
                placeholder="15000000"
                className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm font-bold text-gray-800"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              {/* SMART PRICE HINT */}
              {form.price && (
                <div className="absolute right-4 top-[2.4rem] bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md animate-fade-in pointer-events-none">
                  {getPriceHint(form.price)}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Locality</label>
              <input
                placeholder="e.g., Panchkula Extension-2"
                className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm font-medium text-gray-800"
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
              />
            </div>
          </div>

          {/* PHONE & IMAGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">WhatsApp Number</label>
              <div className="relative">
                <span className="absolute left-4 top-[1.1rem] text-gray-500 font-bold">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-4 pl-14 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm font-bold text-gray-800 tracking-wide"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Cover Image</label>
              <div className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-2.5 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-black focus-within:bg-white">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer transition-all"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                />
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="pt-2">
            <div className="flex justify-between items-end mb-3 ml-1">
              <label className="block text-sm font-bold text-gray-700">Pin Exact Location</label>
              <span className="text-xs font-semibold text-gray-400 bg-white/50 px-2 py-1 rounded-md">Click map to move pin</span>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] relative bg-white/50 p-1">
              {isLoaded ? (
                <div className="rounded-xl overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={marker}
                    zoom={13}
                    options={{ disableDefaultUI: true, zoomControl: true }}
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
              ) : (
                <div className="h-[300px] bg-gray-100/50 flex flex-col items-center justify-center text-gray-400 rounded-xl">
                   <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mb-3"></div>
                   <span className="font-semibold text-sm">Loading map interface...</span>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-lg tracking-wide shadow-[0_10px_20px_rgb(0,0,0,0.1)] transition-all duration-300 flex justify-center items-center gap-2 ${
                isSubmitting 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed transform-none" 
                  : "bg-black text-white hover:bg-gray-900 hover:shadow-[0_15px_30px_rgb(0,0,0,0.15)] hover:-translate-y-1"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  Publishing to Map...
                </>
              ) : (
                "Post Property Live"
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}