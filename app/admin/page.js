"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 यहाँ अपनी असली ईमेल आईडी डालें जो एडमिन होगी
  const ADMIN_EMAIL = "abhijeetdangi44@gmail.com"; 

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push("/"); // अगर लॉग इन नहीं है, तो होमपेज पर भेज दो
      return;
    }

    if (session.user.email !== ADMIN_EMAIL) {
      alert("Access Denied! You are not the admin.");
      router.push("/"); // अगर ईमेल मैच नहीं हुई, तो होमपेज पर भेज दो
      return;
    }

    setUser(session.user);
    setIsAdmin(true);
    fetchProperties();
  };

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching properties:", error);
    else setProperties(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this property?");
    if (!confirmDelete) return;

    // ⚠️ नोट: अगर RLS पॉलिसी लगी है, तो डिलीट करने के लिए Supabase में एडमिन को परमिशन देनी होगी
    const { error } = await supabase.from("properties").delete().eq("id", id);
    
    if (error) {
      alert("Error deleting property. Check Supabase RLS policies.");
      console.error(error);
    } else {
      alert("Property Deleted Successfully!");
      fetchProperties(); // लिस्ट को रिफ्रेश करें
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">👑 Admin Control Panel</h1>
            <p className="text-gray-500 font-medium mt-1">Manage HomeOnMap platform and monitor traffic.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all">
              🏠 View Site
            </Link>
            {/* VERCEL ANALYTICS BUTTON */}
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              📈 View Live Traffic
            </a>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-bold mb-1">Total Properties Live</h3>
            <p className="text-4xl font-black text-gray-900">{properties.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-bold mb-1">Platform Status</h3>
            <p className="text-2xl font-black text-green-600 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>

        {/* PROPERTIES TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900">All Live Properties</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm font-bold uppercase tracking-wide">
                  <th className="p-4 border-b border-gray-100">Title & Locality</th>
                  <th className="p-4 border-b border-gray-100">Price</th>
                  <th className="p-4 border-b border-gray-100">Role</th>
                  <th className="p-4 border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-gray-500 font-bold">Loading properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-gray-500 font-bold">No properties found on the map.</td>
                  </tr>
                ) : (
                  properties.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-50">
                        <p className="font-bold text-gray-900">{p.title}</p>
                        <p className="text-sm text-gray-500">{p.locality}</p>
                      </td>
                      <td className="p-4 border-b border-gray-50 font-black text-gray-800">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${p.role === 'dealer' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {p.role}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-50 text-right">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}