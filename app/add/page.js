"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  // 🚫 NOT LOGGED IN VIEW
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
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
      <h2>Add Property (Logged in)</h2>

      <p>
        Logged in as: <b>{user.email}</b>
      </p>

      <button onClick={logout}>Logout</button>

      <hr />

      <p>Form will go here (next step)</p>
    </div>
  );
}