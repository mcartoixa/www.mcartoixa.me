import { getCollection } from 'astro:content';
import { Response } from 'node-fetch-native';
import { createUri } from '../../../../../../utils/blog.js';

export async function getStaticPaths() {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date - s1.data.date);
  return blogPosts.map(post => ({
    params: {
      category: post.data.category,
      day: post.data.date.getDate().toString().padStart(2, '0'),
      month: (post.data.date.getMonth() + 1).toString().padStart(2, '0'),
      slug: post.id.split('/').pop()?.substring(11),
      year: post.data.date.getFullYear().toString()
    },
    props: {
      post
    }
  }));
}

export async function GET(astro) {
  const { post } = astro.props;

  const ret = `
# ${post.data.title}

URL: ${createUri(post)}
Published: ${post.data.date}
Category: ${post.data.category}

${post.body}
  `.trim();

  return new Response(ret, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
