/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('logfile-grunt')(grunt, { filePath: './build.log', clearLogFile: true });

  const path = require('node:path');
  const rexcape = require('regexp.escape');

  grunt.initConfig({
    package: grunt.file.readJSON('./package.json'),
    clean: {
      build: ['tmp/']
    },
    env: {
      prepare: { NODE_ENV: 'production' }
    },
    exec: {
      'analyze-eslint': 'eslint .',
      'compile-astro': 'astro build',
      'package-msdeploy-win': `msdeploy.exe -verb:sync -source:contentPath=${path.resolve('./tmp/bin/dist')} -dest:package=${path.resolve('./tmp/out/bin/package.zip')} -replace:objectName=path,match="${rexcape(path.resolve('./tmp/bin/dist'))}",replace="C:\\inetpub\\<%= package.name %>\\"`,
      'prepare-astro': 'astro sync',
    },
    zip: {
      package: {
        cwd: './tmp/bin/dist',
        src: ['./tmp/bin/dist/**'],
        dest: './tmp/out/bin/<%= package.name %>.zip'
      }
    },
  });

  grunt.registerTask('package:msdeploy', () => {
    if (process.platform === 'win32') grunt.task.run('exec:package-msdeploy-win');
  });

  grunt.registerTask('analyze', ['run-once:prepare', 'exec:analyze-eslint']);
  // clean already exists...
  grunt.registerTask('clean-do', [
    'run-once:prepare',
    'clean:build',
    'exec:prepare-astro'
  ]);
  grunt.registerTask('compile', ['run-once:prepare', 'exec:compile-astro']);
  grunt.registerTask('package', [
    'run-once:prepare',
    'run-once:compile',
    'zip:package',
    'package:msdeploy'
  ]);
  grunt.registerTask('prepare', ['env:prepare', 'exec:prepare-astro']);
  grunt.registerTask('test', ['run-once:prepare']);

  grunt.registerTask('build', ['run-once:analyze', 'run-once:compile', 'run-once:test']);
  grunt.registerTask('rebuild', ['run-once:clean-do', 'run-once:build']);
  grunt.registerTask('release', ['rebuild', 'run-once:package']);
  grunt.registerTask('default', ['build']);
}
