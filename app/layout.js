import "./globals.css";
import GoogleMapProvider from "@/components/GoogleMapProvider";

export const metadata = {
  title: "HomeOnMap",
  description: "Map-first real estate platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleMapProvider>
          {children}
        </GoogleMapProvider>
      </body>
    </html>
  );
}