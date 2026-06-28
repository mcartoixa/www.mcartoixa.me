import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext, GetStaticPaths } from 'astro';
import { createUri, createHtmlContent } from '../../../utils/blog.js';

export const getStaticPaths = (async () => {
  const blogCategories = Array.from(new Set((await getCollection('blogPosts')).map((p) => p.data.category.id)));
  return blogCategories.map(category => ({
    params: {
      category: category
    }
  }));
}) satisfies GetStaticPaths;

/**
 * Serves the per-category RSS feed, with each item carrying the post's full HTML content.
 */
export async function GET(context: APIContext) {
  const blogPosts = (await getCollection('blogPosts', ({ data }) => { return data.category.id === context.params.category; })).sort((s1, s2) => s2.data.date.getTime() - s1.data.date.getTime());
  return rss({
    title: 'Mathieu Cartoixa',
    description: "Mathieu Cartoixa's blog",
    site: context.site!,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom'
    },
    customData: `<atom:link href="${context.url}" rel="self" type="application/rss+xml"/>`,
    items: blogPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: `<![CDATA[${createHtmlContent(post)}]]>`,
      link: createUri(post).toString()
    }))
  });
}
