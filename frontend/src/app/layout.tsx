import LayoutWrapper from '@/components/layout-wrapper';
import { AuthProvider } from '@/utils/AuthContext';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HVTP",
  description: "HVTP Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}