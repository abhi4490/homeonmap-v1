"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyListings() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      setLoading(false);
      return;
    }
    setUser(session.user);

    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setListings(data || []);
    setLoading(false);
  };

  const deleteListing = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this property? This action cannot be undone.");
    if (!confirmDelete) return;

    // Instantly remove from UI for a snappy, premium feel
    setListings(listings.filter((l) => l.id !== id));

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert("Failed to delete listing. Please try again.");
      loadListings(); // reload if backend deletion fails
    }
  };

  // 1. PREMIUM LOADING SPINNER
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. GLASSMORPHIC LOGIN REQUIRED STATE
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white text-center relative z-10">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Login Required</h1>
          <p className="text-gray-500 mb-8 font-medium">Please sign in to view and manage your property listings.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-black text-white font-bold py-4 px-4 rounded-2xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
          >
            Go to Homepage to Sign In
          </button>
        </div>
      </div>
    );
  }

  // 3. ULTRA-PREMIUM LISTINGS DASHBOARD
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Portfolio</h1>
            <p className="text-gray-500 font-medium mt-2">Manage your active listings on HomeOnMap.</p>
          </div>
          <Link
            href="/"
            className="bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all flex items-center gap-2"
          >
            <span>←</span> Back to Map
          </Link>
        </div>

        {/* Empty State */}
        {listings.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No listings yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't posted any properties yet. Drop a pin on the map to get started!</p>
            <Link
              href="/add"
              className="inline-block bg-black text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-black/20 hover:bg-gray-800 hover:-translate-y-1 transition-all"
            >
              + Post Your First Property
            </Link>
          </div>
        ) : (
          
          /* Zillow-Style Property Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((p) => (
              <div key={p.id} className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-white/60 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col group">
                
                {/* Image Area */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <span className="text-3xl mb-2">📷</span>
                      <span className="text-sm font-medium">No Image</span>
                    </div>
                  )}
                  {/* Live Status Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-green-700 shadow-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Live on Map
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-6 flex flex-col flex-grow justify-between bg-white/50">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-2 line-clamp-2">{p.title}</h3>
                    {p.locality && (
                      <p className="text-gray-500 font-semibold text-sm flex items-center gap-1.5 mb-4">
                        📍 {p.locality}
                      </p>
                    )}
                    <div className="text-2xl font-black text-black tracking-tight mb-6">
                      ₹ {Number(p.price).toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteListing(p.id)}
                    className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-500 hover:text-white transition-colors duration-300 flex justify-center items-center gap-2"
                  >
                    🗑️ Delete Listing
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}