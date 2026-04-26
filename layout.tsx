import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DigiBoct — Premium Digital Products & AI Automations",
  description:
    "Premium digital subscriptions, AI-powered WhatsApp bots, Canva Pro lifetime & ChatGPT Plus. Pay with MAD or Pi Coin. Built for entrepreneurs in Morocco & Europe.",
  keywords: [
    "DigiBoct", "digital products", "AI automation", "WhatsApp bot",
    "Canva Pro lifetime", "ChatGPT Plus", "Pi Coin", "Pi Network",
    "Morocco", "SaaS", "no-code",
  ],
  openGraph: {
    title: "DigiBoct — Premium Digital Products & AI Automations",
    description: "AI automations, lifetime accounts & premium subscriptions. Pay with Pi Coin.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script src="https://sdk.minepi.com/pi-sdk.js" async defer></script>
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
