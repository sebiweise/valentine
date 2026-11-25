import type { NextConfig } from 'next'

import { env } from './env'
import { securityHeaders } from './lib/security-headers.mjs'

const nextConfig: NextConfig = {
    // Set via NEXT_OUTPUT, e.g. "standalone" for the Docker image (see env.ts)
    output: env.NEXT_OUTPUT,
    poweredByHeader: false,
    // Custom headers are not supported by static exports; scripts/postbuild.mjs
    // writes them into out/_headers instead. The Content-Security-Policy is set
    // per request with a nonce in proxy.ts.
    ...(env.NEXT_OUTPUT !== 'export' && {
        headers: () =>
            Promise.resolve([
                {
                    source: '/(.*)',
                    headers: securityHeaders,
                },
            ]),
    }),
};

export default nextConfig;
