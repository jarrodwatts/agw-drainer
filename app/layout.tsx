import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AbstractWalletWrapper from "@/components/NextAbstractWalletProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGW Transaction Simulation Test",
  description: "Test site for Abstract Global Wallet transaction simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AbstractWalletWrapper>
          {children}
        </AbstractWalletWrapper>
      </body>
    </html>
  );
}
