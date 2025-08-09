import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Edit, 
  Trash2, 
  Plus, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  FileText, 
  Eye,
  Mail,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from "lucide-react";
import type { Product, Order, BlogPost, ContactMessage } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stock: z.number().min(0, "Stock must be non-negative"),
  nutritionalFacts: z.string().optional(),
  isActive: z.boolean().default(true),
});

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  isPublished: z.boolean().default(true),
});

interface StatsData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: string;
  totalBlogPosts: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin-login");
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const productForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      stock: 0,
      nutritionalFacts: "",
      isActive: true,
    },
  });

  const blogForm = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      slug: "",
      isPublished: true,
    },
  });

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    retry: false,
  });

  const { data: blogPosts, isLoading: isLoadingBlogs } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
    retry: false,
  });

  const { data: contactMessages } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact"],
    retry: false,
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: z.infer<typeof productSchema>) => {
      const response = await apiRequest("POST", "/api/admin/products", productData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsProductDialogOpen(false);
      productForm.reset();
      toast({ title: "Product created successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error creating product");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof productSchema>> }) => {
      const response = await apiRequest("PUT", `/api/admin/products/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: "Product updated successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error updating product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error deleting product");
    },
  });

  // Order mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/orders/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error updating order status");
    },
  });

  // Blog mutations
  const createBlogPostMutation = useMutation({
    mutationFn: async (postData: z.infer<typeof blogPostSchema>) => {
      const response = await apiRequest("POST", "/api/admin/blog", postData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsBlogDialogOpen(false);
      blogForm.reset();
      toast({ title: "Blog post created successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error creating blog post");
    },
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof blogPostSchema>> }) => {
      const response = await apiRequest("PUT", `/api/admin/blog/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      setIsBlogDialogOpen(false);
      setEditingBlogPost(null);
      blogForm.reset();
      toast({ title: "Blog post updated successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error updating blog post");
    },
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Blog post deleted successfully!" });
    },
    onError: (error) => {
      handleMutationError(error, "Error deleting blog post");
    },
  });

  // Helper function for error handling
  const handleMutationError = (error: any, title: string) => {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    toast({
      title,
      description: error.message,
      variant: "destructive",
    });
  };

  // Form handlers
  const handleProductSubmit = (data: z.infer<typeof productSchema>) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleBlogSubmit = (data: z.infer<typeof blogPostSchema>) => {
    if (editingBlogPost) {
      updateBlogPostMutation.mutate({ id: editingBlogPost.id, data });
    } else {
      createBlogPostMutation.mutate(data);
    }
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      productForm.reset({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        imageUrl: product.imageUrl || "",
        stock: product.stock || 0,
        nutritionalFacts: product.nutritionalFacts || "",
        isActive: product.isActive ?? true,
      });
    } else {
      setEditingProduct(null);
      productForm.reset();
    }
    setIsProductDialogOpen(true);
  };

  const openBlogDialog = (post?: BlogPost) => {
    if (post) {
      setEditingBlogPost(post);
      blogForm.reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        imageUrl: post.imageUrl || "",
        slug: post.slug,
        isPublished: post.isPublished ?? true,
      });
    } else {
      setEditingBlogPost(null);
      blogForm.reset();
    }
    setIsBlogDialogOpen(true);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4" />;
      case 'shipped':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-farm-green"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" data-testid="admin-dashboard">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="title-admin-dashboard">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your duck farm business</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-farm-green text-white">
              <Users className="h-4 w-4 mr-1" />
              Admin
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="blog" data-testid="tab-blog">
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">
              <Mail className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-revenue">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      `$${stats?.totalRevenue || "0.00"}`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">From all orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-orders">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats?.totalOrders || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">All time orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-products">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats?.totalProducts || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Active products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-blog-posts">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats?.totalBlogPosts || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Published articles</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>${order.totalAmount}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No orders yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openProductDialog()} data-testid="button-add-product">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Fresh Duck Eggs" {...field} data-testid="input-product-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  min="0"
                                  placeholder="9.99" 
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-product-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Premium fresh duck eggs from free-range ducks..." 
                                className="min-h-[100px]"
                                {...field} 
                                data-testid="input-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-product-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Eggs">Eggs</SelectItem>
                                  <SelectItem value="Meat">Meat</SelectItem>
                                  <SelectItem value="Specialty">Specialty</SelectItem>
                                  <SelectItem value="Processed">Processed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="50" 
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-product-stock"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={productForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-product-image" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="nutritionalFacts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nutritional Facts (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Protein: 13g, Fat: 14g, Cholesterol: 619mg..." 
                                {...field} 
                                data-testid="input-product-nutrition"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Product</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Make this product visible to customers
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-product-active"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-4 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsProductDialogOpen(false)}
                          data-testid="button-cancel-product"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          data-testid="button-save-product"
                        >
                          {editingProduct ? "Update Product" : "Create Product"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoadingProducts ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.imageUrl && (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">${product.price}</TableCell>
                          <TableCell>
                            <Badge variant={(product.stock || 0) > 10 ? "default" : (product.stock || 0) > 0 ? "secondary" : "destructive"}>
                              {product.stock || 0} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openProductDialog(product)}
                                data-testid={`button-edit-product-${product.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this product?')) {
                                    deleteProductMutation.mutate(product.id);
                                  }
                                }}
                                disabled={deleteProductMutation.isPending}
                                data-testid={`button-delete-product-${product.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No products yet. Create your first product to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Order Management</h2>
            
            <Card>
              <CardContent className="p-0">
                {isLoadingOrders ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {/* You would need to fetch order items separately or include them in the order response */}
                              Multiple items
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${order.totalAmount}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Select
                              defaultValue={order.status}
                              onValueChange={(status) => 
                                updateOrderStatusMutation.mutate({ id: order.id, status })
                              }
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No orders yet. Orders will appear here once customers start purchasing.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Management */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Blog Management</h2>
              <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openBlogDialog()} data-testid="button-add-blog">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBlogPost ? "Edit Blog Post" : "Create New Blog Post"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...blogForm}>
                    <form onSubmit={blogForm.handleSubmit(handleBlogSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={blogForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="The Benefits of Duck Eggs" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (!editingBlogPost) {
                                      blogForm.setValue("slug", generateSlug(e.target.value));
                                    }
                                  }}
                                  data-testid="input-blog-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={blogForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Slug</FormLabel>
                              <FormControl>
                                <Input placeholder="benefits-of-duck-eggs" {...field} data-testid="input-blog-slug" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={blogForm.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Excerpt (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="A brief summary of your blog post..." 
                                {...field} 
                                data-testid="input-blog-excerpt"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={blogForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Write your blog content here..." 
                                className="min-h-[300px]"
                                {...field} 
                                data-testid="input-blog-content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={blogForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-blog-image" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={blogForm.control}
                        name="isPublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Publish Post</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Make this post visible to visitors
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-blog-published"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-4 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsBlogDialogOpen(false)}
                          data-testid="button-cancel-blog"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createBlogPostMutation.isPending || updateBlogPostMutation.isPending}
                          data-testid="button-save-blog"
                        >
                          {editingBlogPost ? "Update Post" : "Create Post"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoadingBlogs ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts?.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {post.imageUrl && (
                                <img 
                                  src={post.imageUrl} 
                                  alt={post.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium">{post.title}</div>
                                {post.excerpt && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {post.excerpt}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={post.isPublished ? "default" : "secondary"}>
                              {post.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell>
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                data-testid={`button-view-blog-${post.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openBlogDialog(post)}
                                data-testid={`button-edit-blog-${post.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this blog post?')) {
                                    deleteBlogPostMutation.mutate(post.id);
                                  }
                                }}
                                disabled={deleteBlogPostMutation.isPending}
                                data-testid={`button-delete-blog-${post.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No blog posts yet. Create your first post to start sharing content.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-2xl font-bold">Contact Messages</h2>
            
            <Card>
              <CardContent className="p-0">
                {contactMessages ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.name}</TableCell>
                          <TableCell>{message.email}</TableCell>
                          <TableCell>{message.message}</TableCell>
                          <TableCell>
                            {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={(message.isRead ?? false) ? "default" : "secondary"}>
                              {(message.isRead ?? false) ? "Read" : "Unread"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No messages yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}