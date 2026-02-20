"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MyListings() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      window.location.href = "/add";
      return;
    }

    setUser(session.user);
    fetchListings(session.user.id);
  }

  async function fetchListings(userId) {
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    setProperties(data || []);
    setLoading(false);
  }

  async function deleteListing(id) {
    const confirmDelete = confirm("Delete this listing?");
    if (!confirmDelete) return;

    await supabase.from("properties").delete().eq("id", id);

    setProperties(properties.filter((p) => p.id !== id));
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading your listings...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Listings</h2>
      <p>Logged in as {user.email}</p>

      {properties.length === 0 && (
        <p>You haven’t posted anything yet.</p>
      )}

      <div style={grid}>
        {properties.map((p) => (
          <div key={p.id} style={card}>
            {p.image_url && <img src={p.image_url} style={img} />}

            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ color: "#16a34a", fontWeight: 700 }}>
              ₹ {p.price}
            </div>

            <div style={{ fontSize: 12, color: "#666" }}>
              📞 {p.phone}
            </div>

            <button
              onClick={() => deleteListing(p.id)}
              style={deleteBtn}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* styles */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
  gap: 16,
  marginTop: 20,
};

const card = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

const img = {
  width: "100%",
  height: 140,
  objectFit: "cover",
  borderRadius: 8,
  marginBottom: 8,
};

const deleteBtn = {
  marginTop: 10,
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};