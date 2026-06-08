import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="w-64 bg-black border-r border-white/10 flex flex-col min-h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-3xl font-display text-primary tracking-widest uppercase">
          KICKOFF<span className="text-white">_ADMIN</span>
        </h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== "/admin" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-bold uppercase tracking-wider text-sm text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
