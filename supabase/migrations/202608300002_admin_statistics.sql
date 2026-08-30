-- 管理者へ案件本文を公開せず、必要な集計値だけを返す。
create or replace function public.get_admin_statistics()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  ) then
    raise exception 'administrator role required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'user_count', (select count(*) from public.profiles),
    'application_count', (select count(*) from public.applications),
    'status_counts', (
      select coalesce(jsonb_object_agg(status, count), '{}'::jsonb)
      from (
        select status::text as status, count(*) as count
        from public.applications
        group by status
      ) grouped
    )
  ) into result;
  return result;
end;
$$;

revoke all on function public.get_admin_statistics() from public;
grant execute on function public.get_admin_statistics() to authenticated;
