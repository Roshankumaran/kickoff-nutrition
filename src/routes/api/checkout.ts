import { createAPIFileRoute } from '@tanstack/react-start/api';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const APIRoute = createAPIFileRoute('/api/checkout')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { cartItems } = body;

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid cart items' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Securely calculate total amount by fetching real prices from the database
      let totalAmount = 0;

      for (const item of cartItems) {
        if (!item.id || !item.quantity) continue;

        // Fetch the product from Supabase to get the real price
        const { data: product, error } = await supabaseAdmin
          .from('products')
          .select('price')
          .eq('id', item.id)
          .single();

        if (error || !product) {
          console.error(`Error fetching product ${item.id}:`, error);
          return new Response(JSON.stringify({ error: `Product not found: ${item.id}` }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        totalAmount += product.price * item.quantity;
      }

      // TODO: In the future, create a real Razorpay order here using razorpay.orders.create
      const mockOrderId = `order_mock_${Date.now()}`;

      return new Response(
        JSON.stringify({
          order_id: mockOrderId,
          amount: totalAmount,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error processing checkout:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
});
