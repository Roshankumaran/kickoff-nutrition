import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { User, MapPin, ClipboardList, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute('/account')({
  component: AccountPage,
});

function AccountPage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
      return;
    }

    if (user) {
      fetchUserMetadata();
    }
  }, [user, isLoading]);

  const fetchUserMetadata = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const meta = supabaseUser.user_metadata;
      setFormData({
        name: meta?.full_name || meta?.name || "",
        phone: meta?.phone || "",
        address_line1: meta?.address_line1 || "",
        address_line2: meta?.address_line2 || "",
        city: meta?.city || "",
        state: meta?.state || "",
        pincode: meta?.pincode || "",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          phone: formData.phone,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }
      });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Account</p>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-none text-black">
              Hey, {formData.name?.split(' ')[0] || user.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium tracking-wide">{user.email}</p>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-50 transition-base"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-black">Personal Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-black">Shipping Address</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Address Line 1</label>
                  <input 
                    type="text" 
                    value={formData.address_line1}
                    onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                    placeholder="Street, house number, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Address Line 2 (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.address_line2}
                    onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">City</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">State</label>
                    <input 
                      type="text" 
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Pincode</label>
                    <input 
                      type="text" 
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-full px-6 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-base text-black font-medium"
                      placeholder="600001"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto px-12 py-5 bg-primary text-primary-foreground rounded-full font-bold tracking-[0.2em] uppercase text-[10px] shadow-glow hover:bg-primary-glow transition-base hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="space-y-8">
            {/* Orders Summary */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl uppercase tracking-wider text-black">Orders</h2>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Your order history will appear here once checkout is live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
