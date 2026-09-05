// This host renders reports; Supabase alone authorizes links and signs photos.
// Never log a request URL: its token grants access to one private room report.
const reportEndpoint =
  "https://uosyvkmozytjdorxlpmj.supabase.co/functions/v1/condition-report";

const reportHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; img-src 'self' https://uosyvkmozytjdorxlpmj.supabase.co; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function unavailable(): Response {
  return new Response(`<!doctype html><html lang="en-AU"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Link unavailable · Roomable</title>
<style>body{font:17px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;background:#f6f2e9;color:#10242a;margin:0}main{max-width:440px;margin:12vh auto;padding:24px}img{width:44px;height:44px;border-radius:12px}h1{font-size:30px;line-height:1.15}p{color:#45565b}</style>
</head><body><main><img src="/assets/roomable-icon-120.png" alt="Roomable">
<h1>This link isn’t available</h1><p>It may have expired or been switched off. Ask the property manager for a new link.</p>
</main></body></html>`, { status: 404, headers: reportHeaders });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/condition" && !url.pathname.startsWith("/condition/")) {
      return env.ASSETS.fetch(request);
    }
    // No redirects, alternate routes, ambiguous parameters, or anonymous writes.
    if (request.method !== "GET" || !["/condition", "/condition/"].includes(url.pathname)) {
      return unavailable();
    }
    const tokens = url.searchParams.getAll("token");
    if (tokens.length !== 1 || !/^[a-f0-9]{64}$/.test(tokens[0])) {
      return unavailable();
    }
    const endpoint = new URL(reportEndpoint);
    try {
      // Construct a fresh request: do not forward cookies, authorization,
      // referrers, or caller-controlled hosts to the private backend.
      const upstream = await fetch(endpoint, {
        method: "GET",
        headers: { Accept: "text/html", "X-Roomable-Share-Token": tokens[0] },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
      // Supabase's default host serves HTML as plain text. Only our endpoint's
      // explicit success marker permits turning that trusted response into HTML.
      if (upstream.status !== 200 || upstream.headers.get("X-Roomable-Condition-Report") !== "1" || !upstream.body) {
        await upstream.body?.cancel();
        return unavailable();
      }
      return new Response(upstream.body, { status: 200, headers: reportHeaders });
    } catch {
      // Intentionally omit upstream errors/URLs/tokens from responses and logs.
      return unavailable();
    }
  },
} satisfies ExportedHandler<Env>;
