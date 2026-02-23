"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

// CHANGE THESE TO YOUR ACTUAL DETAILS
const MY_WHATSAPP_NUMBER = "919876543210"; // Keep 91, replace the rest with your number
const MY_EMAIL = "hello@homeonmap.com";

export default function ContactPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    role: "Buyer/User",
    message: ""
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
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
      options: { redirectTo: `${window.location.origin}/contact` },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // SMART WHATSAPP ROUTING
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      alert("Please fill in your name and message.");
      return;
    }

    // Formats the message perfectly for WhatsApp
    const whatsappText = `*New Inquiry from HomeOnMap*%0A%0A*Name:* ${form.name}%0A*I am a:* ${form.role}%0A*Message:* ${form.message}`;
    const whatsappUrl = `https://wa.me/${MY_WHATSAPP_NUMBER}?text=${whatsappText}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-sans relative overflow-hidden flex flex-col">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none"></div>

      {/* =========================================
        MOBILE-OPTIMIZED PREMIUM HEADER (Match v1.0)
        ========================================= */}
      <header className="relative z-50 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.05)] px-3 sm:px-8 py-4 flex justify-between items-center transition-all">
        <Link href="/" className="font-extrabold text-lg sm:text-2xl tracking-tight text-gray-900 flex items-center gap-1 sm:gap-2">
          <span className="text-2xl sm:text-3xl drop-shadow-sm">🏠</span> 
          <span className="hidden min-[380px]:block">HomeOnMap</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-black transition-colors uppercase tracking-wide mr-2">
            Back to Map
          </Link>
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-white/60 pl-3 pr-2 sm:pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <Link href="/my-listings" className="text-[10px] sm:text-xs font-extrabold text-gray-700 hover:text-black uppercase tracking-wide">
                Portfolio
              </Link>
              <div className="w-px h-4 bg-gray-300 mx-0.5 sm:mx-1"></div>
              <img src={user.user_metadata?.avatar_url || "https://www.gravatar.com/avatar/?d=mp"} alt="Profile" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-100 shadow-sm cursor-pointer" onClick={handleLogout}/>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} className="text-xs sm:text-sm font-bold text-gray-700 bg-white/80 border border-gray-200 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* =========================================
        MAIN CONTACT CONTENT
        ========================================= */}
      <div className="flex-grow flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-5xl bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/80 overflow-hidden flex flex-col md:flex-row">
          
          {/* LEFT SIDE: Direct Contact Info */}
          <div className="w-full md:w-2/5 bg-black p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Dark background blobs for contrast */}
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-gray-800 rounded-full mix-blend-screen filter blur-[80px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-2">Get in Touch.</h2>
              <p className="text-gray-400 font-medium mb-10 text-sm sm:text-base">
                Looking for premium builder placements, bulk dealer listings, or monetization partnerships? We are here to help.
              </p>

              <div className="space-y-8">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Direct WhatsApp</p>
                  <a href={`https://wa.me/${MY_WHATSAPP_NUMBER}`} target="_blank" className="text-xl font-bold hover:text-green-400 transition-colors flex items-center gap-2">
                    💬 +91 98765 43210
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Partnerships</p>
                  <a href={`mailto:${MY_EMAIL}`} className="text-lg font-bold hover:text-blue-400 transition-colors flex items-center gap-2">
                    ✉️ {MY_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Operating Region</p>
                  <p className="text-lg font-bold text-gray-200 flex items-center gap-2">
                    📍 Tricity (Chandigarh, Mohali, Panchkula)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Smart Form */}
          <div className="w-full md:w-3/5 p-8 sm:p-12">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Send a Quick Message</h3>
            
            <form onSubmit={handleSendMessage} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Your Name / Company</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g., Sunlit Urbana Builders"
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">I am a...</label>
                <div className="flex flex-wrap gap-2">
                  {['Buyer/User', 'Dealer/Broker', 'Builder/Developer'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({...form, role})}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 border ${
                        form.role === role 
                          ? 'bg-black text-white border-black shadow-md' 
                          : 'bg-white/50 text-gray-500 border-gray-200/60 hover:border-gray-400'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">How can we help you?</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  placeholder="Tell us about your query or partnership idea..."
                  rows="4"
                  className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/60 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all shadow-sm font-medium text-gray-800 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgb(0,0,0,0.1)] hover:bg-gray-900 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgb(0,0,0,0.15)] transition-all duration-300 flex justify-center items-center gap-2"
              >
                Launch Chat 🚀
              </button>
              
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}