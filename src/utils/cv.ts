import { convert } from 'html-to-text';

/**
 * Formats a date as a `YYYY-MM-DD` string, the format used throughout the CV
 * endpoints (and expected by the JSON Resume schema).
 *
 * @param date - The date to format.
 * @returns The date as a `YYYY-MM-DD` string.
 */
export const formatDate = (date: Date): string => date.toISOString().substring(0, 10);

const sanitizeInPlace = (record: Record<string, unknown>, options: Record<string, unknown> | undefined, formatDates: boolean): void => {
  for (const property in record) {
    const p = record[property];
    if (p instanceof Date) {
      if (formatDates) record[property] = formatDate(p);
    } else if (typeof p === 'string') {
      record[property] = convert(p, options);
    } else if (typeof p === 'object' && p !== null) {
      sanitizeInPlace(p as Record<string, unknown>, options, formatDates);
    }
  }
};

/**
 * Returns a sanitised deep copy of a résumé-like object: string values are run
 * through html-to-text's `convert` to strip markup, and `Date` values are
 * optionally formatted as `YYYY-MM-DD` strings. Nested objects and arrays are
 * sanitised recursively. The input is never mutated, so the same source object
 * can be sanitised differently by different callers.
 *
 * @param value - The object to sanitise.
 * @param options - Options forwarded to html-to-text's `convert`.
 * @param formatDates - When `true` (the default), `Date` values are replaced
 *   with `YYYY-MM-DD` strings; when `false`, they are left as `Date` objects so
 *   callers can format them themselves.
 * @returns A sanitised deep copy of the input.
 */
export const sanitize = <T>(value: T, options?: Record<string, unknown>, formatDates = true): T => {
  const clone = structuredClone(value);
  sanitizeInPlace(clone as Record<string, unknown>, options, formatDates);
  return clone;
};
