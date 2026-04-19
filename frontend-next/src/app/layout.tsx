import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'ResumeGenie.AI - Build a Resume That Gets Interviews',
    template: '%s | ResumeGenie.AI',
  },
  description:
    'LaTeX-quality PDF resumes in seconds. AI-powered scoring, optimization, and ATS-friendly templates trusted by engineers at top tech companies.',
  keywords: [
    'resume builder',
    'AI resume',
    'LaTeX resume',
    'ATS resume',
    'resume templates',
    'career',
    'job application',
    'FAANG resume',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resumegenie.ai',
    siteName: 'ResumeGenie.AI',
    title: 'ResumeGenie.AI - Build a Resume That Gets Interviews',
    description:
      'LaTeX-quality PDF resumes in seconds. AI-powered scoring, optimization, and ATS-friendly templates.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResumeGenie.AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeGenie.AI - Build a Resume That Gets Interviews',
    description:
      'LaTeX-quality PDF resumes in seconds. AI-powered scoring & optimization.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#9333ea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans text-slate-900 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontSize: '13px',
                borderRadius: '16px',
                fontWeight: 600,
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
