"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isMounted, setIsMounting] = React.useState(false);

  React.useEffect(() => {
    setIsMounting(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
