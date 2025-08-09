import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  return (
    <Layout>
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="blog-title">Farm Blog</h1>
            <p className="text-gray-600" data-testid="blog-description">
              Learn about duck farming, nutrition tips, and sustainable agriculture practices.
            </p>
          </div>

          <div className="space-y-8" data-testid="blog-posts">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="w-full h-48 md:h-full" />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-16 w-full mb-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </Card>
              ))
            ) : posts?.length === 0 ? (
              <div className="text-center py-12" data-testid="no-posts">
                <p className="text-gray-500 text-lg">No blog posts available yet.</p>
              </div>
            ) : (
              posts?.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow" data-testid={`blog-post-${post.id}`}>
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={post.imageUrl || "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"}
                        alt={post.title}
                        className="w-full h-48 md:h-full object-cover"
                        data-testid={`blog-post-image-${post.id}`}
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="text-sm text-gray-500 mb-2" data-testid={`blog-post-date-${post.id}`}>
                        {format(new Date(post.createdAt!), "MMMM d, yyyy")}
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-farm-green transition-colors" data-testid={`blog-post-title-${post.id}`}>
                          {post.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-3" data-testid={`blog-post-excerpt-${post.id}`}>
                        {post.excerpt || post.content.substring(0, 150) + "..."}
                      </p>
                      <Link href={`/blog/${post.slug}`} className="text-farm-green font-medium hover:text-green-700 transition-colors" data-testid={`read-more-${post.id}`}>
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
