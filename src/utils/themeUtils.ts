import { RGB, TinyColor } from '@ctrl/tinycolor';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

export function findClosestTheme(color: string): string {
  const targetColor = new TinyColor(color);
  const targetRgb = targetColor.toRgb();

  let closestTheme = 'light';
  let minDistance = Infinity;

  // Compare with primary colors of all themes
  THEMES.forEach(theme => {
    const themeColor = new TinyColor(theme.colors.primary);
    const distance = calculateColorDistance(targetRgb, themeColor.toRgb());
    
    if (distance < minDistance) {
      minDistance = distance;
      closestTheme = theme.name;
    }
  });

  return closestTheme;
}

// Calculate Euclidean distance between two RGB colors
function calculateColorDistance(color1: RGB, color2: RGB): number {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

// Theme definitions with their color schemes
export const THEMES = [
  {
    name: "light",
    colors: { primary: "#570DF8", secondary: "#F000B8", accent: "#37CDBE", neutral: "#3D4451" }
  },
  {
    name: "dark",
    colors: { primary: "#661AE6", secondary: "#D926AA", accent: "#1FB2A5", neutral: "#191D24" }
  },
  // ... more themes
] as const;