import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Pagelight",
  description: "AI-powered article visualization",
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
