import { Response } from 'node-fetch-native';
import { sanitize } from '../../utils/cv.js';
import type { StructuredData, Website } from '../../types';

import cv from '../../data/about/cv.yaml';
import websites from '../../data/websites.json'

/**
 * Serves the CV as a JSON Resume document (https://jsonresume.org), augmenting
 * it with social/professional profiles drawn from `websites.json`.
 */
export async function GET() {
  const ret: StructuredData = {
    '$schema': 'https://raw.githubusercontent.com/jsonresume/resume-schema/refs/tags/v1.2.1/schema.json',
  };

  const options = {
    wordwrap: null,
    selectors: [
      { selector: "IconText", format: "inline" },
    ],
  };
  Object.assign(ret, sanitize(cv, options));

  if (!ret.basics.profiles) { ret.basics.profiles = []; }
  const knownWebsites = websites as Record<string, Website>;
  for (const site of ['dev', 'github', 'gitlab', 'huggingface', 'linkedin', 'microsoft-learn', 'npm', 'nuget', 'openhub', 'salesforce-trailblazer', 'stackoverflow', 'xing']) {
    ret.basics.profiles.push({
      network: knownWebsites[site].name,
      username: knownWebsites[site].username,
      url: knownWebsites[site].url
    })
  }

  return new Response(JSON.stringify(ret), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
