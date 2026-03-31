import { URL } from "url";
import MarkdownIt from "markdown-it";
import replaceLinkPlugin from 'markdown-it-replace-link';;
import { convert } from "html-to-text";

const dateStartRegex = /^\.\/(\d{4})/;
const parser = new MarkdownIt().use(replaceLinkPlugin, {
  processHTML: true,
  replaceLink: function (link, env, token) {
    if (token?.tag === 'img') return `/assets/images/${dateStartRegex.test(link) ? dateStartRegex.exec(link)[1].concat('/', link.substring(2)) : link}`;
    return link;
  }
});

// https://chenhuijing.com/blog/creating-excerpts-in-astro/
export const createExcerpt = post => {
  const html = parser.render(post.body);
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

export const createHtmlContent = post => {
  return parser.render(post.body);
};

export const createUri = (post) => {
  return new URL(`${import.meta.env.SITE}/blog/${post.data.category}/${post.data.date.getFullYear()}/${(post.data.date.getMonth() + 1).toString().padStart(2, '0')}/${post.data.date.getDate().toString().padStart(2, '0')}/${post.id.split('/').pop()?.substring(11)}.html`);
}
