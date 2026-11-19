import type { APIRoute } from 'astro';
import { getAllPosts } from '../lib/queries';

export const GET: APIRoute = async ({ request, site }) => {
  const currentSiteUrl = site?.origin || new URL(request.url).origin;

  const mainUrls = [
    {
      url: `${currentSiteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${currentSiteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${currentSiteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${currentSiteUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const postUrls = [];
  let pageNumber = 1;
  const perPage = 100;

  while (true) {
    const { posts, totalPages } = await getAllPosts(pageNumber, perPage);
    
    if (!posts || posts.length === 0) break;

    const batchPostUrls = posts.map((post) => ({
      url: `${currentSiteUrl}/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    postUrls.push(...batchPostUrls);

    if (totalPages <= pageNumber) {
      break;
    }

    pageNumber++;
  }

  const allUrls = [...mainUrls, ...postUrls];

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allUrls
        .map(
          (item) => `
        <url>
          <loc>${item.url}</loc>
          <lastmod>${item.lastModified.toISOString()}</lastmod>
          <changefreq>${item.changeFrequency}</changefreq>
          <priority>${item.priority}</priority>
        </url>
      `
        )
        .join('')}
    </urlset>
  `.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    },
  });
};
