"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

// Default center
const defaultCenter = { lat: 30.7333, lng: 76.7794 };

// Hyperlocal zones for the header
const LOCATIONS = [
  { name: "Chandigarh", coords: { lat: 30.7333, lng: 76.7794 } },
  { name: "Panchkula Ext-2", coords: { lat: 30.6500, lng: 76.8500 } },
  { name: "Mohali", coords: { lat: 30.7046, lng: 76.7179 } },
];

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProperties();
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    setProperties(data || []);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const panToLocation = useCallback((coords) => {
    if (mapRef.current) {
      mapRef.current.panTo(coords);
      mapRef.current.setZoom(14);
    }
  }, []);

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-screen w-full bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl font-bold text-gray-800 tracking-tight">Loading Map...</div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      
      {/* =========================================
        TRUE PREMIUM HEADER (Fixed to Top)
        =========================================
      */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.05)] px-4 sm:px-8 py-4 flex justify-between items-center transition-all">
        
        {/* Left: Branding */}
        <div className="flex flex-col">
          <div className="font-extrabold text-2xl tracking-tight text-gray-900 flex items-center gap-2">
            <span className="text-3xl drop-shadow-sm">🏠</span> HomeOnMap
          </div>
          <span className="text-[0.65rem] font-bold text-gray-500 tracking-widest uppercase ml-10">
            By Dreamkey Properties
          </span>
        </div>

        {/* Center: Hyperlocal Map Controls (Hidden on very small screens) */}
        <div className="hidden lg:flex bg-gray-100/60 backdrop-blur-md p-1.5 rounded-2xl gap-1 border border-gray-200/50 shadow-inner">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => panToLocation(loc.coords)}
              className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-black hover:bg-white hover:shadow-sm rounded-xl transition-all duration-300"
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Right: Auth & Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden sm:flex items-center gap-3 bg-white/60 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <img src={user.user_metadata?.avatar_url || "https://www.gravatar.com/avatar/?d=mp"} alt="Profile" className="w-8 h-8 rounded-full border border-gray-100" />
              <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-wide">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="hidden sm:block text-sm font-bold text-gray-700 bg-white/80 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              Sign In
            </button>
          )}

          <Link
            href="/add"
            className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-black/20 hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Post Property
          </Link>
        </div>
      </header>

      {/* MAP */}
      <div className="pt-[88px] h-full w-full">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={defaultCenter}
          zoom={12}
          options={{ 
            disableDefaultUI: true, 
            zoomControl: true,
            zoomControlOptions: { position: window.google?.maps?.ControlPosition?.RIGHT_CENTER },
            styles: [
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
            ]
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {properties.map((p) => (
            <Marker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              onClick={() => setSelected(p)}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* PREMIUM ZILLOW-STYLE PROPERTY CARD */}
      {selected && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center p-4 z-40 pointer-events-none">
          <div className="bg-white w-full max-w-md md:max-w-3xl rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slideUp relative pointer-events-auto flex flex-col md:flex-row">
            
            <button 
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md transition-all z-20"
            >
              ✕
            </button>

            <div className="w-full md:w-2/5 relative">
              {selected.image_url ? (
                <img src={selected.image_url} className="w-full h-64 md:h-full object-cover" alt={selected.title} />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-sm font-medium">No Image</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-green-700 shadow-sm flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Verified
              </div>
            </div>

            <div className="p-6 w-full md:w-3/5 flex flex-col justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight pr-8">{selected.title}</h2>
                <p className="text-gray-500 font-bold mt-2 flex items-center gap-1.5">
                  <span className="text-lg">📍</span> {selected.locality}
                </p>
                <div className="mt-5 inline-block bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
                  <span className="text-2xl font-black text-black tracking-tight">
                    ₹ {Number(selected.price).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <a href={`tel:${selected.phone}`} className="flex-1 bg-gray-100 text-gray-900 text-center py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex justify-center items-center gap-2">
                  📞 Call
                </a>
                <a href={`https://wa.me/91${selected.phone}`} target="_blank" className="flex-[2] bg-[#25D366] text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-[#1ebd57] transition-all flex justify-center items-center gap-2">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}