export const THEME_PALETTES = {
  light: {
    name: "Light Premium (Default)",
    description: "Clean, minimal white theme",
    cssVariables: {
      background: "0 0% 100%",
      foreground: "240 23% 5%",
      card: "0 0% 99%",
      border: "242 16% 84%",
      accent1: "217 100% 53%", // royal blue
      accent2: "25 100% 50%", // warm orange
      cardBg: "0 0% 98%",
      softText: "240 17% 40%",
    },
  },
  obsidian: {
    name: "Obsidian",
    description: "Deep dark with orange accents",
    cssVariables: {
      background: "220 13% 3%",
      card: "220 10% 8%",
      border: "220 8% 18%",
      accent1: "16 100% 50%", // orange
      accent2: "199 89% 48%", // blue
    },
  },
  midnight: {
    name: "Midnight Blue",
    description: "Cool blues and purples",
    cssVariables: {
      background: "240 20% 4%",
      card: "240 15% 10%",
      border: "240 10% 22%",
      accent1: "260 80% 50%", // purple
      accent2: "200 100% 50%", // cyan
    },
  },
  neon: {
    name: "Neon Glow",
    description: "Electric cyan and pink",
    cssVariables: {
      background: "220 20% 2%",
      card: "220 15% 8%",
      border: "220 10% 20%",
      accent1: "180 100% 50%", // cyan
      accent2: "320 100% 50%", // hot pink
    },
  },
  crimson: {
    name: "Crimson Fire",
    description: "Red and gold warmth",
    cssVariables: {
      background: "15 20% 4%",
      card: "15 15% 10%",
      border: "15 10% 22%",
      accent1: "0 100% 50%", // red
      accent2: "40 100% 50%", // gold
    },
  },
  emerald: {
    name: "Emerald Forest",
    description: "Green and teal harmony",
    cssVariables: {
      background: "150 20% 4%",
      card: "150 15% 10%",
      border: "150 10% 22%",
      accent1: "150 80% 45%", // emerald
      accent2: "180 70% 50%", // teal
    },
  },
  sunset: {
    name: "Sunset Paradise",
    description: "Orange and purple blend",
    cssVariables: {
      background: "25 30% 5%",
      card: "25 20% 11%",
      border: "25 15% 24%",
      accent1: "30 100% 50%", // orange
      accent2: "270 80% 50%", // purple
    },
  },
};

export type ThemeKey = keyof typeof THEME_PALETTES;

export function applyTheme(themeKey: ThemeKey) {
  const theme = THEME_PALETTES[themeKey];
  if (!theme) return;

  const root = document.documentElement;
  const vars = theme.cssVariables as Record<string, string>;

  // Apply all CSS variables
  root.style.setProperty("--background", vars.background);
  root.style.setProperty("--card", vars.card || vars.background);
  root.style.setProperty("--border", vars.border);
  
  // Set accent colors (using primary and secondary)
  root.style.setProperty("--primary", vars.accent1);
  root.style.setProperty("--accent", vars.accent2);
  
  // Set foreground - light theme uses dark text, dark themes use light text
  if (themeKey === "light") {
    root.style.setProperty("--foreground", vars.foreground || "240 23% 5%");
    root.style.setProperty("--card-foreground", "240 23% 5%");
    root.style.setProperty("--muted-foreground", vars.softText || "240 17% 40%");
  } else {
    root.style.setProperty("--foreground", "0 0% 99%");
    root.style.setProperty("--card-foreground", "0 0% 99%");
    root.style.setProperty("--muted-foreground", "0 0% 65%");
  }

  // Store in localStorage
  localStorage.setItem("rivals-theme", themeKey);
}

export function loadTheme(): ThemeKey {
  const stored = localStorage.getItem("rivals-theme") as ThemeKey;
  return stored && stored in THEME_PALETTES ? stored : "light";
}
