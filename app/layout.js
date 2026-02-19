import './globals.css'
export const metadata = {
  title: "HomeOnMap",
  description: "Map based real estate listings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
