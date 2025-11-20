import { Response } from 'node-fetch-native';
import { getCollection } from 'astro:content';
import { createUri } from "../utils/blog.js";

export async function GET() {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date - s1.data.date);
  const ret = `<head>
${blogPosts.map((post, index) => {
    const postUrl = createUri(post).toString();
    const tag = index === 0 ? `<b:if cond='data.blog.url == &quot;${postUrl}&quot;'>` : `<b:elseif cond='data.blog.url == &quot;${postUrl}&quot;'/>`;
    return `  ${tag}
    <link href='${postUrl}' rel='canonical'/>
    <!--meta content='0; url=${postUrl}' http-equiv='refresh'/-->`;
  }).join('\n')}
  <b:else />
    <link expr:href='data:view.url.canonical' rel='canonical'/>
  </b:if>
</head>`;
  return new Response(ret, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
