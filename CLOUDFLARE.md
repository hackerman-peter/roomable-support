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
- Condition photos (deployed; valid-photo acceptance still pending):
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

### Production checkpoint — 5 September, 14:13

The condition schema and endpoint are now live in the confirmed Supabase project.
This Worker was deployed as version `9f930dce-c8bb-4e9d-9e45-d879149ff6ec`, then
updated to `a3418901-9597-4cee-bc94-0e89e326bcb2` with current Account & family
navigation and an explicit privacy disclosure for optional room records/photos,
Cloudflare delivery and read-only bearer links. The disclosure explains 30-day
expiry, revocation, the five-minute signed-image window and downloaded copies.

`npm run verify` passed generated types, typechecking, 26 Worker-runtime tests
and a deployment dry run. Real HTTPS checks confirm home/privacy/terms HTTP 200,
the updated disclosure, the logo HTTP 200, and missing/unknown report links HTTP
404 with no-store/no-referrer headers. No site assets other than the support and
privacy copy changed. These are negative-path checks: a real valid photo set,
expiry/revocation and actual Storage cleanup remain acceptance gates in the iOS
task. No claim of full end-to-end completion is made.

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


### Marketing deployment — 6 September 2026

Deployed version `9648dae1-e00f-47fa-9966-e62202d2b85f` to the existing
`roomable-support-web` Worker and `roomable.deploid.now` hostname. Previous
production version for rollback: `a3418901-9597-4cee-bc94-0e89e326bcb2`.
The condition-report Worker code, bindings, routing and private-response headers
were not changed. Home is now the reviewed Claude marketing design; the original
help page is preserved at `/support/`. Privacy and terms remain at their URLs.

This is an accurate pre-release public variant. Apple’s Australian page returned
404 and its lookup returned zero results at deployment. The primary CTA therefore
opens the real-screen demo; the page says coming to the App Store. Fictional draft
testimonials and the unverified five-star laurel remain only in the private design.
Public films run for 26 seconds, ending before the launch-day download end card.
To enable downloads later, verify the public listing first. Replace draft quotes
with permissioned feedback and substantiate the rating before displaying them.

All eleven native web screenshots are included. React 18.3.1 and ReactDOM are
self-hosted after SHA-384 integrity verification against the Claude runtime pins.
The unchanged Claude runtime requires `unsafe-eval` to interpret its template
logic. Public static CSP permits that, same-origin scripts, inline styles and
Google Fonts; private condition pages retain their independent restrictive CSP.
Asset caching now revalidates after one hour because filenames are not hashed.

Validation: type generation, TypeScript, 28 Worker-runtime tests and deploy dry
run passed. Local desktop/mobile navigation, demo, FAQ and both films passed.
Live HTTPS checks returned 200 for home/support/privacy/terms and media, with
runtime/image/video bytes matching local files. Missing condition links retain
404/no-store/no-referrer and junk routes retain 404. Results are recorded in
`.build/live-marketing-check-20260906.json`. No private report token was used.


### Full design restored — 6 September 2026, 10:53

At the user's request, restored the full private design as a public launch
preview. Version `502e8a6d-9ec5-4e91-aa5b-22850b425278` supersedes the
pre-release variant. App Store button styling and links, both original 30-second
films, the supplied laurel and all three draft quote layouts are present. A
visible launch-preview notice explains unavailable downloads, fictional quotes
and the unverified rating. Local captions identify every draft quote and laurel;
`noindex` marks the preview. The private Claude design remains unchanged.

All 28 tests and deployment dry run passed. Desktop/mobile rendering, complete
portrait film playback and demo interaction passed. Live home/support/legal and
restored media returned 200; media hashes match the checked files, and the missing
condition link still returns 404. No private report code or routes were changed.
Rollback target: `9648dae1-e00f-47fa-9966-e62202d2b85f`.
