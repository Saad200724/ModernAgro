import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart, Star, Check, Truck, Shield, ArrowLeft } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const relatedProducts = allProducts?.filter(p => 
    p.id !== product?.id && p.category === product?.category
  ).slice(0, 4) || [];

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      });
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoadingProduct) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="w-full h-96 lg:h-[600px] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            <Link href="/shop">
              <Button className="mt-4" style={{ backgroundColor: '#1E391E' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16" data-testid="product-detail">
            
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200 relative group">
                <img
                  src={product.imageUrl || "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-testid="product-image"
                />
                {!inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">Out of Stock</Badge>
                  </div>
                )}
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-white">
                  <CardContent className="p-4 text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-xs font-medium text-gray-700">100% Organic</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-4 text-center">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-xs font-medium text-gray-700">Fast Delivery</p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-green-600 fill-current" />
                    <p className="text-xs font-medium text-gray-700">Farm Fresh</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {product.category}
                </Badge>
              </div>

              {/* Title and Price */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3" data-testid="product-name">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl lg:text-4xl font-bold" style={{ color: '#1E391E' }} data-testid="product-price">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <p className="text-lg text-gray-500">per {product.unit || 'piece'}</p>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {inStock ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      In Stock {lowStock && `(Only ${product.stock} left!)`}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Description</h3>
                <p className="text-gray-600 leading-relaxed" data-testid="product-description">
                  {product.description}
                </p>
              </div>

              {/* Nutritional Facts */}
              {product.nutritionalFacts && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Nutritional Information</h3>
                  <p className="text-gray-600 leading-relaxed" data-testid="nutritional-facts">
                    {product.nutritionalFacts}
                  </p>
                </div>
              )}

              <Separator />

              {/* Quantity Selector */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={!inStock || quantity <= 1}
                    className="h-12 w-12 p-0"
                    data-testid="quantity-decrease"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 h-12 text-center text-lg font-semibold"
                    min="1"
                    max={product.stock}
                    disabled={!inStock}
                    data-testid="quantity-input"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={!inStock || quantity >= product.stock}
                    className="h-12 w-12 p-0"
                    data-testid="quantity-increase"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={!inStock}
                  className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{ backgroundColor: inStock ? '#1E391E' : '#9ca3af' }}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {inStock ? `Add to Cart - $${(parseFloat(product.price) * quantity).toFixed(2)}` : 'Out of Stock'}
                </Button>
                
                {inStock && (
                  <p className="text-center text-sm text-gray-500">
                    Free delivery on orders over $50
                  </p>
                )}
              </div>

              {/* Additional Info */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Sustainably sourced from our farm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">No hormones or antibiotics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Three generations of expertise</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section data-testid="related-products" className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">You May Also Like</h2>
                <Link href="/shop">
                  <Button variant="outline" className="hidden sm:flex">
                    View All Products
                  </Button>
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
