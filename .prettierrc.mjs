/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions}
 */
const config = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  editorConfig: true,
  endOfLine: 'auto',
  plugins: [
    'prettier-plugin-astro',
    'prettier-plugin-tailwindcss' // Needs to be last
  ],
  printWidth: 120,
  semi: true,
  singleQuote: true,
  tailwindStylesheet: './src/css/global.css',
  trailingComma: 'none',
  vueIndentScriptAndStyle: false,
};

export default config;
