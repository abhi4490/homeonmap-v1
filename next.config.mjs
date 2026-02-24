/** @type {import('next').NextConfig} /
const nextConfig = {
async rewrites() {
return [
{
source: '/supabase-proxy/:path',
destination: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*,
},
];
},
};

export default nextConfig;