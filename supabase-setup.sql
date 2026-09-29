-- Run once in Supabase SQL Editor. The bucket stays private.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('future-me-private', 'future-me-private', false, 104857600, null)
on conflict (id) do update set public = false, file_size_limit = 104857600;

drop policy if exists "future_me_select_own" on storage.objects;
create policy "future_me_select_own"
on storage.objects for select to authenticated
using (bucket_id = 'future-me-private' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "future_me_insert_own" on storage.objects;
create policy "future_me_insert_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'future-me-private' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "future_me_update_own" on storage.objects;
create policy "future_me_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'future-me-private' and (storage.foldername(name))[1] = (select auth.uid()::text))
with check (bucket_id = 'future-me-private' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "future_me_delete_own" on storage.objects;
create policy "future_me_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'future-me-private' and (storage.foldername(name))[1] = (select auth.uid()::text));
