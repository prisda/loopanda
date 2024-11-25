export function isLightColor(color: string): boolean {
  // Convert hex to RGB
  let r: number, g: number, b: number;

  if (color.startsWith('#')) {
    const hex = color.substring(1);
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    const matches = color.match(/(\d+)/g);
    if (!matches) return true;
    [r, g, b] = matches.map(Number);
  } else {
    return true; // Default to light for unknown formats
  }

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}