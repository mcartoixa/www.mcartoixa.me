// html-to-text@10 ships no type declarations and @types/html-to-text only covers v9.
declare module 'html-to-text' {
  export function convert(html: string, options?: Record<string, unknown>): string;
}
