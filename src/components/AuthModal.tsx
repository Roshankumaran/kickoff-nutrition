import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { useAuth, ADMIN_EMAILS } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { login, signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await login(formData.email, formData.password);
        if (error) throw error;
        toast.success("Successfully signed in");
        onOpenChange(false);
        if (data?.user?.email && ADMIN_EMAILS.includes(data.user.email)) {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/account' });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) throw error;
        toast.success("Account created successfully. You can now log in.");
        setIsLogin(true); // Switch to login view after signup
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await loginWithGoogle();
      if (error) throw error;
      // Note: The redirect will happen automatically via Supabase
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-white/10 rounded-2xl p-6 sm:p-8 text-black">
        <DialogHeader className="mb-6 space-y-1">
          <p className="text-primary font-bold tracking-widest uppercase text-xs mb-1">
            {isLogin ? "WELCOME BACK" : "JOIN THE CLUB"}
          </p>
          <DialogTitle className="font-display text-4xl uppercase tracking-tight text-black m-0 p-0 leading-none">
            {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm mt-2">
            {isLogin
              ? "Welcome back. Sign in to continue."
              : "Sign up to track orders and checkout faster."}
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-full text-sm font-bold tracking-widest uppercase text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-gray-500 font-bold tracking-widest uppercase">
              OR
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-widest uppercase text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required={!isLogin}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-black"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-black"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-widest uppercase text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-black pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-4 bg-[#E60000] text-white rounded-full font-bold tracking-widest uppercase text-sm hover:bg-[#CC0000] shadow-[0_4px_14px_0_rgba(230,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(230,0,0,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "New to KICKOFF? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#E60000] hover:underline font-bold tracking-wide"
          >
            {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
