import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Phone, MessageCircle, Star, Award, Clock } from "lucide-react";
import type { Product } from "@shared/schema";

export default function HomePage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.slice(0, 3) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 lg:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-purple-300 rounded-full"></div>
          <div className="absolute top-40 right-20 w-20 h-20 border-2 border-indigo-300 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-purple-300 rounded-full"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Premium Badge */}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-2 text-sm font-semibold">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Premium Duck Farm Since 2019
                </Badge>
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight" data-testid="hero-title">
                  Modern Agro{" "}
                  <span className="text-primary">Duck Farm</span>
                </h1>
                <h2 className="text-lg sm:text-xl lg:text-3xl font-medium text-gray-700 mt-3">
                  Premium Quality, Farm Fresh Products
                </h2>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg" data-testid="hero-description">
                Experience the finest duck products from our sustainable farm in Savar, Bangladesh. 
                Three generations of expertise delivering fresh eggs, premium meat, and specialty products to your table.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/shop">
                  <Button 
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 lg:px-8 py-3 text-base lg:text-lg font-semibold shadow-lg transition-all duration-200"
                    data-testid="hero-shop-button"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shop Products
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/5 px-6 lg:px-8 py-3 text-base lg:text-lg font-semibold transition-all duration-200"
                    data-testid="hero-message-button"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </Link>
              </div>

              
            </div>

            {/* Right Content - Farm Image */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 shadow-xl">
                {/* Trust Badge */}
                <div className="absolute top-6 right-6 z-10">
                  <Badge className="bg-white text-green-700 shadow-lg px-3 py-2 font-semibold">
                    <Award className="w-4 h-4 mr-2" />
                    Trusted by 500+ Families
                  </Badge>
                </div>
                
                {/* Duck Farm Image */}
                <div className="relative">
                  <img 
                    src="/attached_assets/image_1754764150065.png" 
                    alt="White ducks at Modern Agro Duck Farm" 
                    className="w-full h-96 object-cover rounded-xl shadow-lg"
                    data-testid="hero-farm-image"
                  />
                  
                  {/* Quality Badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/95 text-gray-700 shadow-lg px-3 py-2 font-semibold">
                      <span className="text-green-600 mr-2">✓</span>
                      Organic Certified
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 bg-white rounded-full p-4 shadow-lg border-4 border-green-100">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3G</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-full p-4 shadow-lg border-4 border-yellow-100">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">150+</span>
                </div>
              </div>
            </div>
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8" data-testid="featured-products-grid">
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
                src="https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Ducks swimming in pond" 
                className="rounded-lg shadow-lg"
                data-testid="about-image-1"
              />
              <img 
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Duck farm with wooden fence" 
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
                src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Ducks grazing in green pasture" 
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
