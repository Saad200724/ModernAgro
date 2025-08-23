import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useCart } from "@/components/CartProvider";
import { Trash2, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center" data-testid="empty-cart">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Link href="/shop">
              <Button className="bg-farm-green hover:bg-green-700 text-white" data-testid="continue-shopping">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="cart-title">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            {items.map(({ product, quantity }) => (
              <Card key={product.id} data-testid={`cart-item-${product.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        data-testid={`cart-item-image-${product.id}`}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900" data-testid={`cart-item-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm" data-testid={`cart-item-price-${product.id}`}>
                        ${parseFloat(product.price).toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        data-testid={`decrease-quantity-${product.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="1"
                        data-testid={`quantity-input-${product.id}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        data-testid={`increase-quantity-${product.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold" data-testid={`cart-item-total-${product.id}`}>
                        ${(parseFloat(product.price) * quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(product.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-2"
                        data-testid={`remove-item-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24" data-testid="order-summary">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span data-testid="subtotal">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="total-price">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <Link href="/checkout" className="block w-full">
                  <Button 
                    size="lg" 
                    className="w-full bg-farm-green hover:bg-green-700 text-white"
                    data-testid="checkout-button"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/shop" className="block w-full mt-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    data-testid="continue-shopping-button"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
