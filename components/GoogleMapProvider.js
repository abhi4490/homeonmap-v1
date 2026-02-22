import GoogleMapProvider from "@/components/GoogleMapProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleMapProvider>
          {children}
        </GoogleMapProvider>
      </body>
    </html>
  );
}