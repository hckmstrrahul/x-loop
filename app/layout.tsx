import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Shell } from '@/components/Shell';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'x/loop — reach telemetry for X creators',
  description:
    'A creator workbench built on the open-sourced X For You algorithm. Pre-score drafts, check quote-safety, mine archetypes from your post history.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
