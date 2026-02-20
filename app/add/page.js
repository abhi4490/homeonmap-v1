"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session after OAuth redirect
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

  // 🚀 Google login (with correct redirect)
  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/add",
      },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  // ⏳ Loading state (important after redirect)
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        Checking login...
      </div>
    );
  }

  // 🚫 NOT LOGGED IN VIEW
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

  // ✅ LOGGED IN VIEW
  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>

      <p>
        Logged in as: <b>{user.email}</b>
      </p>

      <button onClick={logout}>Logout</button>

      <hr />

      <p style={{ marginTop: 20 }}>
        ✅ Google login working.  
        Next step: attach property form.
      </p>
    </div>
  );
}