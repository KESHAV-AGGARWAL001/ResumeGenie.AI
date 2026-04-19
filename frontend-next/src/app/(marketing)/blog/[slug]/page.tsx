import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = getPostBySlug(slug);
    return {
      title: frontmatter.title,
      description: frontmatter.description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.description,
        type: 'article',
        publishedTime: frontmatter.date,
        authors: [frontmatter.author],
        tags: frontmatter.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: frontmatter.title,
        description: frontmatter.description,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    author: { '@type': 'Person', name: post.frontmatter.author },
    publisher: { '@type': 'Organization', name: 'ResumeGenie.AI' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://resumegenie.ai/blog/${slug}` },
  };

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mb-8">
        <Link href="/blog" className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
          &larr; Back to Blog
        </Link>
      </div>
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            {post.frontmatter.category}
          </span>
          <span className="text-xs text-slate-400">{post.frontmatter.readingTime}</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">{post.frontmatter.title}</h1>
        <p className="text-lg text-slate-500">{post.frontmatter.description}</p>
        <div className="mt-4 text-sm text-slate-400">
          {post.frontmatter.author} &middot;{' '}
          {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </header>
      <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-a:text-purple-600">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug],
            },
          }}
        />
      </div>
    </article>
  );
}
