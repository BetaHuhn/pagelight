import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Pagelight AI",
  description: "Pagelight AI reads your article, extracts the key data, and renders it as a beautifully designed piece with animated charts woven throughout the text",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
