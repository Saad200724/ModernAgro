import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.slice(0, 3) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6" data-testid="hero-title">
              Fresh From Our Farm
              <span className="block text-warm-yellow">To Your Table</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto" data-testid="hero-description">
              Premium duck eggs and meat from ethical, sustainable farming practices. 
              Taste the difference that quality makes.
            </p>
            <Link href="/shop">
              <Button 
                size="lg" 
                className="bg-farm-green text-white hover:bg-green-700 px-8 py-4 text-lg shadow-lg"
                data-testid="hero-cta-button"
              >
                Shop Fresh Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="featured-products-title">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto" data-testid="featured-products-description">
              Discover our premium selection of farm-fresh duck products, carefully raised with sustainable practices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8" data-testid="featured-products-grid">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6" data-testid="about-title">Our Story</h2>
              <p className="text-gray-600 mb-6" data-testid="about-description-1">
                For over three generations, Modern Agro has been committed to ethical duck farming practices. 
                Our ducks roam freely on our 150-acre farm, enjoying a natural diet and clean environment.
              </p>
              <p className="text-gray-600 mb-6" data-testid="about-description-2">
                We believe in sustainable agriculture that respects both animals and the environment. 
                Our products are hormone-free, antibiotic-free, and raised with the utmost care.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8" data-testid="farm-stats">
                <div className="text-center">
                  <div className="text-2xl font-bold text-farm-green" data-testid="stat-acres">150+</div>
                  <div className="text-sm text-gray-600">Acres</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-farm-green" data-testid="stat-ducks">500+</div>
                  <div className="text-sm text-gray-600">Happy Ducks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-farm-green" data-testid="stat-generations">3</div>
                  <div className="text-sm text-gray-600">Generations</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4" data-testid="about-images">
              <img 
                src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Ducks in natural habitat" 
                className="rounded-lg shadow-lg"
                data-testid="about-image-1"
              />
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Farm barn" 
                className="rounded-lg shadow-lg mt-8"
                data-testid="about-image-2"
              />
              <img 
                src="https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Fresh eggs in nest" 
                className="rounded-lg shadow-lg -mt-8"
                data-testid="about-image-3"
              />
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Rolling farmland" 
                className="rounded-lg shadow-lg"
                data-testid="about-image-4"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
