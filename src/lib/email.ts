import { inr } from "./products";

export interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  total: number;
  paymentMethod: string;
  shippingAddress: string;
}

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

export async function sendCustomerOrderEmail(order: OrderDetails) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping customer email.");
    return;
  }

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (x${item.quantity})</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${inr.format(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
      <h1 style="color: #FF0000;">Order Confirmed!</h1>
      <p>Hi ${order.customerName},</p>
      <p>Thank you for your purchase from KICKOFF Nutrition. We've received your order and are getting it ready.</p>
      
      <h3>Order ID: ${order.id}</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
            <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 8px; font-weight: bold; text-align: right;">Total:</td>
            <td style="padding: 8px; font-weight: bold; text-align: right; color: #FF0000;">${inr.format(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <h4>Shipping Details:</h4>
        <p>${order.shippingAddress}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">If you have any questions, reply to this email or contact our support team.</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "KICKOFF <orders@resend.dev>", // Requires a verified domain in production, using testing domain for now
        to: order.customerEmail,
        subject: "Order Confirmed — KICKOFF Nutrition",
        html: html
      })
    });

    const data = await response.json();
    console.log("CUSTOMER EMAIL STATUS:", data);
  } catch (error) {
    console.error("Failed to send customer email:", error);
  }
}

export async function sendAdminOrderAlert(order: OrderDetails) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping admin email.");
    return;
  }

  const adminEmails = [
    "asraffmohamed33@gmail.com",
    "roshanrapido@gmail.com",
    "kickoffnutrition244@gmail.com"
  ];

  const itemsHtml = order.items.map(item => `
    <li>${item.name} (x${item.quantity}) - ${inr.format(item.price * item.quantity)}</li>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #FF0000;">New Order Received!</h2>
      <p>A new order has been placed on KICKOFF Nutrition.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
        <p><strong>Total:</strong> ${inr.format(order.total)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      </div>

      <h3>Items Ordered:</h3>
      <ul>
        ${itemsHtml}
      </ul>
      
      <a href="https://kickoff.example.com/admin/orders" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #FF0000; color: white; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "KICKOFF Alerts <orders@resend.dev>",
        to: adminEmails,
        subject: `New Order: ${inr.format(order.total)} - ${order.customerName}`,
        html: html
      })
    });

    const data = await response.json();
    console.log("ADMIN EMAIL STATUS:", data);
  } catch (error) {
    console.error("Failed to send admin email alert:", error);
  }
}
