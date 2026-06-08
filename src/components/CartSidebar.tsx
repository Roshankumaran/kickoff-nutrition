import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { inr } from "@/lib/products";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
export function CartSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    onOpenChange(false);
    navigate({ to: "/checkout" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full right-0 bg-background border-l border-white/10 p-0 sm:p-0">
        <SheetHeader className="p-6 border-b border-white/5 space-y-0 flex-row items-center justify-between sticky top-0 bg-background z-10">
          <SheetTitle className="text-xl font-display uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart ({itemCount})
          </SheetTitle>
          {cartItems.length > 0 && (
            <button 
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is empty.</p>
              <button
                onClick={() => onOpenChange(false)}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-4 border border-white/5 rounded-lg bg-white/5">
                <div className="w-20 h-24 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden border border-white/5">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold uppercase tracking-wide text-sm">{item.product.name}</h4>
                    <p className="text-primary font-bold mt-1">{inr.format(item.product.price || 0)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-black/40 rounded px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="hover:text-primary transition-colors p-1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="hover:text-primary transition-colors p-1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-400 p-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-background sticky bottom-0 z-10 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{inr.format(cartTotal)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary-glow shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
