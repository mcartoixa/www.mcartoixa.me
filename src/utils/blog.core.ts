const dateStartRegex = /^(\d{4})/;
const uriSchemeRegex = /^[a-z][a-z0-9+.-]*:/i;
const relativePrefixRegex = /^\.\//;
const markdownImageRegex = /(!\[[^\]]*\]\()([^)\s]+)([^)]*\))/g;

/** A markdown-it token, of which only the tag is relevant when rewriting links. */
export interface MarkdownLinkToken {
  tag?: string;
}

/**
 * Rewrites a blog image link to its built location under `/assets/images`.
 *
 * Absolute URLs (any URI scheme) are left untouched. Relative links lose their
 * optional `./` prefix and gain a year directory when the file name starts with
 * one, matching how the images are copied (cf. `astro.config.mjs`).
 *
 * @param link - The link as written in the markdown source.
 * @returns The rewritten link, or the original when it is an absolute URL.
 */
export const resolveImageLink = (link: string): string => {
  if (uriSchemeRegex.test(link)) return link;
  const file = link.replace(relativePrefixRegex, '');
  const yearMatch = dateStartRegex.exec(file);
  return `/assets/images/${yearMatch ? `${yearMatch[1]}/${file}` : file}`;
};

/**
 * Rewrites a markdown-it link, only when it belongs to an image token.
 *
 * @param link - The link as written in the markdown source.
 * @param token - The markdown-it token for the link; only `img` tokens are rewritten.
 * @returns The rewritten link, or the original when it is not a rewritable image link.
 */
export const resolveImageSrc = (link: string, token?: MarkdownLinkToken): string =>
  token?.tag === 'img' ? resolveImageLink(link) : link;

/**
 * Rewrites every image source in a markdown document with {@link resolveImageLink},
 * leaving the surrounding markdown (including link targets) untouched.
 *
 * @param markdown - The raw markdown source.
 * @returns The markdown with image sources rewritten.
 */
export const rewriteMarkdownImageSources = (markdown: string): string =>
  markdown.replace(markdownImageRegex, (_match, before, link, after) => `${before}${resolveImageLink(link)}${after}`);
