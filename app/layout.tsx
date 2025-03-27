import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";

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
        <AbstractWalletProvider chain={abstractTestnet}>
          {children}
        </AbstractWalletProvider>
      </body>
    </html>
  );
}
