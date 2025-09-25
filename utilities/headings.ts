export const normalizeHeadingId = (id?: string) => {
  if (!id) return undefined;
  return decodeURIComponent(id.toLowerCase());
};
