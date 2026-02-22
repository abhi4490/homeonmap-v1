"use client";

export default function BuyerIntentFloating() {
  return (
    <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-full px-4 py-3 z-50 border">
      <span className="text-sm font-medium">
        Buyer popup loading...
      </span>
    </div>
  );
}