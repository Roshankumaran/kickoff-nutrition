-- Enable RLS on products if not already enabled
alter table public.products enable row level security;

-- Drop existing policies if they exist to prevent errors (optional but safer for re-runs)
drop policy if exists "Enable read access for all users" on public.products;
drop policy if exists "Enable insert for authenticated users" on public.products;
drop policy if exists "Enable update for authenticated users" on public.products;
drop policy if exists "Enable delete for authenticated users" on public.products;

-- Create policies for products
create policy "Enable read access for all users"
  on public.products for select
  using (true);

create policy "Enable insert for authenticated users"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Enable update for authenticated users"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Enable delete for authenticated users"
  on public.products for delete
  to authenticated
  using (true);

-- Ensure the products storage bucket policies are set
-- Note: Assuming the bucket 'products' exists as requested
-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Authenticated users can update" on storage.objects;
drop policy if exists "Authenticated users can delete" on storage.objects;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'products' );

create policy "Authenticated users can update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'products' );

create policy "Authenticated users can delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'products' );
