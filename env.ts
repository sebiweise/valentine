import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables, only available at build time and on the server.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    /**
     * Next.js output mode:
     * - unset: default (e.g. for Vercel)
     * - "standalone": self-contained Node.js server (used by the Dockerfile)
     * - "export": fully static HTML export into `out/`
     */
    NEXT_OUTPUT: z.enum(["standalone", "export"]).optional(),
  },

  /**
   * Client-side environment variables, exposed to the browser. Must be prefixed with `NEXT_PUBLIC_`.
   */
  client: {},

  /**
   * Every variable has to be listed here, because Next.js only inlines
   * `process.env.*` accesses that are written out explicitly.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_OUTPUT: process.env.NEXT_OUTPUT,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treats empty strings as undefined, so `NEXT_OUTPUT=` behaves like an unset variable.
   */
  emptyStringAsUndefined: true,
});
