import { Hono } from "hono";
import Env from "./types.ts";

const api = new Hono<{ Bindings: Env }>();

api.get("/api/", (c) => c.json({ name: "Cloudflare" }));

api.get("*", (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

api.post("/chat/new", (c) => {
  console.log(c);
  return c.env.ASSETS.fetch(c.req.raw);
});

// const api = {
//   createChat: async (c) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/chat/new`, {
//         method: "POST",
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("Error creating chat:", error);
//       throw error;
//     }
//   },
// };

export default api;
