"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Same structural theme as the reference app (pill buttons, soft card
// shadows, Plus Jakarta Sans) — just re-colored onto Thiago's actual
// maroon/gold brand instead of the placeholder blue/purple.
const theme = createTheme({
  typography: {
    fontFamily: '"Plus Jakarta Sans", Arial, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 800,
    },
  },
  palette: {
    primary: {
      main: "#611818",
      dark: "#4a1212",
    },
    secondary: {
      main: "#d9861f",
    },
    // Semantic states pulled from the brand's own maroon/gold family instead
    // of MUI's default green/red — a completed trade or a dispute chip
    // should never look like it wandered in from another palette.
    success: {
      main: "#8a5a10",
      light: "#fdf6e9",
      dark: "#6e480d",
      contrastText: "#ffffff",
    },
    error: {
      main: "#7a1f1f",
      light: "#fbebeb",
      dark: "#5c1717",
      contrastText: "#ffffff",
    },
    background: {
      default: "#faf7f0",
      paper: "#ffffff",
    },
    text: {
      primary: "#200808",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 999,
          boxShadow: "none",
          fontWeight: 800,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 12px 34px rgba(32, 8, 8, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default function AppThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
