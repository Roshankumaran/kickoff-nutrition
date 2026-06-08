import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, IndianRupee, Clock } from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      console.log("DASHBOARD PRODUCTS FETCH EXECUTION");
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error("Dashboard products fetch error:", error);
        throw error;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      console.log("DASHBOARD ORDERS FETCH EXECUTION");
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error("Dashboard orders fetch error:", error);
        throw error;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const isLoading = productsLoading || ordersLoading;

  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const revenue = orders?.reduce((acc: number, order: any) => acc + (order.total_amount || 0), 0) || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'pending').length || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  const cards = [
    { title: 'Total Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-500' },
    { title: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Total Products', value: totalProducts, icon: Package, color: 'text-primary' },
    { title: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-yellow-500' },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-4xl font-display uppercase tracking-wider mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4 shadow-card hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground font-bold tracking-wider uppercase text-sm">{card.title}</h3>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-4xl font-display tracking-widest">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-display uppercase tracking-wider">Recent Orders</h3>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Order ID</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Date</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="p-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-primary">₹{order.total_amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
