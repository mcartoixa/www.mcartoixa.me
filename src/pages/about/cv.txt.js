import { Response } from 'node-fetch-native';
import { convert } from "html-to-text";

import cv from '../../data/about/cv.yaml';

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
  const options = {
    wordwrap: null,
    selectors: [
      { selector: "IconText", format: "skip" },
    ],
  };
  const resume = sanitize(cv, options);

  const ret = `
${resume.basics.name}
${resume.basics.label}
${resume.basics.location?.city}, ${resume.basics.location?.countryCode}

SUMMARY
${resume.basics.summary}

EXPERIENCE
${resume.work
    .map(
      (job) => `
${job.position} - ${job.name}
${job.startDate} to ${job.endDate || 'Present'}
${job.summary ?? ''}${job.highlights?.map((h) => `• ${h}`).join('\n')}
`
    )
    .join('\n')}

EDUCATION
${resume.education
    .map(
      (edu) => `
${edu.studyType} in ${edu.area}
${edu.institution}, ${edu.startDate} - ${edu.endDate}
`
    )
    .join('\n')}

SKILLS
${resume.skills.map((s) => s.name).join(', ')}
  `.trim();

  return new Response(ret, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
