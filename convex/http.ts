import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Add a health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async ({ auth }) => {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

export default http;
