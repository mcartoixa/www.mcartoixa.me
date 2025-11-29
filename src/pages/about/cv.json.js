import { Response } from 'node-fetch-native';
import { convert } from "html-to-text";

import cv from '../../data/about/cv.yaml';
import websites from '../../data/websites.json'

function sanitize(o, options) {
  for (const property in o) {
    const p = o[property];
    if (p instanceof Date) {
      o[property] = p.toISOString().substring(0, 10);
    } else if (typeof p === 'string') {
      o[property] = convert(p, options);
    } else if (typeof p === 'object') {
      sanitize(p, options);
    }
  }
  return o;
}

export async function GET() {
  const ret = {
    '$schema': 'https://raw.githubusercontent.com/jsonresume/resume-schema/refs/tags/v1.2.1/schema.json',
  };

  const options = {
    wordwrap: null,
    selectors: [
      { selector: "IconText", format: "skip" },
    ],
  };
  Object.assign(ret, sanitize(cv, options));

  if (!ret.basics.profiles) { ret.basics.profiles = []; }
  for (const site of ['linkedin', 'github', 'stackoverflow']) {
    ret.basics.profiles.push({
      network: websites[site].name,
      username: websites[site].username,
      url: websites[site].url
    })
  }

  return new Response(JSON.stringify(ret), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
