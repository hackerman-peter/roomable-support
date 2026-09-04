# Roomable support hosting

The preferred production origin is `https://roomable.deploid.now` on a dedicated
Cloudflare Pages project. The GitHub repository remains a public fallback and
source of truth.

## Intended URLs

- Home and support: `https://roomable.deploid.now/`
- Privacy policy: `https://roomable.deploid.now/privacy/`
- Terms of use: `https://roomable.deploid.now/terms/`

The same origin is suitable for the Google OAuth branding homepage, privacy and
terms fields. Add the parent domain `deploid.now` to Google OAuth's authorised
domains only after the custom hostname is live and each URL returns HTTP 200.

## Deployment guardrails

1. Deploy this repository to a dedicated `roomable-support` Pages project. Do
   not attach it to or replace the existing `deploid-now` project.
2. Attach only the `roomable.deploid.now` hostname.
3. Confirm HTTPS is active, redirects stay on that hostname, and the three URLs
   above are publicly readable without cookies or authentication.
4. Update the iOS release configuration and App Store metadata only after the
   public checks pass.
5. Keep Google OAuth in Testing until its branding page is complete and a
   physical-device Google sign-in and account-deletion pass has succeeded.

