"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MyListings() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    setUser(user);

    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setListings(data || []);
    setLoading(false);
  };

  const deleteListing = async (id) => {
    const confirmDelete = confirm("Delete this listing?");
    if (!confirmDelete) return;

    await supabase.from("properties").delete().eq("id", id);

    setListings(listings.filter((l) => l.id !== id));
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={container}>
      <h2 style={title}>My Listings</h2>

      {listings.length === 0 && (
        <p style={{ color: "#666" }}>No listings yet.</p>
      )}

      <div style={grid}>
        {listings.map((p) => (
          <div key={p.id} style={card}>
            {/* Image */}
            {p.image_url && (
              <img src={p.image_url} style={image} />
            )}

            {/* Title */}
            <div style={cardTitle}>{p.title}</div>

            {/* Locality */}
            {p.locality && (
              <div style={sub}>📍 {p.locality}</div>
            )}

            {/* Price */}
            <div style={price}>
              ₹ {Number(p.price).toLocaleString("en-IN")}
            </div>

            {/* Buttons */}
            <div style={actions}>
              {p.phone && (
                <a href={`tel:${p.phone}`} style={callBtn}>
                  Call
                </a>
              )}

              <button
                onClick={() => deleteListing(p.id)}
                style={deleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* STYLES */

const container = {
  maxWidth: 900,
  margin: "auto",
  padding: 20,
};

const title = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 16,
};

const grid = {
  display: "grid",
  gap: 16,
};

const card = {
  background: "#fff",
  borderRadius: 14,
  padding: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
};

const image = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: 10,
  marginBottom: 8,
};

const cardTitle = {
  fontWeight: 700,
  fontSize: 16,
};

const sub = {
  fontSize: 13,
  color: "#666",
  marginTop: 2,
};

const price = {
  fontWeight: 700,
  marginTop: 6,
  fontSize: 16,
};

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const callBtn = {
  flex: 1,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: 8,
  textAlign: "center",
  textDecoration: "none",
};

const deleteBtn = {
  flex: 1,
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: 8,
  cursor: "pointer",
};