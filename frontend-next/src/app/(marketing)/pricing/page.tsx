import type { Metadata } from 'next';
import PricingPageClient from '@/components/pricing/PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple pricing for ResumeGenie.AI. Start free and upgrade when you are ready to unlock the full power of AI-driven resume building.',
  alternates: {
    canonical: 'https://resumegenie.ai/pricing',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'ResumeGenie.AI Pricing',
  description:
    'Simple pricing for AI-powered resume building. Free starter plan, Pro at $9.99/month, Enterprise at $29.99/month.',
  mainEntity: {
    '@type': 'Product',
    name: 'ResumeGenie.AI',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '0',
        priceCurrency: 'USD',
        description: 'Get started with the basics - 3 PDF compilations per day',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '9.99',
        priceCurrency: 'USD',
        description:
          'Everything to land your dream job - unlimited compilations, all templates',
      },
      {
        '@type': 'Offer',
        name: 'Enterprise',
        price: '29.99',
        priceCurrency: 'USD',
        description:
          'For power users and teams - unlimited AI analyses, API access',
      },
    ],
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingPageClient />
    </>
  );
}
