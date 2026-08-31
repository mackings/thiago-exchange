"use client";

import { useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "@/components/Logo";

export type AdminNavItem<TKey extends string> = {
  key: TKey;
  label: string;
  icon: ReactNode;
};

const sidebarWidth = 252;

export function AdminShell<TKey extends string>({
  nav,
  active,
  onChange,
  title,
  subtitle,
  adminName,
  backHref = "/market",
  children,
}: {
  nav: AdminNavItem<TKey>[];
  active: TKey;
  onChange: (key: TKey) => void;
  title: string;
  subtitle?: string;
  adminName?: string;
  backHref?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navList = (onNavigate?: () => void) => (
    <Stack spacing={0.5} sx={{ px: 1.5 }}>
      {nav.map((item) => {
        const isActive = item.key === active;
        return (
          <Box
            key={item.key}
            component="button"
            onClick={() => {
              onChange(item.key);
              onNavigate?.();
            }}
            sx={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.4,
              px: 1.5,
              py: 1.1,
              borderRadius: 2,
              fontWeight: 900,
              fontSize: 14.5,
              color: isActive ? "#611818" : "#7a5a5a",
              bgcolor: isActive ? "#fbebeb" : "transparent",
              "&:hover": { bgcolor: isActive ? "#fbebeb" : "rgba(32,8,8,0.04)" },
              transition: "background-color .15s ease",
            }}
          >
            <Box sx={{ display: "grid", placeItems: "center", "& svg": { fontSize: 20 } }}>{item.icon}</Box>
            {item.label}
          </Box>
        );
      })}
    </Stack>
  );

  const sidebarHeader = (
    <Box sx={{ px: 2.5, py: 2.5 }}>
      <Logo markSize={30} />
      <Typography sx={{ mt: 1.5, fontWeight: 1000, fontSize: 12, letterSpacing: 1.4, color: "#a58888", textTransform: "uppercase" }}>
        Merchant console
      </Typography>
    </Box>
  );

  const sidebarFooter = (
    <Box sx={{ px: 1.5, py: 1.5 }}>
      <Divider sx={{ mb: 1.5, borderColor: "rgba(32,8,8,0.08)" }} />
      <Button
        href={backHref}
        startIcon={<ArrowBackIcon />}
        sx={{ color: "#7a5a5a", fontWeight: 800, justifyContent: "flex-start", width: "100%", px: 1.5 }}
      >
        Back to app
      </Button>
      {adminName && (
        <Typography sx={{ px: 1.5, mt: 0.5, fontSize: 12, color: "#a58888", fontWeight: 700 }}>
          Signed in as {adminName}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#faf7f0", display: "flex" }}>
      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: sidebarWidth,
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRight: "1px solid rgba(32,8,8,0.08)",
          bgcolor: "#fffefb",
        }}
      >
        <Box>
          {sidebarHeader}
          {navList()}
        </Box>
        {sidebarFooter}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: sidebarWidth, bgcolor: "#fffefb", display: "flex", flexDirection: "column", justifyContent: "space-between" } }}
      >
        <Box>
          {sidebarHeader}
          {navList(() => setMobileOpen(false))}
        </Box>
        {sidebarFooter}
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Mobile top bar */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            display: { xs: "flex", md: "none" },
            position: "sticky",
            top: 0,
            zIndex: 10,
            px: 1.5,
            py: 1.2,
            bgcolor: "#fffefb",
            borderBottom: "1px solid rgba(32,8,8,0.08)",
          }}
        >
          <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#611818" }}>
            <MenuIcon />
          </IconButton>
          <Logo markSize={24} />
        </Stack>

        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 }, maxWidth: 1280, mx: "auto" }}>
          <Box sx={{ mb: { xs: 2.5, md: 3.5 } }}>
            <Typography sx={{ fontWeight: 1000, fontSize: { xs: 24, md: 30 }, letterSpacing: "-0.03em", color: "#200808" }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ color: "#7a5a5a", fontSize: { xs: 14, md: 15 }, mt: 0.3 }}>{subtitle}</Typography>
            )}
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
