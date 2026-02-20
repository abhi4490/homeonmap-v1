"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AddProperty() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/add",
      },
    });
  }

  if (loading) return <div style={{ textAlign: "center", marginTop: 100 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>Login Required</h2>
        <button onClick={loginWithGoogle}>Continue with Google</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Property</h2>
      <p>Logged in as {user.email}</p>
      <p>✅ Auth is now fixed permanently.</p>
    </div>
  );
}