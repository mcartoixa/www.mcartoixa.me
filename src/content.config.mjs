import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blogPosts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    header: z.string().optional(),
    category: z.string(),
    series: z.string().optional(),
    tags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform(t => (Array.isArray(t) ? t : (t?.split(/\s+/) ?? [])).filter(Boolean))
  })
});
const sections = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/data/sections" }),
});

export const collections = { blogPosts, sections };
