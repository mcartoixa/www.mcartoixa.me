import * as process from 'node:process';
import { getViteConfig } from 'astro/config';

const consoleReporter = process.env.AI_AGENT ? 'agent' : 'default';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      reporter: [['cobertura', { file: '../cobertura-results.xml', projectRoot: './src' }]],
      reportOnFailure: true,
      reportsDirectory: './tmp/coverage'
    },
    outputFile: {
      junit: './tmp/junit-results.xml'
    },
    reporters: [consoleReporter, 'github-actions', 'junit']
  }
});
