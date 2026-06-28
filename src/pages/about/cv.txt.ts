import { Response } from 'node-fetch-native';
import type { Cv } from '../../types';

import cv from '../../data/about/cv.yaml';
import { sanitize, formatDate } from '../../utils/cv.js';

/**
 * Serves the CV as a plain-text résumé, rendered from the same source as the
 * JSON Resume endpoint.
 */
export async function GET() {
  const options = {
    wordwrap: null,
    selectors: [
      { selector: "IconText", format: "inline" },
    ],
  };
  const resume = sanitize(cv, options, false) as Cv;

  const ret = `
${resume.basics.name}
${resume.basics.label}
${resume.basics.location?.city}, ${resume.basics.location?.countryCode}

SUMMARY
${resume.basics.summary}

EXPERIENCE
${resume.work
  .map(
    job => `
${job.position} - ${job.name}
${formatDate(job.startDate)} to ${job.endDate ? formatDate(job.endDate) : 'Present'}
${job.summary ?? ''}${job.highlights?.map(h => `• ${h}`).join('\n')}
`
  )
  .join('\n')}

EDUCATION
${resume.education
  .map(
    edu => `
${edu.studyType}${edu.area ? ` in ${edu.area}` : ''}
${edu.institution}, ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}
`
  )
  .join('\n')}

SKILLS
${resume.skills.map(s => s.name).join(', ')}
  `.trim();

  return new Response(ret, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}
