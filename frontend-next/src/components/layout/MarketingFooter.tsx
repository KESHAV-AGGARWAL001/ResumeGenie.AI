import Link from 'next/link';

export default function MarketingFooter() {
  return (
    <footer className="py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-sm font-bold gradient-text">
            ResumeGenie.AI
          </Link>
          <span className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} ResumeGenie.AI. Built with AI.
          </span>
        </div>
      </div>
    </footer>
  );
}
