import type { NextConfig } from 'next'

import { env } from './env'

const securityHeaders = [
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
    },
];

const nextConfig: NextConfig = {
    // Set via NEXT_OUTPUT, e.g. "standalone" for the Docker image (see env.ts)
    output: env.NEXT_OUTPUT,
    poweredByHeader: false,
    // Custom headers are not supported by static exports; they have to be set by the hosting server
    ...(env.NEXT_OUTPUT !== 'export' && {
        async headers() {
            return [
                {
                    source: '/(.*)',
                    headers: securityHeaders,
                },
            ]
        },
    }),
};

export default nextConfig;
