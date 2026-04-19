import type { Metadata } from 'next';
import MarketingHeader from '@/components/layout/MarketingHeader';
import MarketingFooter from '@/components/layout/MarketingFooter';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import HowItWorks from '@/components/landing/HowItWorks';
import FinalCTA from '@/components/landing/FinalCTA';

export const metadata: Metadata = {
  title: 'ResumeGenie.AI - Build a Resume That Gets Interviews',
  description:
    'LaTeX-quality PDF resumes in seconds. AI-powered scoring, optimization, and ATS-friendly templates trusted by engineers at top tech companies.',
  alternates: {
    canonical: 'https://resumegenie.ai',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ResumeGenie.AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered resume builder with LaTeX-quality PDF output, ATS optimization, and professional templates.',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Starter',
      description: 'Free plan with 3 PDF compilations per day',
    },
    {
      '@type': 'Offer',
      price: '9.99',
      priceCurrency: 'USD',
      name: 'Pro',
      description: 'Unlimited compilations, all templates, JD matching',
    },
    {
      '@type': 'Offer',
      price: '29.99',
      priceCurrency: 'USD',
      name: 'Enterprise',
      description: 'Everything in Pro plus unlimited AI analyses and API access',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '10000',
    bestRating: '5',
  },
  featureList: [
    'LaTeX-quality PDF generation',
    'AI resume scoring and optimization',
    'ATS-friendly templates',
    'Google Sign-In authentication',
    'JD matching and alignment',
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingHeader />

      <div className="relative overflow-hidden">
        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl animate-float" />
          <div
            className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-pink-200/20 blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-blue-200/20 blur-3xl animate-float"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <HeroSection />
        <StatsBar />
        <FeaturesGrid />
        <HowItWorks />
        <FinalCTA />
        <MarketingFooter />
      </div>
    </div>
  );
}
