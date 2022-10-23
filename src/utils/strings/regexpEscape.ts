const search = /([-^$*()+\\|[\]{}.?])/g;
const replace = "\\$1";

export const regexpEscape = (s: string) => s.replace(search, replace);
