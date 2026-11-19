import type { ExtendedPost, Post } from "./types";

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeHtmlEntities(value = "") {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    const next = decoded.replace(
      /&(#(?:x[0-9a-fA-F]+|\d+)|[a-zA-Z]+);/g,
      (match, entity: string) => {
        if (entity[0] === "#") {
          const codePoint =
            entity[1]?.toLowerCase() === "x"
              ? Number.parseInt(entity.slice(2), 16)
              : Number.parseInt(entity.slice(1), 10);

          return Number.isFinite(codePoint)
            ? String.fromCodePoint(codePoint)
            : match;
        }

        return namedEntities[entity] ?? match;
      },
    );

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

export function stripHtml(value = "") {
  return decodeHtmlEntities(value.replace(/(<([^>]+)>)/gi, "").trim());
}

export function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getPostImage(
  post: Post | ExtendedPost,
  currentSiteUrl: string,
  wordpressUrl?: string,
) {
  const extended = post as ExtendedPost;
  const raw =
    extended.yoast_head_json?.thumbnail_url ||
    extended.yoast_head_json?.og_image?.[0]?.url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "";

  if (!raw || !wordpressUrl) return raw;

  return raw.replace(
    new RegExp(`${wordpressUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/wp-content/`, "g"),
    `${currentSiteUrl}/images/`,
  );
}
