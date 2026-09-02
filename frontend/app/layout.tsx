import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ACE | Preparação inteligente para a PNA',
  description:
    'Banco de questões, exames personalizados, materiais clínicos e análise de preparação para a Prova Nacional de Acesso.',
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'ACE | Preparação inteligente para a PNA',
    description:
      'Banco de questões, exames personalizados, materiais clínicos e análise de preparação para a PNA.',
    locale: 'pt_PT',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ACE — Preparação inteligente para a PNA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACE | Preparação inteligente para a PNA',
    description:
      'Banco de questões, exames personalizados e análise de preparação para a PNA.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
