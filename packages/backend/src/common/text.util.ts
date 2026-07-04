/** Small text helpers shared by the analysis and AI services. */

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const presentStrings = (
  values: Array<string | null | undefined>,
): string[] => values.filter((value): value is string => Boolean(value));

export const unique = <T>(values: T[]): T[] => [
  ...new Set(values.filter(Boolean)),
];

export const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
