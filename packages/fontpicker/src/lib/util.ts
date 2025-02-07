export function sanify(fontName: string): string {
  return fontName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase()
}
