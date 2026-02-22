"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BuyerIntentFloating() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    intent: "Buy Property",
    locality: "",
    budget_min: "",
    budget_max: "",
    notes: "",
  });

  const submit = async () => {
    if (!form.name || !form.phone) {
      alert("Name and phone required");
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      alert("Enter valid 10-digit phone");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("buyer_requests").insert({
      name: form.name,
      phone: form.phone,
      intent: form.intent,
      locality: form.locality,
      budget_min: form.budget_min || null,
      budget_max: form.budget_max || null,
      notes: form.notes,
    });

    setLoading(false);

    if (error) {
      alert("Something went wrong");
      console.error(error);
      return;
    }

    alert("We’ll help you find the right property 🤝");
    setOpen(false);
  };

  return (
    <>
      {/* Floating Hint */}
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-white shadow-lg rounded-full px-4 py-3 cursor-pointer hover:shadow-xl transition z-50 border"
      >
        <span className="text-sm font-medium">
          Looking for a home? 👀
        </span>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-gray-400"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Tell us what you're looking for
            </h2>

            <div className="space-y-3">
              <input
                placeholder="Your name"
                className="w-full border rounded-lg px-3 py-2"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Mobile number"
                className="w-full border rounded-lg px-3 py-2"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                placeholder="Preferred area (optional)"
                className="w-full border rounded-lg px-3 py-2"
                value={form.locality}
                onChange={(e) =>
                  setForm({ ...form, locality: e.target.value })
                }
              />

              <div className="flex gap-2">
                <input
                  placeholder="Min budget"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.budget_min}
                  onChange={(e) =>
                    setForm({ ...form, budget_min: e.target.value })
                  }
                />
                <input
                  placeholder="Max budget"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.budget_max}
                  onChange={(e) =>
                    setForm({ ...form, budget_max: e.target.value })
                  }
                />
              </div>

              <textarea
                placeholder="Extra details (optional)"
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />

              <button
                onClick={submit}
                className="w-full bg-black text-white py-2 rounded-lg font-medium"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}