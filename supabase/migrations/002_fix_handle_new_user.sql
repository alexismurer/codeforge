create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  base_username text;
  final_username text;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  final_username := base_username;

  -- Disambiguate if username already taken by another user
  if exists (select 1 from public.users where username = final_username and id != new.id) then
    final_username := base_username || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
  end if;

  insert into public.users (id, username, avatar_url)
  values (new.id, final_username, new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  return new;
end;
$$;
