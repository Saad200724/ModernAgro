import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/hooks/use-toast";
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={product.imageUrl || "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          data-testid={`product-image-${product.id}`}
        />
      </div>
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`} className="block" data-testid={`product-link-${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-farm-green transition-colors" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`product-description-${product.id}`}>
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-farm-green" data-testid={`product-price-${product.id}`}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <Button 
            onClick={handleAddToCart} 
            className="bg-farm-green hover:bg-green-700 text-white"
            data-testid={`add-to-cart-${product.id}`}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
