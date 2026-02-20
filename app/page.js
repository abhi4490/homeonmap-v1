"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {

  // 🔥 Force redirect back to /add after OAuth
  useEffect(() => {
    async function handleRedirect() {
      const returnToAdd = localStorage.getItem("returnToAdd");

      if (!returnToAdd) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        localStorage.removeItem("returnToAdd");
        window.location.href = "/add";
      }
    }

    handleRedirect();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>HomeOnMap</h1>
      <p>Map page continues here (unchanged UI)</p>
    </div>
  );
}