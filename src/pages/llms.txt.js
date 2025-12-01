import { Response } from 'node-fetch-native';
import { getCollection } from 'astro:content';
import { createUri } from '../utils/blog.js';

import websites from '../data/websites.json';

export async function GET(astro) {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date - s1.data.date);

  // cf. https://llmstxt.org/
  const ret = `
# Mathieu Cartoixa

> This is my personal website, where I try and gather all my activities on the web, be they professional or personal.

## About
[CV](${astro.site}about/cv.txt}

## Blog
${blogPosts.map(post => (`
[${post.data.title}](${createUri(post)}.md)
`.trim())).join('\n')}

## Optional
${Object.entries(websites).map(w => (`
[${w[1].name}](${w[1].url})
 `.trim())).join('\n')}
  `.trim();

  return new Response(ret, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
