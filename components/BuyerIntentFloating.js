"use client";

import { useState } from "react";

export default function BuyerIntentFloating() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating bubble */}
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full shadow-xl cursor-pointer z-50"
      >
        Looking to buy? 👀
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-2">
              Tell us what you're looking for
            </h3>

            <p className="text-sm text-gray-500">
              We’ll help you find the right property.
            </p>
          </div>
        </div>
      )}
    </>
  );
}