import { env } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/worker";

const token = "ab".repeat(32);
const request = (path: string, init?: RequestInit) => new Request(`https://roomable.deploid.now${path}`, init);
const open = (path: string, init?: RequestInit) => worker.fetch(request(path, init), env);

afterEach(() => vi.restoreAllMocks());

describe("Roomable private report hosting", () => {
  it.each(["/condition", "/condition/", "/condition/?token=junk", `/condition/?token=${token}&token=${token}`, `/condition/private?token=${token}`, `/condition/?token=${token.toUpperCase()}`])(
    "rejects invalid link %s without contacting the backend", async (path) => {
      const backend = vi.spyOn(globalThis, "fetch");
      const response = await open(path);
      expect(response.status).toBe(404);
      expect(await response.text()).toContain("This link isn’t available");
      expect(backend).not.toHaveBeenCalled();
    },
  );

  it.each(["POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])("rejects %s", async (method) => {
    const backend = vi.spyOn(globalThis, "fetch");
    expect((await open(`/condition/?token=${token}`, { method })).status).toBe(404);
    expect(backend).not.toHaveBeenCalled();
  });

  it.each(["/condition", "/condition/"])("renders only marked backend HTML at %s", async (path) => {
    const html = "<!doctype html><h1>Move-in room photos</h1>";
    const backend = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(html, {
      headers: { "Content-Type": "text/plain", "X-Roomable-Condition-Report": "1", "Set-Cookie": "must-not-copy=1" },
    }));
    const response = await open(`${path}?token=${token}&origin=https://example.test`, {
      headers: { Cookie: "private=secret", Authorization: "Bearer secret", Referer: "https://example.test" },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(html);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Cloudflare-CDN-Cache-Control")).toBe("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
    const [url, options] = backend.mock.calls[0];
    expect(String(url)).toBe("https://uosyvkmozytjdorxlpmj.supabase.co/functions/v1/condition-report");
    expect(options?.headers).toEqual({ Accept: "text/html", "X-Roomable-Share-Token": token });
    expect(options?.redirect).toBe("error");
    expect(options?.cache).toBe("no-store");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([200, 302, 401, 404, 500])("fails closed on upstream %s without an HTML success marker", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream private diagnostics", { status }));
    const response = await open(`/condition/?token=${token}`);
    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).not.toContain("diagnostics");
    expect(body).not.toContain(token);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("fails closed on network errors or timeouts without logging secrets", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error(`secret ${token}`));
    const log = vi.spyOn(console, "error");
    const response = await open(`/condition/?token=${token}`);
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain(token);
    expect(log).not.toHaveBeenCalled();
  });

  it("checks the backend again after a link is revoked", async () => {
    const backend = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("report", { headers: { "X-Roomable-Condition-Report": "1" } }))
      .mockResolvedValueOnce(new Response("Not found", { status: 404 }));
    expect((await open(`/condition/?token=${token}`)).status).toBe(200);
    expect((await open(`/condition/?token=${token}`)).status).toBe(404);
    expect(backend).toHaveBeenCalledTimes(2);
  });

  it.each(["/", "/support/", "/privacy/", "/terms/"])("preserves the existing public page %s", async (path) => {
    const response = await open(path);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Roomable");
  });

  it("serves the pre-release marketing page without fictional endorsements or dead download claims", async () => {
    const html = await (await open("/")).text();
    expect(html).toContain("Keep every room’s rent and shared bills");
    expect(html).toContain("Coming to the App Store");
    expect(html).toContain('href="/support/"');
    expect(html).not.toContain("<blockquote");
    expect(html).not.toContain("app-store-5-stars.png");
    expect(html).not.toContain("apps.apple.com/app/");
    for (const path of ["/assets/marketing/runtime.js", "/assets/marketing/react.js", "/assets/marketing/react-dom.js", "/assets/web/today.png", "/assets/film/roomable-preview-landscape.mp4", "/assets/film/roomable-preview-portrait.mp4"]) {
      expect((await open(path)).status).toBe(200);
    }
  });

  it("keeps unknown non-report paths as 404", async () => {
    expect((await open("/not-a-real-page/" )).status).toBe(404);
  });

  it("discloses optional photos and bearer-link access without obsolete navigation", async () => {
    const privacy = await (await open("/privacy/")).text();
    expect(privacy).toContain("Anyone with that link");
    expect(privacy).toContain("30 days");
    expect(privacy).toContain("five more minutes");
    expect(privacy).toContain("condition photos");
    expect(privacy).toContain("Cloudflare");
    for (const path of ["/support/", "/privacy/"]) {
      const page = await (await open(path)).text();
      expect(page).toContain("Account &amp; family");
      expect(page).not.toContain("Settings → Family access");
    }
  });
});
