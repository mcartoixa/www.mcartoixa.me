import { URL } from "url";
import MarkdownIt from "markdown-it";
import { convert } from "html-to-text";

const parser = new MarkdownIt();

// https://chenhuijing.com/blog/creating-excerpts-in-astro/
export const createExcerpt = (post) => {
  const html = parser.render(post.body);
  const options = {
    wordwrap: null,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
      { selector: "figure", format: "skip" },
    ],
  };
  const text = convert(html, options);
  return convert(text, options);
};

export const createUri = (post) => {
  return new URL(`${import.meta.env.SITE}/blog/${post.data.category}/${post.data.date.getFullYear()}/${(post.data.date.getMonth() + 1).toString().padStart(2, '0')}/${post.data.date.getDate().toString().padStart(2, '0')}/${post.id.split('/').pop()?.substring(11)}.html`);
}
