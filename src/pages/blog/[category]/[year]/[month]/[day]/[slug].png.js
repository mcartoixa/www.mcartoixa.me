import { getCollection } from 'astro:content';
import { Response } from 'node-fetch-native';
import { Buffer } from 'node:buffer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import glob from 'fast-glob';
import { Canvas, FontLibrary, Image } from 'skia-canvas';
import { getCategory } from '../../../../../../utils/blog.js';

export async function getStaticPaths() {
  const blogPosts = (await getCollection('blogPosts')).sort((s1, s2) => s2.data.date - s1.data.date);
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
}

FontLibrary.use(glob('node_modules/@fontsource/source-sans-3/files/*.woff'));
const avatarImageData = Buffer.from(fs.readFileSync('src/assets/pix/avatar.png')).toString('base64');

export async function GET(astro) {
  const { post } = astro.props;
  const category = await getCategory(post);

  const canvas = new Canvas(1000, 560);
  canvas.gpu = false;
  const ctx = canvas.getContext('2d');

  /* As of current version, skia-canvas does not render <image> tags in SVG documents. This would require injecting a LocalResourceProvider into skia.
  In the meantime we will have to draw these images directly into the canvas. */
  const svgBackground = `<svg width="1000" height="560" viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="100" x="0" y="0" fill="#222629" />
  <rect width="1000" height="460" x="0" y="100" fill="#E9E3E1" />
</svg>`;
  /* SVG does not support text formatting like shadows and wrapping, and skia-canvas does not render <foreignobject> tags.
  In the meantime we will have to render long text directly into the canvas. */
  const svgText = `<svg width="1000" height="560" viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">
  <text font-family="Source Sans 3" font-size="32" fill="#FFFFFF" x="100" y="58">${category.data.title}</text>
</svg>`;

  // Images
  let img = new Image(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgBackground)}`);
  ctx.drawImage(img, 0, 0);

  img = new Image(`data:image/png;base64,${avatarImageData}`);
  ctx.drawImage(img, 24, 24, 52, 52);

  ctx.globalAlpha = 0.7;
  const headerImageData = Buffer.from(
    fs.readFileSync(path.normalize(path.join('.', post.data.header ?? 'src/data/blog/header-mac.jpg')))
  ).toString('base64');
  img = new Image(`data:image/png;base64,${headerImageData}`);
  ctx.drawImage(img, 0, 60, 1000, 300, 0, 100, 1000, 300);
  ctx.globalAlpha = 1;

  img = new Image(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`);
  ctx.drawImage(img, 0, 0);

  // Text
  ctx.textWrap = true;
  ctx.font = '400 24px "Source Sans 3"';
  ctx.fillStyle = '#404040';
  ctx.fillText(
    post.data.tags.map(t => `#${t}`).join(' '),
    24,
    492,
    952
  );

  ctx.font = '600 28px "Source Sans 3"';
  ctx.fillText(
    post.data.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
    24,
    450,
    952
  );

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#202020';
  ctx.font = '600 56px "Source Sans 3"';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  const m = ctx.measureText(post.data.title, 952);
  const last = m.lines.at(-1);
  const blockHeight = last.y + last.height;
  const y = 100 + (300 - blockHeight) / 2;
  ctx.fillText(post.data.title, 24, y, 952);

  const ret = await canvas.toBuffer('png');

  return new Response(ret, {
    headers: {
      'Content-Type': 'image/png'
    }
  });
}
