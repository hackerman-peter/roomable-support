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
security and asset-cache headers were present.

## Intended URLs

- Home and support: `https://roomable.deploid.now/`
- Privacy policy: `https://roomable.deploid.now/privacy/`
- Terms of use: `https://roomable.deploid.now/terms/`

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
