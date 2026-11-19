import type { ExtendedPost, Category, Author } from "@/lib/types";
import { WORDPRESS_URL } from 'astro:env/server';

const baseUrl = WORDPRESS_URL;

export async function getAllPosts(pageNumber: number = 1, perPage: number = 10, searchTerm: string = '', categories: number = 0): Promise<{ posts: ExtendedPost[], totalPages: number }> {
  if (!baseUrl) {
    console.error("Critical Error: WORDPRESS_URL is missing!");
  }

  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: pageNumber.toString(),
    search: searchTerm,
  });

  if (categories !== 0) {
    params.set('categories', categories.toString());
  }

  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?${params.toString()}`);
  const posts = await response.json();
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') ?? '1');
  return { posts, totalPages };
}

export async function getPostBySlug(slug: string): Promise<ExtendedPost | null> {
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?slug=${slug}`);
  const post = await response.json();
  return post[0] || null;
}

export async function getAuthorById(id: number): Promise<Author | null> {
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/users/${id}`);
  const author: Author = await response.json();
  return author;
}

export async function getCategoriesByIds(ids: number[]): Promise<Category[]> {
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/categories?include=${ids.join(',')}`);
  const categories: Category[] = await response.json();
  return categories;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/categories`);
  const data = await response.json();
  return data;
}
