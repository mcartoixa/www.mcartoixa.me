const dateStartRegex = /^(\d{4})/;
const uriSchemeRegex = /^[a-z][a-z0-9+.-]*:/i;
const relativePrefixRegex = /^\.\//;

/**
 * Rewrites a blog image link to its built location under `/assets/images`.
 *
 * Absolute URLs (any URI scheme) are left untouched. Relative links lose their
 * optional `./` prefix and gain a year directory when the file name starts with
 * one, matching how the images are copied (cf. `astro.config.mjs`).
 *
 * @param {string} link - The link as written in the markdown source.
 * @param {{ tag?: string }} [token] - The markdown-it token for the link; only `img` tokens are rewritten.
 * @returns {string} The rewritten link, or the original when it is not a rewritable image link.
 */
export const resolveImageSrc = (link, token) => {
  if (token?.tag !== 'img' || uriSchemeRegex.test(link)) return link;
  const file = link.replace(relativePrefixRegex, '');
  return `/assets/images/${dateStartRegex.test(file) ? `${dateStartRegex.exec(file)[1]}/${file}` : file}`;
};
