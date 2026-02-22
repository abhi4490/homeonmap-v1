import "./globals.css";

export const metadata = {
  title: "HomeOnMap",
  description: "Map-first real estate platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}