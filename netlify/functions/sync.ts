import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  const store = getStore("workout-data");

  // Get device ID from header
  const deviceId = request.headers.get("x-device-id");
  if (!deviceId) {
    return new Response(JSON.stringify({ error: "Missing device ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handle GET - load data
  if (request.method === "GET") {
    try {
      const data = await store.get(deviceId, { type: "json" });
      return new Response(JSON.stringify({ data: data || null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ data: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle POST - save data
  if (request.method === "POST") {
    try {
      const body = await request.json();
      await store.setJSON(deviceId, body.data);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to save" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};
