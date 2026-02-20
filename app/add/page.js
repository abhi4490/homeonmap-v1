"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session after redirect
  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user ?? null);
    setLoading(false);
  }

  // 🚀 Google login with intent saving
  async function loginWithGoogle() {
    localStorage.setItem("returnToAdd", "true");

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 120 }}>Checking login...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <h2>Login Required</h2>
        <p>You must login to add property</p>

        <button
          onClick={loginWithGoogle}
          style={{
            padding: "12px 20px",
            background: "#4285F4",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>
      <p>Logged in as <b>{user.email}</b></p>
      <p>✅ Login stable. Form will be added next.</p>
    </div>
  );
}