
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { Plus, Heart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100" data-testid={`product-card-${product.id}`}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.imageUrl || "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          data-testid={`product-image-${product.id}`}
        />
        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      
      {/* Product Info */}
      <CardContent className="p-4 space-y-3">
        <Link href={`/product/${product.id}`} className="block" data-testid={`product-link-${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-base mb-1 hover:text-primary transition-colors line-clamp-2 min-h-[3rem]" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xl font-bold text-gray-900" data-testid={`product-price-${product.id}`}>
              ৳{parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          <Button 
            onClick={handleAddToCart} 
            size="sm"
            className="w-9 h-9 p-0 bg-primary hover:bg-primary/90 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            data-testid={`add-to-cart-${product.id}`}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
