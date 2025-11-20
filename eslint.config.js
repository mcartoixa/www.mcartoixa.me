import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from "typescript-eslint";
import pluginAstro from 'eslint-plugin-astro';

import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath, URL } from 'node:url';

const gitIgnorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitIgnorePath, '.gitignore patterns'),
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginAstro.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: pluginAstro.Parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
        ecmaVersion: 'latest',
        project: './tsconfig.json',
      },
    },
  },
]);
