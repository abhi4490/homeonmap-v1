import "./globals.css";

export const metadata = {
  title: 'HomeOnMap',
  description: 'Map-first real estate marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* THIS SCRIPT FORCES TAILWIND TO WORK, BYPASSING ALL YOUR BUILD ERRORS! */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}