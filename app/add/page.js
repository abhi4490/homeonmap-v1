"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  // 🔥 Robust session restore
  async function restoreSession() {
    let attempts = 0;

    while (attempts < 5) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 400));
      attempts++;
    }

    setLoading(false);
  }

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
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        Restoring session...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <h2>Login Required</h2>

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

      <p>
        Logged in as <b>{user.email}</b>
      </p>

      <p style={{ marginTop: 20 }}>
        ✅ Google login finally stable.
      </p>
    </div>
  );
}