import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeCategory } from '@/lib/products';

export const Route = createFileRoute('/admin/products')({
  component: AdminProducts,
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      console.log("[PRODUCTS] Fetching products...");
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Products fetch error:", error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("DELETE START:", id);
      const { data, error } = await supabase.from('products').delete().eq('id', id).select();
      console.log("DELETE RESULT:", data, error);
      if (error) throw new Error('Failed to delete product: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(error.message);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("SAVE START:", data);
      let imageUrl = data.image;
      
      if (data.imageFile && data.imageFile.size > 0) {
        console.log("UPLOAD START:", data.imageFile.name);
        const file = data.imageFile;
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file, { upsert: true });
          
        if (uploadError) {
          console.error("UPLOAD FAILURE:", uploadError);
          throw new Error("Image upload failed: " + uploadError.message);
        }
        
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
        imageUrl = publicUrl;
        console.log("UPLOAD SUCCESS - URL:", imageUrl);
      }

      const normalizedCategory = normalizeCategory(data.category);
      if (!normalizedCategory) {
        throw new Error("Category cannot be empty");
      }
      console.log("Saving category:", normalizedCategory);

      const isEdit = !!data.id;
      
      const payload: any = {
        name: data.name,
        category: normalizedCategory,
        price: Number(data.price),
        mrp: data.mrp ? Number(data.mrp) : null,
        stock: Number(data.stock),
        image: imageUrl || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
        description: data.description,
        is_active: data.is_active,
        featured: data.featured,
      };

      if (!data.slug && payload.name) {
        // Append a short random string to ensure the slug is always unique
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        payload.slug = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomSuffix}`;
      }

      if (isEdit) {
        console.log("UPDATE START:", payload);
        const { data: updatedData, error } = await supabase.from('products').update(payload).eq('id', data.id).select();
        console.log("UPDATE RESULT:", updatedData, error);
        if (error) throw new Error('Failed to update product: ' + error.message);
        return updatedData[0];
      } else {
        console.log("INSERT START:", payload);
        const { data: newProduct, error } = await supabase.from('products').insert([payload]).select().single();
        console.log("INSERT RESULT:", newProduct, error);
        if (error) {
          console.error("Insert Error:", error);
          throw new Error('Failed to create product: ' + error.message);
        }
        return newProduct;
      }
    },
    onSuccess: () => {
      toast.success('Product saved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast.error(error.message);
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setImagePreview(product.image);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...(editingProduct?.id ? { id: editingProduct.id } : {}),
      name: formData.get('name'),
      category: formData.get('category'),
      price: formData.get('price'),
      mrp: formData.get('mrp'),
      stock: formData.get('stock'),
      imageFile: formData.get('imageFile') as File,
      image: editingProduct?.image,
      description: formData.get('description'),
      is_active: formData.get('is_active') === 'on',
      featured: formData.get('featured') === 'on',
    };
    saveMutation.mutate(data);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-display uppercase tracking-wider">Products</h2>
        <button 
          onClick={() => { setEditingProduct(null); setImagePreview(null); setIsModalOpen(true); }}
          className="bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm px-6 py-3 rounded hover:bg-primary-glow shadow-glow transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading products...</div>
        ) : (products ?? []).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Image</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Product</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Category</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Price</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground">Stock</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(products ?? []).map((product: any) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-black/50 rounded overflow-hidden border border-white/10">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-bold">{product.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="p-4 font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-muted-foreground hover:text-white transition-colors bg-black/40 rounded border border-white/10 hover:border-white/30"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors bg-black/40 rounded border border-white/10 hover:border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-ink border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-2xl font-display uppercase tracking-wider">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</label>
                  <input required name="name" defaultValue={editingProduct?.name} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                  <input required name="category" defaultValue={editingProduct?.category} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
                  <input required type="number" min="0" name="price" defaultValue={editingProduct?.price} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MRP (Optional)</label>
                  <input type="number" min="0" name="mrp" defaultValue={editingProduct?.mrp} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock</label>
                  <input required type="number" min="0" name="stock" defaultValue={editingProduct?.stock ?? 10} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Image</label>
                <input type="file" accept="image/*" name="imageFile" onChange={handleImageChange} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                {imagePreview && (
                   <div className="mt-4 relative w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                     <button 
                       type="button" 
                       onClick={() => setImagePreview(null)}
                       className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-primary transition-colors"
                     >
                       <X className="w-3 h-3" />
                     </button>
                   </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea name="description" rows={3} defaultValue={editingProduct?.description} className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"></textarea>
              </div>

              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_active" defaultChecked={editingProduct ? editingProduct.is_active : true} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" defaultChecked={editingProduct?.featured} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider">Featured</span>
                </label>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-4 shrink-0">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setImagePreview(null); }}
                  className="px-6 py-2 rounded font-bold uppercase tracking-wider text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  className="bg-primary text-primary-foreground font-bold tracking-widest uppercase text-sm px-6 py-2 rounded hover:bg-primary-glow shadow-glow transition-all disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
