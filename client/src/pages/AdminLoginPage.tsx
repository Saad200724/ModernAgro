import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return await apiRequest("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome Admin!",
        description: "Successfully logged into the admin panel",
      });
      navigate("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Required Fields",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-farm-green/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-farm-green/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-farm-green" />
          </div>
          <h1 className="text-2xl font-bold text-farm-green">Admin Login</h1>
          <p className="text-gray-600 mt-2">
            Enter your credentials to access the Modern Agro admin panel
          </p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loginMutation.isPending}
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={loginMutation.isPending}
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-farm-green hover:bg-farm-green/90"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Admin Panel"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground"
              data-testid="button-back-home"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}