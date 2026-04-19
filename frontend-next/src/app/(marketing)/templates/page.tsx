import type { Metadata } from 'next';
import TemplatesPageClient from '@/components/templates/TemplatesPageClient';

export const metadata: Metadata = {
  title: 'Templates',
  description:
    'Browse 5 ATS-optimized, LaTeX-powered resume templates used by engineers at FAANG companies. Deedy, Jakes, ModernCV, and more.',
  alternates: {
    canonical: 'https://resumegenie.ai/templates',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Resume Templates - ResumeGenie.AI',
  description:
    '5 battle-tested, ATS-optimized LaTeX resume templates used by engineers at top tech companies.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Deedy Reversed',
        description:
          'The classic two-column layout preferred by top tech companies.',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: "Jake's Resume",
        description:
          'The gold standard for single-column resumes. Optimized for ATS parsing.',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Modern CV',
        description:
          'A professional layout suitable for corporate and academic roles.',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Modern Single Column',
        description:
          'Clean, modern design with a distinct header and clear hierarchy.',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Modern Deedy',
        description:
          'A refreshed two-column layout with improved typography and spacing.',
      },
    ],
  },
};

export default function TemplatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplatesPageClient />
    </>
  );
}
