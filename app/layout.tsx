import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lampstand | Bible Quiz Training",
  description: "Focused practice for Proverbs, Job, and Revelation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
