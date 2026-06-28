import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { Response } from 'node-fetch-native';
import type { APIContext, GetStaticPaths } from 'astro';
import { createUri, getCategory, rewriteMarkdownImageSources } from '../../../../../../utils/blog.js';

type Props = { post: CollectionEntry<'blogPosts'> };

export const getStaticPaths = (async () => {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date.getTime() - s1.data.date.getTime());
  return blogPosts.map(post => ({
    params: {
      category: post.data.category.id,
      day: post.data.date.getDate().toString().padStart(2, '0'),
      month: (post.data.date.getMonth() + 1).toString().padStart(2, '0'),
      slug: post.id.split('/').pop()?.substring(11),
      year: post.data.date.getFullYear().toString()
    },
    props: {
      post
    }
  }));
}) satisfies GetStaticPaths;

/**
 * Serves the plain-markdown representation of a blog post, with its image
 * sources rewritten to their built location.
 */
export async function GET(astro: APIContext<Props>) {
  const { post } = astro.props;
  const category = await getCategory(post);

  const ret = `
# ${post.data.title}

URL: ${createUri(post)}
Published: ${post.data.date}
Category: ${category?.data.title}

${rewriteMarkdownImageSources(post.body ?? '')}
  `.trim();

  return new Response(ret, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
