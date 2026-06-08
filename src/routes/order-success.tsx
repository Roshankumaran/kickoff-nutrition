import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full animate-pulse" />
            <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
          </div>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight">
          Order Confirmed
        </h1>
        
        <p className="text-muted-foreground text-lg">
          Thank you for your purchase. Your order has been placed successfully and is being processed.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-8">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
            What happens next?
          </p>
          <p className="text-sm">
            We will send you a confirmation email with your order details and tracking information once your package has shipped.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/account"
            className="px-8 py-3 bg-white/10 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/20 transition-all rounded-full flex-1 sm:flex-none inline-flex items-center justify-center"
          >
            View Order
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary-glow shadow-glow transition-all rounded-full flex-1 sm:flex-none inline-flex items-center justify-center"
          >
            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
