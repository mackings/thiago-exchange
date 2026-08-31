import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import AppThemeRegistry from "@/components/AppThemeRegistry";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui-auth" }}>
      <AppThemeRegistry>{children}</AppThemeRegistry>
    </AppRouterCacheProvider>
  );
}
