import { Hono, Context, Next } from "hono";
import { Env } from "../src/utils/types";
import { cors } from "hono/cors";

type Variables = {
  remote_url: URL;
};

type HonoConf = { Bindings: Env; Variables: Variables };

const remoteUrlMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path.startsWith("/api")
    ? c.req.path.substring(4)
    : c.req.path;

  c.set("remote_url", new URL("/v1" + path, c.env.API_URL));
  await next();
};

const app = new Hono<HonoConf>();

// app.use(
//   "*",
//   cors({
//     origin: (origin, c) => {
//       return origin.endsWith(".llmx.io") ? origin : "https://llmx.io";
//     },
//   })
// );

app.use("*", remoteUrlMiddleware);
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

app.get("/api/*", async (c) => {
  return await fetch(c.get("remote_url"), {
    headers: c.req.raw.headers,
    method: c.req.raw.method,
    body: c.req.raw.body,
  });
});

app.post("/api/*", async (c) => {
  return await fetch(c.get("remote_url"), {
    headers: c.req.raw.headers,
    method: c.req.raw.method,
    body: c.req.raw.body,
  });
});

/* app.get("/api/messages/:chat_id", async (c) => {
  return await fetch(c.get("remote_url"), {
    headers: c.req.raw.headers,
    method: c.req.raw.method,
    body: c.req.raw.body,
  });
}); */

/* app.post("/api/chat/new", async (c) => {
  return await fetch(c.get("remote_url"), {
    headers: c.req.raw.headers,
    method: c.req.raw.method,
    body: c.req.raw.body,
  });
});

app.post("/api/chat/:chat_id", async (c) => {
  return await fetch(c.get("remote_url"), {
    headers: c.req.raw.headers,
    method: c.req.raw.method,
    body: c.req.raw.body,
  });
}); */

export default app;
