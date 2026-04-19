import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { BlogFrontmatter } from '@/lib/types';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export function getAllPosts(): (BlogFrontmatter & { slug: string })[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  const posts = files.map((filename) => {
    const slug = filename.replace('.mdx', '');
    const source = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
    const { data, content } = matter(source);
    return {
      ...(data as BlogFrontmatter),
      slug,
      readingTime: readingTime(content).text,
    };
  });
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  const source = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8');
  const { data, content } = matter(source);
  return {
    frontmatter: { ...data, readingTime: readingTime(content).text } as BlogFrontmatter,
    content,
  };
}
