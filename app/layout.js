import "./globals.css";

export const metadata = {
  title: "HomeOnMap",
  description: "Find properties directly on the map",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}