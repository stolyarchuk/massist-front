import { Hono, Context, Next } from "hono";
import { Env } from "../src/utils/types";

type Variables = {
  remote_url: URL;
};

type HonoConf = { Bindings: Env; Variables: Variables };

const remoteUrlMiddleware = async (c: Context, next: Next) => {
  console.info(new URL(c.req.path.replace("/api", c.env.API_URL)));

  c.set("remote_url", new URL(c.req.path.replace("/api", c.env.API_URL)));
  await next();
};

const app = new Hono<HonoConf>();

app.use("*", remoteUrlMiddleware);
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

app.post("/api/chat/new", async (c) => {
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
});

export default app;
