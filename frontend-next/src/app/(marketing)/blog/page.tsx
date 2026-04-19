import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert tips on resume writing, ATS optimization, career growth, and landing your dream job.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog - ResumeGenie.AI',
    description: 'Expert career advice and resume tips from ResumeGenie.AI',
    url: '/blog',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Career <span className="gradient-text">Insights</span>
        </h1>
        <p className="text-base text-slate-500 max-w-lg mx-auto">
          Expert tips on resume writing, ATS optimization, and landing your dream job.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">Blog posts coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-slate-200/60 bg-white p-6 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                  {post.category}
                </span>
                <span className="text-[10px] text-slate-400">{post.readingTime}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                {post.description}
              </p>
              <div className="text-xs text-slate-400">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
