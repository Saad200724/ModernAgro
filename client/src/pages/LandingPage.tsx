import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

export default function LandingPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.isAdmin) {
      // Redirect to admin dashboard if already authenticated and is admin
      window.location.href = "/admin";
    }
  }, [isAuthenticated, isLoading, user]);

  const handleAdminLogin = async () => {
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel!",
        });
        
        // Force refresh the page to update auth state
        window.location.href = '/admin';
        return;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-4">
          <Card className="shadow-lg" data-testid="admin-login-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-farm-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl text-gray-900" data-testid="admin-login-title">
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6" data-testid="admin-login-description">
                  Access the Modern Agro admin dashboard to manage products, orders, and blog content.
                </p>
                
                {isAuthenticated && !user?.isAdmin && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                      You are logged in but don't have admin privileges. Please contact an administrator.
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={handleAdminLogin}
                  disabled={isLoggingIn}
                  size="lg"
                  className="w-full bg-farm-green hover:bg-green-700 text-white disabled:opacity-50"
                  data-testid="admin-login-button"
                >
                  {isLoggingIn ? "Logging in..." : (isAuthenticated ? "Switch to Admin Account" : "Login as Admin")}
                </Button>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need help? Contact support at{" "}
                  <a href="mailto:admin@modernagro.farm" className="text-farm-green hover:underline">
                    admin@modernagro.farm
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
