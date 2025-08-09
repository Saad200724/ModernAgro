import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${slug}`],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Skeleton className="h-4 w-24 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-32 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="blog-post-content">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6" data-testid="back-to-blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="post-title">
            {post.title}
          </h1>
          <div className="text-gray-500" data-testid="post-date">
            Published {format(new Date(post.createdAt!), "MMMM d, yyyy")}
          </div>
        </header>

        {post.imageUrl && (
          <div className="mb-8">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
              data-testid="post-featured-image"
            />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          data-testid="post-content"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/blog">
            <Button className="bg-farm-green hover:bg-green-700 text-white" data-testid="back-to-blog-bottom">
              Back to All Posts
            </Button>
          </Link>
        </div>
      </article>
    </Layout>
  );
}
