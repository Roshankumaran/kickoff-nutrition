import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.isAdmin) {
        navigate({ to: '/' });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink text-white">
      <AdminSidebar />
      <div className="flex-1 bg-ink">
        <Outlet />
      </div>
    </div>
  );
}
