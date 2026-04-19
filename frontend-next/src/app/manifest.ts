import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ResumeGenie.AI',
    short_name: 'ResumeGenie',
    description: 'AI-powered resume builder with LaTeX-quality PDFs',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafbfc',
    theme_color: '#9333ea',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
