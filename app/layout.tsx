import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sendtim Community Demo",
  description: "A minimal example of connecting a Next.js signup form to Sendtim.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ro"><body>{children}</body></html>;
}
