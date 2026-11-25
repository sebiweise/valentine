import type { NextConfig } from 'next'

import { env } from './env'
import { securityHeaders } from './lib/security-headers.mjs'

const nextConfig: NextConfig = {
    // Set via NEXT_OUTPUT, e.g. "standalone" for the Docker image (see env.ts)
    output: env.NEXT_OUTPUT,
    // Set via BASE_PATH, e.g. "/valentine" for the GitHub Pages project site.
    // Next.js prefixes its own links, scripts, styles, fonts and file-based
    // metadata; other absolute paths have to use env.BASE_PATH themselves.
    ...(env.BASE_PATH && {
        basePath: env.BASE_PATH,
        assetPrefix: env.BASE_PATH,
    }),
    poweredByHeader: false,
    // Custom headers are not supported by static exports, and GitHub Pages
    // cannot set them either (see README.md). The Content-Security-Policy is
    // set per request with a nonce in proxy.ts.
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
