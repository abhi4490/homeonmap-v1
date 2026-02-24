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

// ADDED NEW CHANDIGARH AND KHARAR
const LOCATIONS = [
  { name: "Zirakpur", coords: { lat: 30.6425, lng: 76.8173 } },
  { name: "Panchkula", coords: { lat: 30.6942, lng: 76.8606 } },
  { name: "Panchkula Ext-2", coords: { lat: 30.622143, lng: 76.938349 } },
  { name: "Mohali", coords: { lat: 30.7046, lng: 76.7179 } },
  { name: "New Chandigarh", coords: { lat: 30.7855, lng: 76.7289 } },
  { name: "Kharar", coords: { lat: 30.7414, lng: 76.6412 } },
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
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.05)] px-3 sm:px-8 py-3 flex flex-col gap-3 transition-all">
        <div className="flex justify-between items-center w-full">
          <div className="font-extrabold text-lg sm:text-2xl tracking-tight text-gray-900 flex items-center gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl drop-shadow-sm">🏠</span> 
            <span className="hidden min-[380px]:block">HomeOnMap</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-white/60 pl-3 pr-2 sm:pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                <Link href="/my-listings" className="text-[10px] sm:text-xs font-extrabold text-gray-700 hover:text-black uppercase tracking-wide">
                  Portfolio
                </Link>
                <div className="w-px h-4 bg-gray-300 mx-0.5 sm:mx-1"></div>
                <img 
                  src={user.user_metadata?.avatar_url || "https://www.gravatar.com/avatar/?d=mp"} 
                  alt="Profile" 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-100 shadow-sm cursor-pointer" 
                  onClick={handleLogout}
                  title="Click to Logout"
                />
                <button onClick={handleLogout} className="hidden md:block text-xs font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-wide">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="text-xs sm:text-sm font-bold text-gray-700 bg-white/80 border border-gray-200 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                Sign In
              </button>
            )}

            <Link
              href="/add"
              className="bg-black text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg shadow-black/20 hover:bg-gray-800 transition-all duration-300 flex items-center gap-1 sm:gap-2"
            >
              <span className="text-base sm:text-lg leading-none">+</span> 
              <span className="hidden sm:block">Post Property</span>
              <span className="block sm:hidden text-xs">Post</span>
            </Link>
          </div>
        </div>

        <div className="flex w-full overflow-x-auto gap-2 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => panToLocation(loc.coords)}
              className="whitespace-nowrap px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-600 bg-white/80 backdrop-blur-md border border-gray-200/80 hover:text-black hover:bg-gray-100 hover:shadow-sm rounded-xl transition-all duration-300 shadow-sm"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </header>

      {/* FULL SCREEN MAP */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
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
                url: p.role === "dealer" 
                  ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* DIRECT WHATSAPP FLOATING BUTTON */}
      {!selected && (
        <a
          href="https://wa.me/918501000700?text=Hello%20HomeOnMap,%20I%20have%20an%20inquiry%20about%20partnerships%20or%20listings."
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-40 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-[0_4px_12px_rgba(37,211,102,0.4)] hover:bg-[#1ebd57] hover:scale-110 transition-transform duration-300 flex items-center justify-center"
        >
          <span className="text-3xl leading-none drop-shadow-sm mt-0.5">💬</span>
        </a>
      )}

      {/* PROPERTY CARD */}
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
                <img src={selected.image_url} className="w-full h-48 sm:h-64 md:h-full object-cover" alt={selected.title} />
              ) : (
                <div className="w-full h-48 sm:h-64 md:h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-sm font-medium">No Image</span>
                </div>
              )}
              {/* Image Verified Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-green-700 shadow-sm flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Verified
              </div>
            </div>

            <div className="p-5 sm:p-6 w-full md:w-3/5 flex flex-col justify-between bg-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight pr-8">{selected.title}</h2>
                <p className="text-gray-500 font-bold mt-1 sm:mt-2 flex items-center gap-1.5 text-sm sm:text-base">
                  <span className="text-lg">📍</span> {selected.locality}
                </p>
                
                <div className="flex items-center gap-3 mt-3 sm:mt-4">
                  <div className="inline-block bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                    <span className="text-xl sm:text-2xl font-black text-black tracking-tight">
                      ₹ {Number(selected.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  
                  {/* ROLE BADGE (Owner vs Dealer) */}
                  <div className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wide border ${
                    selected.role === 'dealer' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {selected.role === 'dealer' ? '🏢 Dealer' : '👤 Owner'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-8">
                <a href={`tel:${selected.phone}`} className="flex-1 bg-gray-100 text-gray-900 text-center py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-200 transition-all flex justify-center items-center gap-1 sm:gap-2 text-sm sm:text-base">
                  📞 Call
                </a>
                <a href={`https://wa.me/91${selected.phone}`} target="_blank" className="flex-[2] bg-[#25D366] text-white text-center py-3 sm:py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-[#1ebd57] transition-all flex justify-center items-center gap-1 sm:gap-2 text-sm sm:text-base">
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