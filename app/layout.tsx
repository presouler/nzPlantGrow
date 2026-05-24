import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'nzPlant',
  description: 'Seasonal plant recommendations for New Zealand home gardens.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ">
      <body>{children}</body>
    </html>
  );
}
