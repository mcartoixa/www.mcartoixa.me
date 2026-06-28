import type { APIContext } from 'astro';
import { Response } from 'node-fetch-native';
import { getCollection } from 'astro:content';
import { createUri } from '../utils/blog.js';

import websites from '../data/websites.json';
import type { Website } from '../types';

/**
 * Serves an `llms.txt` index of the site (cf. https://llmstxt.org/), linking to
 * the CV, every blog post and the external profiles.
 */
export async function GET(astro: APIContext) {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date.getTime() - s1.data.date.getTime());

  const ret = `
# Mathieu Cartoixa

> This is my personal website, where I try and gather all my activities on the web, be they professional or personal.

## About
[CV](${astro.site}about/cv.txt)

## Blog
${blogPosts.map(post => (`
[${post.data.title}](${createUri(post)}.md)
`.trim())).join('\n')}

## Optional
${Object.entries(websites as Record<string, Website>).map(w => (`
[${w[1].name}](${w[1].url})
 `.trim())).join('\n')}
  `.trim();

  return new Response(ret, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
