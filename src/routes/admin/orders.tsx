import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllOrders, updateOrderStatus, Order } from "@/lib/apis/orders";
import { toast } from "sonner";
import { inr } from "@/lib/products";

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAllOrders,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, type, status }: { id: string, type: 'order_status' | 'payment_status', status: string }) => 
      updateOrderStatus(id, type, status),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    }
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-display uppercase tracking-wider">Orders</h2>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
        ) : orders?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Order ID / Date</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Customer</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Items</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Payment</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Order Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order: Order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm">
                        <div className="font-mono text-xs">{order.id.split('-')[0]}...</div>
                        <div className="text-muted-foreground text-xs mt-1">{new Date(order.created_at).toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-bold">{order.customer_name}</div>
                        <div className="text-muted-foreground text-xs">{order.user_email}</div>
                        <div className="text-muted-foreground text-xs">{order.phone}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {items.length} items
                        <span className="block text-xs opacity-50 truncate max-w-[200px]">
                          {items.map((p: any) => `${p.quantity}x ${p.name}`).join(', ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="uppercase text-xs font-bold mb-1">{order.payment_method}</div>
                        <select
                          value={order.payment_status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order.id, type: 'payment_status', status: e.target.value })}
                          className={`text-xs font-bold uppercase tracking-wider rounded px-2 py-1 bg-background border border-white/10 outline-none ${
                            order.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order.id, type: 'order_status', status: e.target.value })}
                          className={`text-xs font-bold uppercase tracking-wider rounded px-2 py-1 bg-background border border-white/10 outline-none ${
                            order.order_status === 'delivered' ? 'text-green-500' :
                            order.order_status === 'cancelled' ? 'text-red-500' :
                            'text-blue-500'
                          }`}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-bold text-primary">{inr.format(order.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
