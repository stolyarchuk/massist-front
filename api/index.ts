import { Hono } from "hono";
const api = new Hono<{ Bindings: Env }>();

api.get("/api/", (c) => c.json({ name: "Cloudflare" }));

api.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default api;
