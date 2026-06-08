import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { inr } from "@/lib/products";
import { createOrder } from "@/lib/apis/orders";
import { toast } from "sonner";
import { User, MapPin, Wallet, Check, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout | KICKOFF" }],
  }),
  component: CheckoutPage,
});

type Step = 1 | 2 | 3 | 4;

type PaymentMethod = "cod" | "upi" | "card" | "netbanking";

interface CheckoutFormData {
  details: {
    fullName: string;
    email: string;
    phone: string;
  };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment: {
    method: PaymentMethod;
    notes: string;
  };
}

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    details: {
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: "",
    },
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
    payment: {
      method: "netbanking",
      notes: "",
    },
  });

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing) {
      navigate({ to: "/" });
    }
  }, [cartItems, navigate, isProcessing]);

  const updateDetails = (field: keyof CheckoutFormData["details"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }));
  };

  const updateAddress = (field: keyof CheckoutFormData["address"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updatePayment = (field: keyof CheckoutFormData["payment"], value: any) => {
    setFormData((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    const payload = {
      user_id: user?.id || null,
      user_email: formData.details.email || user?.email || null,
      customer_name: formData.details.fullName,
      phone: formData.details.phone,
      address_line: `${formData.address.line1} ${formData.address.line2}`.trim(),
      city: formData.address.city,
      state: formData.address.state,
      postal_code: formData.address.pincode,
      country: "India",
      payment_method: formData.payment.method,
      payment_status: formData.payment.method === "cod" ? "pending" : "paid",
      order_status: "processing",
      subtotal: cartTotal,
      shipping: 0,
      total: cartTotal,
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
    };

    if (formData.payment.method === "cod") {
      // Process COD Order
      try {
        toast.loading("Processing order...", { id: "checkout" });
        await createOrder(payload);
        clearCart();
        toast.success("Order placed successfully!", { id: "checkout" });
        navigate({ to: "/order-success" });
      } catch (error) {
        console.error("Order creation failed:", error);
        toast.error("Failed to place order. Please try again.", { id: "checkout" });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Process Online Payment via Razorpay
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey) {
        toast.error("Razorpay Key is missing in environment variables.");
        setIsProcessing(false);
        return;
      }

      try {
        const options = {
          key: razorpayKey,
          amount: cartTotal * 100,
          currency: "INR",
          name: "KICKOFF",
          description: "Gym Supplements Purchase",
          handler: async function (response: any) {
            try {
              toast.loading("Processing order...", { id: "checkout" });
              await createOrder({ ...payload, payment_status: "paid" });
              clearCart();
              toast.success("Order placed successfully!", { id: "checkout" });
              navigate({ to: "/order-success" });
            } catch (error) {
              console.error("Order creation failed:", error);
              toast.error("Failed to save order. Please contact support.", { id: "checkout" });
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
          prefill: {
            email: formData.details.email,
            name: formData.details.fullName,
            contact: formData.details.phone,
          },
          theme: {
            color: "#FF0000", // Kickoff Primary Red
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Razorpay initialization failed:", error);
        toast.error("Could not initialize payment gateway.");
        setIsProcessing(false);
      }
    }
  };

  const steps = [
    { num: 1, title: "DETAILS", icon: User },
    { num: 2, title: "ADDRESS", icon: MapPin },
    { num: 3, title: "PAYMENT", icon: Wallet },
    { num: 4, title: "REVIEW", icon: Check },
  ];

  if (cartItems.length === 0 && !isProcessing) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">Checkout</p>
          <h1 className="text-4xl sm:text-5xl font-display uppercase tracking-tight text-white">
            COMPLETE YOUR ORDER
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Stepper */}
            <div className="flex gap-2 mb-8">
              {steps.map((step) => {
                const isCompleted = currentStep > step.num;
                const isActive = currentStep === step.num;

                return (
                  <div
                    key={step.num}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : isCompleted
                        ? "border-green-500/30 bg-green-500/5 text-green-500"
                        : "border-white/10 text-muted-foreground"
                    }`}
                    onClick={() => {
                      if (step.num < currentStep || isCompleted) setCurrentStep(step.num as Step);
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        isActive
                          ? "bg-primary text-white"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-white/10 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase">{step.title}</span>
                  </div>
                );
              })}
            </div>

            {/* Form Container */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8">
              {/* Step 1: Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-display uppercase tracking-wide">User Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.details.fullName}
                        onChange={(e) => updateDetails("fullName", e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.details.email}
                        onChange={(e) => updateDetails("email", e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.details.phone}
                        onChange={(e) => updateDetails("phone", e.target.value)}
                        placeholder="+91"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={() => navigate({ to: "/cart" })} // Might not have a cart page, so just go back or close sidebar normally. Actually we are already on a new page. Let's just do a generic back.
                      className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-white flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to Shop
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!formData.details.fullName || !formData.details.email || !formData.details.phone}
                      className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary-glow shadow-glow transition-all rounded-full disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-display uppercase tracking-wide">Shipping Address</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="line1" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Address Line 1</Label>
                      <Input
                        id="line1"
                        value={formData.address.line1}
                        onChange={(e) => updateAddress("line1", e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line2" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Address Line 2 (Optional)</Label>
                      <Input
                        id="line2"
                        value={formData.address.line2}
                        onChange={(e) => updateAddress("line2", e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">City</Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) => updateAddress("city", e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">State</Label>
                        <Input
                          id="state"
                          value={formData.address.state}
                          onChange={(e) => updateAddress("state", e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Pincode</Label>
                        <Input
                          id="pincode"
                          value={formData.address.pincode}
                          onChange={(e) => updateAddress("pincode", e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-white flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!formData.address.line1 || !formData.address.city || !formData.address.state || !formData.address.pincode}
                      className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary-glow shadow-glow transition-all rounded-full disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-display uppercase tracking-wide">Payment Method</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                      { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm" },
                      { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                      { id: "netbanking", label: "Net Banking", desc: "All major banks" },
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => updatePayment("method", method.id)}
                        className={`p-4 rounded-lg border cursor-pointer flex items-center gap-4 transition-all ${
                          formData.payment.method === method.id
                            ? "border-primary bg-primary/5"
                            : "border-white/10 hover:border-white/20 bg-background/50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            formData.payment.method === method.id ? "border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {formData.payment.method === method.id && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wider text-sm">{method.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{method.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="notes" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Order Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      value={formData.payment.notes}
                      onChange={(e) => updatePayment("notes", e.target.value)}
                      className="w-full bg-background/50 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-primary/50 transition-colors min-h-[100px]"
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-white flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary-glow shadow-glow transition-all rounded-full"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-display uppercase tracking-wide">Review & Place Order</h2>
                  
                  <div className="space-y-4">
                    {/* Details Summary */}
                    <div className="p-4 rounded-lg border border-white/10 bg-background/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">User Details</span>
                        <button onClick={() => setCurrentStep(1)} className="text-xs font-bold text-primary uppercase tracking-widest">Edit</button>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>{formData.details.fullName}</p>
                        <p className="text-muted-foreground">{formData.details.email}</p>
                        <p className="text-muted-foreground">{formData.details.phone}</p>
                      </div>
                    </div>

                    {/* Address Summary */}
                    <div className="p-4 rounded-lg border border-white/10 bg-background/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Shipping Address</span>
                        <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-primary uppercase tracking-widest">Edit</button>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>{formData.address.line1}</p>
                        {formData.address.line2 && <p>{formData.address.line2}</p>}
                        <p className="text-muted-foreground">{formData.address.city}, {formData.address.state} {formData.address.pincode}</p>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="p-4 rounded-lg border border-white/10 bg-background/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Payment Method</span>
                        <button onClick={() => setCurrentStep(3)} className="text-xs font-bold text-primary uppercase tracking-widest">Edit</button>
                      </div>
                      <div className="text-sm">
                        <p className="uppercase">{formData.payment.method}</p>
                        {formData.payment.notes && (
                          <p className="text-muted-foreground mt-2 text-xs italic">Note: {formData.payment.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={handleBack}
                      className="text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-white flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm hover:bg-primary-glow shadow-glow transition-all rounded-full disabled:opacity-50"
                    >
                      {isProcessing ? "Processing..." : `Place Order — ${inr.format(cartTotal)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-display uppercase tracking-wide border-b border-white/10 pb-4 mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-black/40 rounded shrink-0 overflow-hidden border border-white/5">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold uppercase truncate">{item.product.name}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Qty {item.quantity}</span>
                        <span className="text-sm font-bold">{inr.format(item.product.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{inr.format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-500 font-bold uppercase tracking-wider text-xs">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="font-bold uppercase tracking-wider">Total</span>
                  <span className="text-lg font-bold text-primary">{inr.format(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
