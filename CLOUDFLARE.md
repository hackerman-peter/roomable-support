# Roomable support hosting

The production origin is `https://roomable.deploid.now`, served by the isolated
Cloudflare Worker `roomable-support-web`. The GitHub repository remains the
public source of truth and the separate `roomable-support` Pages project remains
an operational staging fallback.

The dedicated `roomable-support` Pages project was created and deployed from
commit `97f8d85c675b791ee9d9647b030a5aa7df6655e0` on 4 September 2026. Its
temporary origin, `https://roomable-support.pages.dev`, passed live HTTP 200 and
security-header checks for the home, privacy and terms routes.

The production Worker was first deployed from commit
`65868ab4ca6114e4272bbc33fbb1ca45622a8712` with custom-domain version
`6f126bb8-4506-4829-9393-9c8fee11f908`. Cloudflare created the isolated
`roomable.deploid.now` DNS record and certificate. The home, privacy and terms
routes all returned HTTP 200 over HTTPS, junk paths returned 404, and custom
security and asset-cache headers were present. The static site now sends a
same-origin content security policy, frame denial, HSTS, restrictive browser
permissions and MIME-sniffing protection.

## Intended URLs

- Home and support: `https://roomable.deploid.now/`
- Privacy policy: `https://roomable.deploid.now/privacy/`
- Terms of use: `https://roomable.deploid.now/terms/`
- Condition photos (prepared locally; not yet deployed):
  `https://roomable.deploid.now/condition/?token=<private-report-token>`

## Private report hosting — local checkpoint, 5 September

The new Worker entry point serves only `/condition` and `/condition/`; existing
static pages retain asset-first routing. The app creates a 256-bit report token
through an authenticated, property-scoped Supabase command. This Worker passes
that validated bearer in `X-Roomable-Share-Token` to a fixed Supabase endpoint,
never in the backend URL and without forwarding caller cookies or authorization.
No API keys, original photos, private records or tokens are stored in this repo.

Supabase validates the link and signs the report's private images for five
minutes. Only its HTTP 200 response with `X-Roomable-Condition-Report: 1` can be
rendered as HTML here. This explicit web host is needed because Supabase's default
function domain serves HTML as plain text. Unavailable links and upstream failures
return the same 404 page. No response is cached, indexed, framed or used to send
a referrer. There are no scripts or edit/upload controls. Invocation logging and
tracing are disabled to avoid retaining bearer URLs; do not add URL/error logging.
Already downloaded photos cannot be recalled, and already-issued image URLs may
continue working for their remaining five-minute lifetime after revocation.

Verified locally: clean `npm ci --ignore-scripts`, generated Worker types, source
and test typechecking, 25 tests in Cloudflare's runtime, deployment dry run,
real local HTTP responses and 320/390/768px browser layout checks. The iOS repo
contains the renderer, endpoint tests and local-only visual fixtures. No new
Worker or Supabase function has been deployed in this checkpoint.

Run `npm ci --ignore-scripts` then `npm run verify`. For local HTTP checks use
`npm run dev -- --port 8791` (or `npx wrangler dev --local --port 8791` after
building). Dependencies are pinned and locked. The older pool package cannot run
the current compatibility date; the supported `@cloudflare/vitest-plugin` does.

Before deploying, verify the reviewed Roomable condition migrations and endpoint
are live in the exact project, then deploy this isolated Worker and test real
HTTPS links, every photo, expiry/revocation and unchanged public support pages.
The separate static Pages fallback does **not** implement private report links.

The same origin is suitable for the Google OAuth branding homepage, privacy and
terms fields. Add the parent domain `deploid.now` to Google OAuth's authorised
domains only after the custom hostname is live and each URL returns HTTP 200.

## Deployment guardrails

1. Build with `Verification/build-worker-assets.zsh` and validate with a Wrangler
   dry run before deployment.
2. Deploy only the `roomable-support-web` Worker. Do not attach this repository
   to or replace the existing `deploid-now` project.
3. Keep only the `roomable.deploid.now` custom domain on the Worker.
4. Confirm HTTPS is active, redirects stay on that hostname, and the three URLs
   above are publicly readable without cookies or authentication.
5. Update the iOS release configuration and App Store metadata only after the
   public checks pass.
6. Keep Google OAuth in Testing until its branding page is complete and a
   physical-device Google sign-in and account-deletion pass has succeeded.
