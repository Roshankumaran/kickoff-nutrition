import { supabase } from "@/integrations/supabase/client";
import { sendCustomerOrderEmail, sendAdminOrderAlert, OrderDetails } from "@/lib/email";

export interface Order {
  id: string;
  user_id: string | null;
  user_email: string | null;
  customer_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: any;
  created_at: string;
}

export async function createOrder(payload: Partial<Order>): Promise<Order> {
  console.log("ORDER PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select()
    .single();

  console.log("ORDER INSERT:", data, error);

  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  const order = data as Order;

  // Trigger emails asynchronously
  const orderDetails: OrderDetails = {
    id: order.id,
    customerName: order.customer_name,
    customerEmail: order.user_email || "",
    items: order.items,
    total: order.total,
    paymentMethod: order.payment_method,
    shippingAddress: `${order.address_line}, ${order.city}, ${order.state} ${order.postal_code}`
  };

  // Don't await emails to avoid blocking checkout success
  sendCustomerOrderEmail(orderDetails).catch(console.error);
  sendAdminOrderAlert(orderDetails).catch(console.error);

  return order;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(orderId: string, statusType: 'order_status' | 'payment_status', status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ [statusType]: status })
    .eq("id", orderId);

  if (error) throw error;
}
