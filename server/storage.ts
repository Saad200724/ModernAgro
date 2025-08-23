import { db } from "./db";
import { eq, and, desc, like } from "drizzle-orm";
import {
  users,
  products,
  orders,
  orderItems,
  blogPosts,
  contactMessages,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type BlogPost,
  type InsertBlogPost,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Product operations
  getAllProducts(search?: string, category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Order operations
  getAllOrders(): Promise<(Order & { items: OrderItem[] })[]>;
  getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Blog operations
  getAllBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markContactMessageAsRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, `${username}@modernagro.com`));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getAllProducts(search?: string, category?: string): Promise<Product[]> {
    let whereConditions = [eq(products.isActive, true)];

    if (search) {
      whereConditions.push(like(products.name, `%${search}%`));
    }
    if (category && category !== 'All Categories') {
      whereConditions.push(eq(products.category, category));
    }

    return await db.select().from(products)
      .where(and(...whereConditions))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  // Order operations
  async getAllOrders(): Promise<(Order & { items: OrderItem[] })[]> {
    const ordersResult = await db.select().from(orders).orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();

    await db.insert(orderItems).values(
      items.map(item => ({ ...item, orderId: newOrder.id }))
    );

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Blog operations
  async getAllBlogPosts(published = true): Promise<BlogPost[]> {
    const query = published
      ? db.select().from(blogPosts).where(eq(blogPosts.isPublished, true))
      : db.select().from(blogPosts);

    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Contact operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async markContactMessageAsRead(id: number): Promise<void> {
    await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
  }
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<number, Product> = new Map();
  private orders: Map<number, Order & { items: OrderItem[] }> = new Map();
  private blogPosts: Map<number, BlogPost> = new Map();
  private contactMessages: Map<number, ContactMessage> = new Map();
  private nextProductId = 1;
  private nextOrderId = 1;
  private nextBlogPostId = 1;
  private nextContactId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed products from seed_data.sql
    const sampleProducts: Product[] = [
      {
        id: this.nextProductId++,
        name: "Fresh Duck Eggs (Dozen)",
        description: "Premium fresh duck eggs from free-range ducks. Rich in nutrients and perfect for baking or cooking.",
        price: "6.99",
        category: "Eggs",
        imageUrl: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400",
        stock: 50,
        isActive: true,
        nutritionalFacts: "High in protein, vitamin B12, and selenium",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextProductId++,
        name: "Organic Duck Eggs (Half Dozen)",
        description: "Certified organic duck eggs from our pasture-raised ducks. No antibiotics or hormones.",
        price: "4.99",
        category: "Eggs",
        imageUrl: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400",
        stock: 30,
        isActive: true,
        nutritionalFacts: "High in protein, vitamin B12, and selenium",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextProductId++,
        name: "Whole Roasted Duck",
        description: "Premium whole duck, perfectly seasoned and ready to cook. Approximately 4-5 lbs.",
        price: "24.99",
        category: "Meat",
        imageUrl: "https://images.unsplash.com/photo-1544440892-77831c00c452?w=400",
        stock: 15,
        isActive: true,
        nutritionalFacts: "High in protein, iron, and B vitamins",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextProductId++,
        name: "Duck Breast Fillets",
        description: "Premium duck breast fillets, perfect for grilling or pan-searing. Sold in pairs.",
        price: "18.99",
        category: "Meat",
        imageUrl: "https://images.unsplash.com/photo-1544440892-77831c00c452?w=400",
        stock: 25,
        isActive: true,
        nutritionalFacts: "High in protein, iron, and B vitamins",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextProductId++,
        name: "Duck Leg Quarters",
        description: "Tender duck leg quarters, great for braising or slow cooking. Pack of 2.",
        price: "12.99",
        category: "Meat",
        imageUrl: "https://images.unsplash.com/photo-1544440892-77831c00c452?w=400",
        stock: 20,
        isActive: true,
        nutritionalFacts: "High in protein, iron, and B vitamins",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextProductId++,
        name: "Premium Duck Fat",
        description: "Pure rendered duck fat, perfect for roasting potatoes or cooking. 16oz jar.",
        price: "8.99",
        category: "Specialty",
        imageUrl: "https://images.unsplash.com/photo-1556909045-2a2483435c6e?w=400",
        stock: 40,
        isActive: true,
        nutritionalFacts: "Pure duck fat, high in monounsaturated fats",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => this.products.set(product.id, product));

    // Seed blog posts from seed_data.sql
    const sampleBlogPosts: BlogPost[] = [
      {
        id: this.nextBlogPostId++,
        title: "The Benefits of Duck Eggs",
        content: "Duck eggs are a nutritional powerhouse that many people haven't discovered yet. Compared to chicken eggs, duck eggs are larger, richer, and contain more protein and healthy fats. They're also an excellent source of selenium, vitamin B12, and choline. For bakers, duck eggs are a secret weapon - their higher fat content and protein levels create fluffier cakes and more tender pastries. Our free-range ducks produce eggs that are not only delicious but also more sustainable than factory-farmed alternatives.",
        excerpt: "Discover why duck eggs are becoming the preferred choice for health-conscious consumers and professional chefs alike.",
        imageUrl: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600",
        slug: "benefits-of-duck-eggs",
        isPublished: true,
        authorId: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextBlogPostId++,
        title: "Farm-to-Table: Our Sustainable Practices",
        content: "At Modern Agro, sustainability isn't just a buzzword - it's the foundation of everything we do. Our ducks roam freely on our 50-acre farm, eating a natural diet supplemented with locally-sourced grains. We use rotational grazing to keep our pastures healthy and productive, and our waste management system ensures that nothing goes to waste. Duck manure is composted and used to fertilize our fields, creating a closed-loop system that benefits both our animals and the environment. We're proud to be certified organic and committed to practices that will keep our farm productive for generations to come.",
        excerpt: "Learn about our commitment to sustainable farming and how we're working to protect the environment while producing the highest quality products.",
        imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600",
        slug: "sustainable-farming-practices",
        isPublished: true,
        authorId: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleBlogPosts.forEach(post => this.blogPosts.set(post.id, post));
  }

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const [, user] of this.users) {
      if (user.email === `${username}@modernagro.com`) {
        return user;
      }
    }
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || `user_${Date.now()}`;
    const existingUser = this.users.get(id);
    
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: existingUser?.isAdmin || false,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);
    return user;
  }

  // Product operations
  async getAllProducts(search?: string, category?: string): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive);

    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== 'All Categories') {
      products = products.filter(p => p.category === category);
    }

    return products.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const newProduct: Product = {
      id,
      name: product.name,
      description: product.description || null,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl || null,
      stock: product.stock || null,
      isActive: product.isActive || null,
      nutritionalFacts: product.nutritionalFacts || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error(`Product with id ${id} not found`);
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...product,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.isActive = false;
      this.products.set(id, product);
    }
  }

  // Order operations
  async getAllOrders(): Promise<(Order & { items: OrderItem[] })[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOrder(id: number): Promise<(Order & { items: OrderItem[] }) | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.nextOrderId++;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder: Order = {
      id,
      orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail || null,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: order.totalAmount,
      status: order.status || null,
      paymentMethod: order.paymentMethod || null,
      notes: order.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderItems: OrderItem[] = items.map((item, index) => ({
      id: index + 1,
      orderId: id,
      productId: item.productId || null,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.totalPrice,
    }));

    this.orders.set(id, { ...newOrder, items: orderItems });
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const orderWithItems = this.orders.get(id);
    if (!orderWithItems) {
      throw new Error(`Order with id ${id} not found`);
    }

    const updatedOrder: Order = {
      ...orderWithItems,
      status,
      updatedAt: new Date(),
    };

    this.orders.set(id, { ...updatedOrder, items: orderWithItems.items });
    return updatedOrder;
  }

  // Blog operations
  async getAllBlogPosts(published = true): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (published) {
      posts = posts.filter(p => p.isPublished);
    }

    return posts.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    for (const [, post] of this.blogPosts) {
      if (post.slug === slug) {
        return post;
      }
    }
    return undefined;
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.nextBlogPostId++;
    const newPost: BlogPost = {
      id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || null,
      imageUrl: post.imageUrl || null,
      slug: post.slug,
      isPublished: post.isPublished || null,
      authorId: post.authorId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, newPost);
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      throw new Error(`Blog post with id ${id} not found`);
    }

    const updatedPost: BlogPost = {
      ...existingPost,
      ...post,
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  // Contact operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.nextContactId++;
    const newMessage: ContactMessage = {
      id,
      name: message.name,
      email: message.email,
      phone: message.phone || null,
      message: message.message,
      isRead: false,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async markContactMessageAsRead(id: number): Promise<void> {
    const message = this.contactMessages.get(id);
    if (message) {
      message.isRead = true;
      this.contactMessages.set(id, message);
    }
  }
}

export const storage = new MemStorage();