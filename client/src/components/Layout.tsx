import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, Search, Home, Package, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/CartProvider";
import logoImage from "@assets/ModernAgro_1754760252152.png";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(true);
  const { items } = useCart();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Container for Announcement Bar + Header */}
      <div className="sticky top-0 z-50">
        {/* Announcement Bar */}
        {showAnnouncementBar && (
          <div className="relative text-center py-3 px-4" style={{ backgroundColor: '#1E391E' }}>
            <p className="text-sm font-medium" style={{ color: '#E0E0E0' }}>
              🎉 Get 5% discount on your first order with coupon <span className="font-bold text-yellow-300">"AGRO5"</span>
            </p>
            <button
              onClick={() => setShowAnnouncementBar(false)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              aria-label="Close announcement"
              data-testid="close-announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="px-4">
            <div className="flex items-center h-16 gap-4">
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="mobile-menu-button"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MA</span>
                </div>
                <span className="hidden sm:block text-lg font-bold text-gray-900">Modern Agro</span>
              </Link>

              {/* Search Bar - Mobile First */}
              <div className="flex-1 max-w-lg mx-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="What can we help you find?"
                    className="pl-10 bg-gray-50 border-0 rounded-full h-10 text-sm"
                    data-testid="search-input"
                  />
                </div>
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" data-testid="cart-button">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium" data-testid="cart-count">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center space-x-8 pb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50" data-testid="mobile-menu">
                <div className="px-4 py-4 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location === item.href
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          <Link 
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 ${
              location === "/" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link 
            href="/shop"
            className={`flex flex-col items-center justify-center space-y-1 ${
              location === "/shop" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs font-medium">Shop</span>
          </Link>
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center -mt-6 shadow-lg border-4 border-white overflow-hidden">
              <img 
                src={logoImage} 
                alt="Modern Agro" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <Link 
            href="/cart"
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              location === "/cart" ? "text-primary" : "text-gray-500"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs font-medium">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link 
            href="/contact"
            className={`flex flex-col items-center justify-center space-y-1 ${
              location === "/contact" ? "text-primary" : "text-gray-500"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1E391E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={logoImage} 
                  alt="Modern Agro Logo" 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-lg font-bold" style={{ color: '#E0E0E0' }}>Modern Agro</span>
              </div>
              <p className="text-sm" style={{ color: '#E0E0E0' }}>Premium duck products from ethical, sustainable farming practices.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#E0E0E0' }}>Quick Links</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#E0E0E0' }}>
                <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Products</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/admin-login" className="hover:text-white transition-colors" data-testid="link-admin-panel">Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#E0E0E0' }}>Products</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#E0E0E0' }}>
                <li><span className="hover:text-white transition-colors cursor-pointer">Duck Eggs</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Duck Meat</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Duck Liver Pâté</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Seasonal Products</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#E0E0E0' }}>Contact Info</h3>
              <ul className="space-y-2 text-sm" style={{ color: '#E0E0E0' }}>
                <li>123 Farm Road</li>
                <li>Countryside Valley, CA 95xxx</li>
                <li>(555) 123-4567</li>
                <li>hello@modernagro.farm</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: '#3A5A3A' }}>
            <p className="text-sm" style={{ color: '#E0E0E0' }}>© 2025 Modern Agro. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="transition-colors hover:text-white" style={{ color: '#E0E0E0' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
