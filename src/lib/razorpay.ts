/**
 * Utility to dynamically inject Razorpay SDK script.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

/**
 * Stub to open Razorpay UI. This will eventually take orderId, amount, and callbacks.
 */
export async function initializePayment(options: {
  amount: number;
  orderId: string;
  name: string;
  email: string;
  onSuccess: (response: any) => void;
  onDismiss: () => void;
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Currently unable to load payment gateway. Please check your connection.");
    return false;
  }

  // Placeholder key. Replace securely during integration (e.g. env vars).
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_stub";

  const rzpOptions = {
    key: RAZORPAY_KEY,
    amount: options.amount * 100, // paise
    currency: "INR",
    name: "KICKOFF",
    description: "Premium Gym Supplements",
    order_id: options.orderId, // Should come from backend
    handler: function (response: any) {
      options.onSuccess(response);
    },
    prefill: {
      name: options.name,
      email: options.email,
    },
    theme: {
      color: "#e2ff3d", // Primary brand color
    },
    modal: {
      ondismiss: function () {
        options.onDismiss();
      },
    },
  };

  const paymentObject = new (window as any).Razorpay(rzpOptions);
  paymentObject.on("payment.failed", function (response: any) {
    console.error("Payment Failed", response.error);
    alert(response.error.description);
  });

  paymentObject.open();
  return true;
}
