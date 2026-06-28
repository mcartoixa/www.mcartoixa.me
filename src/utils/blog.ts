import { URL } from "url";
import { getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";
import MarkdownIt from "markdown-it";
import replaceLinkPlugin from 'markdown-it-replace-link';
import { convert } from "html-to-text";
import { resolveImageSrc } from "./blog.core.js";
import type { MarkdownLinkToken } from "./blog.core.js";

export { rewriteMarkdownImageSources } from "./blog.core.js";

const parser = new MarkdownIt().use(replaceLinkPlugin, {
  processHTML: true,
  replaceLink: (link: string, _env: unknown, token?: MarkdownLinkToken) => resolveImageSrc(link, token)
});

/**
 * Renders a blog post to a plain-text excerpt, stripping links, images and figures.
 *
 * @param post - The blog post entry.
 * @returns The post body rendered as plain text.
 * @see https://chenhuijing.com/blog/creating-excerpts-in-astro/
 */
export const createExcerpt = (post: CollectionEntry<'blogPosts'>): string => {
  const html = parser.render(post.body ?? '');
  const options = {
    wordwrap: null,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' },
      { selector: 'figure', format: 'skip' }
    ]
  };
  const text = convert(html, options);
  return convert(text, options);
};

/**
 * Renders a blog post body to HTML, rewriting image sources to their built location.
 *
 * @param post - The blog post entry.
 * @returns The post body rendered as HTML.
 */
export const createHtmlContent = (post: CollectionEntry<'blogPosts'>): string => {
  return parser.render(post.body ?? '');
};

/**
 * Builds the canonical URL of a blog post from its category and publication date.
 *
 * @param post - The blog post entry.
 * @returns The canonical `.html` URL of the post.
 */
export const createUri = (post: CollectionEntry<'blogPosts'>): URL => {
  return new URL(`${import.meta.env.SITE}/blog/${post.data.category.id}/${post.data.date.getFullYear()}/${(post.data.date.getMonth() + 1).toString().padStart(2, '0')}/${post.data.date.getDate().toString().padStart(2, '0')}/${post.id.split('/').pop()?.substring(11)}.html`);
}

/**
 * Resolves the category entry a blog post belongs to.
 *
 * @param post - The blog post entry.
 * @returns The referenced category entry.
 */
export const getCategory = (post: CollectionEntry<'blogPosts'>) => getEntry(post.data.category);
