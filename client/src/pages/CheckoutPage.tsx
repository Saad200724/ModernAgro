import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  customerAddress: z.string().min(10, "Please enter a complete address"),
  paymentMethod: z.string().default("cash_on_delivery"),
  notes: z.string().optional(),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      paymentMethod: "cash_on_delivery",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CheckoutData) => {
      const order = {
        ...orderData,
        totalAmount: getTotalPrice().toString(),
      };

      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        pricePerUnit: item.product.price,
        totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
      }));

      const response = await apiRequest("POST", "/api/orders", { order, items: orderItems });
      return await response.json();
    },
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setOrderComplete(true);
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.orderNumber} has been received.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutData) => {
    createOrderMutation.mutate(data);
  };

  if (items.length === 0 && !orderComplete) {
    setLocation("/cart");
    return null;
  }

  if (orderComplete) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card data-testid="order-confirmation">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl text-gray-900">Order Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Thank you for your order. We've received your order and will contact you soon to arrange delivery.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900" data-testid="order-number">
                  Order Number: {orderNumber}
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={() => setLocation("/shop")} 
                  className="w-full bg-farm-green hover:bg-green-700 text-white"
                  data-testid="continue-shopping-final"
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={() => setLocation("/")} 
                  variant="outline" 
                  className="w-full"
                  data-testid="back-to-home"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="checkout-title">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <Card data-testid="checkout-form">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} data-testid="customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} data-testid="customer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} data-testid="customer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your complete address including city and zip code" 
                            className="min-h-24"
                            {...field} 
                            data-testid="customer-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="payment-method">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special instructions or notes for your order"
                            {...field} 
                            data-testid="order-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-farm-green hover:bg-green-700 text-white"
                    disabled={createOrderMutation.isPending}
                    data-testid="place-order-button"
                  >
                    {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="h-fit sticky top-24" data-testid="checkout-summary">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-center" data-testid={`summary-item-${product.id}`}>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {quantity}</p>
                    </div>
                    <span className="font-medium">${(parseFloat(product.price) * quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <hr />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span data-testid="checkout-subtotal">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="checkout-total">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
