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
     * - unset: default Next.js server (`next start`)
     * - "standalone": self-contained Node.js server (used by the Dockerfile)
     * - "export": fully static HTML export into `out/` (deployed to GitHub Pages)
     */
    NEXT_OUTPUT: z.enum(["standalone", "export"]).optional(),
    /**
     * Path prefix the app is served under, e.g. "/valentine" for the GitHub
     * Pages project site (https://<owner>.github.io/valentine/). Used as the
     * Next.js basePath and assetPrefix. Unset (or "/") serves the app at the
     * root of the domain. One trailing slash is ignored.
     */
    BASE_PATH: z
      .string()
      .optional()
      .transform((value = "") => (value.endsWith("/") ? value.slice(0, -1) : value))
      .refine(
        (value) => value === "" || (value.startsWith("/") && !value.endsWith("/")),
        'BASE_PATH must start with "/", e.g. "/valentine"',
      ),
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
    BASE_PATH: process.env.BASE_PATH,
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
