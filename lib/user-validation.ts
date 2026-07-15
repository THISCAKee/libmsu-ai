const NAME_PART = "\\p{L}[\\p{L}\\p{M}]*";
const FULL_NAME_PATTERN = new RegExp(`^${NAME_PART}(?: ${NAME_PART})+$`, "u");

export function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidFullName(value: string) {
  return FULL_NAME_PATTERN.test(normalizeFullName(value));
}
