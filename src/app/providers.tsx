"use client";

import { defineStyleConfig, extendTheme } from "@chakra-ui/react";
import { SaasProvider, theme as baseTheme } from "@saas-ui/react";
const tooltipProps = {
  "--popper-arrow-bg": "#171A1D",
  bg: "#171A1D",
  color: "white",
  borderRadius: "4px",
  px: 2,
  py: 1,
  fontSize: "sm",
  fontWeight: 500,
  fontFamily: "heading",
  lineHeight: "20px",
  letterSpacing: "0.25px",
  placement: "bottom-start" as "bottom-start", // Corrected placement as a string
  modifiers: [
    {
      name: "offset",
      options: {
        offset: [100, 5], // Adjust horizontal shift
      },
    },
    {
      name: "preventOverflow",
      options: {
        padding: 0,
      },
    },
    {
      name: "arrow",
      options: {
        padding: 8, // Reduced from 70 to 8 for correct arrow placement
      },
    },
    {
      name: "computeStyles",
      options: {
        gpuAcceleration: false,
      },
    },
    {
      name: "flip",
      options: {
        enabled: false, // Prevent flipping to the opposite side
      },
    },
  ],
};
const tooltipTheme = defineStyleConfig({
  baseStyle: tooltipProps,
});
const theme = extendTheme(
  {
    components: {
      Tooltip: tooltipTheme,
    },
  },
  baseTheme
);
export function Providers({ children }: { children: React.ReactNode }) {
  return <SaasProvider theme={theme}>{children}</SaasProvider>;
}
