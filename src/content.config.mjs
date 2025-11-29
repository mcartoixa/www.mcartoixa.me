import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogPosts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    header: z.string().optional(),
    category: z.string(),
    series: z.string().optional()
  })
});
const sections = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/data/sections" }),
});

export const collections = { blogPosts, sections };
