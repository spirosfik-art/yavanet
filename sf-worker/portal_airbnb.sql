-- Airbnb monthly partner commission (portal.sfproperties.gr)
-- airbnb_commissions: what partners may see (amount + paid), own rows only.
-- airbnb_commission_calc: figures read from the PDF, admin only.
-- uuid / case
    when v_prop.manager ilike 'άσι%' or v_prop.manager ilike 'άση%' or v_prop.manager ilike 'asi%' then 'asi'
    when v_prop.manager ilike '%yaron%' or v_prop.manager ilike 'γιάρον%' or v_prop.manager ilike 'γιαρον%' then 'yaron'
    when v_prop.manager ilike 'ziv%' or v_prop.manager ilike 'ζιβ%' then 'commission'
    else null end are filled in after inspecting airbnb_properties.

alter table public.airbnb_properties
  add column if not exists comm_base text not null default 'net'
  check (comm_base in ('net','net_minus_cleaning'));

create table if not exists public.airbnb_commissions (
  doc_id      uuid primary key references public.airbnb_docs(id) on delete cascade,
  airbnb_id   uuid not null references public.airbnb_properties(id) on delete cascade,
  handler     text,
  period      date,
  pct         numeric,
  amount      numeric(12,2),
  paid        boolean not null default false,
  paid_at     timestamptz,
  updated_at  timestamptz not null default now()
);
create table if not exists public.airbnb_commission_calc (
  doc_id       uuid primary key references public.airbnb_docs(id) on delete cascade,
  net_payout   numeric(12,2),
  cleaning_fee numeric(12,2),
  base         numeric(12,2),
  source       text not null default 'pdf',   -- pdf | manual | unread
  raw          jsonb,
  updated_at   timestamptz not null default now()
);
create index if not exists airbnb_commissions_period on public.airbnb_commissions(period, handler);

alter table public.airbnb_commissions enable row level security;
alter table public.airbnb_commission_calc enable row level security;

drop policy if exists "admin full access" on public.airbnb_commissions;
create policy "admin full access" on public.airbnb_commissions for all to authenticated
  using (((auth.jwt()->'app_metadata')->>'role')='admin')
  with check (((auth.jwt()->'app_metadata')->>'role')='admin');
drop policy if exists "partner reads own" on public.airbnb_commissions;
create policy "partner reads own" on public.airbnb_commissions for select to authenticated
  using (handler is not null and handler = ((auth.jwt()->'app_metadata')->>'handler'));

drop policy if exists "admin full access" on public.airbnb_commission_calc;
create policy "admin full access" on public.airbnb_commission_calc for all to authenticated
  using (((auth.jwt()->'app_metadata')->>'role')='admin')
  with check (((auth.jwt()->'app_metadata')->>'role')='admin');

grant select, insert, update, delete on public.airbnb_commissions to authenticated;
grant select, insert, update, delete on public.airbnb_commission_calc to authenticated;

-- One entry point that computes the commission in the database.
-- Admin: may always (re)set. Partner: only a first reading of a file of their
-- own property, never overwrites, never touches "paid".
create or replace function public.sf_airbnb_comm_set(
  p_doc uuid, p_period date, p_net numeric, p_clean numeric, p_source text, p_raw jsonb
) returns public.airbnb_commissions
language plpgsql security definer set search_path = public as $$
declare
  v_admin boolean := ((auth.jwt()->'app_metadata')->>'role') = 'admin';
  v_me    text    := (auth.jwt()->'app_metadata')->>'handler';
  v_doc   public.airbnb_docs;
  v_prop  public.airbnb_properties;
  v_hand  text;
  v_pct   numeric;
  v_base  numeric;
  v_amt   numeric;
  v_row   public.airbnb_commissions;
begin
  select * into v_doc from public.airbnb_docs where id = p_doc;
  if not found then raise exception 'doc not found'; end if;
  select * into v_prop from public.airbnb_properties where id = v_doc.airbnb_id;
  v_hand := case
    when v_prop.manager ilike 'άσι%' or v_prop.manager ilike 'άση%' or v_prop.manager ilike 'asi%' then 'asi'
    when v_prop.manager ilike '%yaron%' or v_prop.manager ilike 'γιάρον%' or v_prop.manager ilike 'γιαρον%' then 'yaron'
    when v_prop.manager ilike 'ziv%' or v_prop.manager ilike 'ζιβ%' then 'commission'
    else null end;
  if not v_admin then
    if v_me is null or v_hand is distinct from v_me then raise exception 'not allowed'; end if;
    if p_source = 'manual' then raise exception 'not allowed'; end if;
    if exists (select 1 from public.airbnb_commissions where doc_id = p_doc and amount is not null) then
      select * into v_row from public.airbnb_commissions where doc_id = p_doc;
      return v_row;
    end if;
  end if;
  v_pct := v_prop.manager_fee_pct;
  if p_net is not null then
    v_base := case when v_prop.comm_base = 'net_minus_cleaning' then p_net - coalesce(p_clean,0) else p_net end;
    v_amt  := round(v_base * v_pct / 100.0, 2);
  end if;
  insert into public.airbnb_commission_calc as c (doc_id, net_payout, cleaning_fee, base, source, raw, updated_at)
    values (p_doc, p_net, p_clean, v_base, coalesce(p_source,'pdf'), p_raw, now())
    on conflict (doc_id) do update set net_payout = excluded.net_payout, cleaning_fee = excluded.cleaning_fee,
      base = excluded.base, source = excluded.source, raw = coalesce(excluded.raw, c.raw), updated_at = now();
  insert into public.airbnb_commissions as c (doc_id, airbnb_id, handler, period, pct, amount, updated_at)
    values (p_doc, v_doc.airbnb_id, v_hand, p_period, v_pct, v_amt, now())
    on conflict (doc_id) do update set handler = excluded.handler, period = excluded.period,
      pct = excluded.pct, amount = excluded.amount, updated_at = now()
    returning * into v_row;
  return v_row;
end $$;
revoke all on function public.sf_airbnb_comm_set(uuid, date, numeric, numeric, text, jsonb) from public, anon;
grant execute on function public.sf_airbnb_comm_set(uuid, date, numeric, numeric, text, jsonb) to authenticated;

update public.airbnb_properties set comm_base = 'net_minus_cleaning' where name ilike '%Βλαχογιάννη%' or name ilike '%Vlachogianni%';
