import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: 'ok',
          endpoint: '/api/checkout',
          methods: ['GET', 'POST'],
          message: 'POST cart items to create a checkout order.',
        });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { cartItems } = body;

          if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return Response.json({ error: 'Invalid cart items' }, { status: 400 });
          }

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
