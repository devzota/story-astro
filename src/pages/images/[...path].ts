import type { APIRoute } from "astro";
import { WORDPRESS_URL } from "astro:env/server";

export const GET: APIRoute = async ({ params }) => {
  const path = params.path;
  if (!path) {
    return new Response("Not found", { status: 404 });
  }

  const cleanWpUrl = WORDPRESS_URL.endsWith("/")
    ? WORDPRESS_URL.slice(0, -1)
    : WORDPRESS_URL;

  const upstreamUrl = `${cleanWpUrl}/wp-content/${path}`;

  try {
    const response = await fetch(upstreamUrl);

    if (!response.ok) {
      return new Response("Not found", { status: 404 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Error fetching image", { status: 500 });
  }
};
