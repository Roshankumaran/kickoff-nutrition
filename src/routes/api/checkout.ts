import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { cartItems } = body;

          if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return Response.json({ error: 'Invalid cart items' }, { status: 400 });
          }

          // Securely calculate total amount by fetching real prices from the database
          let totalAmount = 0;

          for (const item of cartItems) {
            if (!item.id || !item.quantity) continue;

            const { data: product, error } = await supabaseAdmin
              .from('products')
              .select('price')
              .eq('id', item.id)
              .single();

            if (error || !product) {
              console.error(`Error fetching product ${item.id}:`, error);
              return Response.json(
                { error: `Product not found: ${item.id}` },
                { status: 404 },
              );
            }

            totalAmount += product.price * item.quantity;
          }

          // TODO: In the future, create a real Razorpay order here using razorpay.orders.create
          const mockOrderId = `order_mock_${Date.now()}`;

          return Response.json({
            order_id: mockOrderId,
            amount: totalAmount,
          });
        } catch (error) {
          console.error('Error processing checkout:', error);
          return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
      },
    },
  },
});
