import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { createExcerpt, createUri } from "../../utils/blog.js";

/**
 * Serves the site-wide RSS feed, with each item carrying a truncated plain-text excerpt.
 */
export async function GET(context: APIContext) {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date.getTime() - s1.data.date.getTime());
  return rss({
    title: 'Mathieu Cartoixa',
    description: 'Mathieu Cartoixa\'s blog',
    site: context.site!,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom'
    },
    customData: `<atom:link href="${context.url}" rel="self" type="application/rss+xml"/>`,
    items: blogPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: `${createExcerpt(post).substring(0, 500)}...`,
      link: createUri(post).toString()
    }))
  });
}
