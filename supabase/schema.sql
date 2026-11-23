-- Banco do site da Dancold: pedidos de orçamento, rastreio de visitas, blog e painel.
-- Pode rodar de novo sem medo: tudo aqui é idempotente.

create schema if not exists private;

-- ── Quem entra no painel ─────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "admin se enxerga" on public.admins;
create policy "admin se enxerga" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ── Pedidos de orçamento ─────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  message text not null,
  segment text,
  lang text,
  page text,
  gclid text,
  utm jsonb not null default '{}'::jsonb,
  status text not null default 'novo'
);

alter table public.leads add column if not exists visitor_id text;
alter table public.leads add column if not exists session_id text;
alter table public.leads add column if not exists source text;
alter table public.leads add column if not exists city text;
alter table public.leads add column if not exists region text;
alter table public.leads add column if not exists notes text not null default '';
alter table public.leads add column if not exists updated_at timestamptz not null default now();

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('novo', 'em_contato', 'ganho', 'perdido'));
alter table public.leads drop constraint if exists leads_tamanho_check;
alter table public.leads add constraint leads_tamanho_check check (
  length(name) <= 120 and length(email) <= 160 and length(phone) <= 30
  and length(company) <= 160 and length(message) <= 3000
  and length(coalesce(page, '')) <= 300 and length(coalesce(gclid, '')) <= 200
  and length(coalesce(visitor_id, '')) <= 40 and length(coalesce(session_id, '')) <= 40
  and length(notes) <= 4000 and pg_column_size(utm) <= 2000
);

-- quando a situação mudou pela última vez (data do "fechado" na conversão do Google Ads)
alter table public.leads add column if not exists status_at timestamptz;

create or replace function private.leads_status_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists leads_status_at on public.leads;
create trigger leads_status_at before update on public.leads
  for each row execute function private.leads_status_at();

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_visitor_idx on public.leads (visitor_id);

alter table public.leads enable row level security;

-- O site só insere. Quem lê e muda é o admin logado.
drop policy if exists "site insere lead" on public.leads;
create policy "site insere lead" on public.leads
  for insert to anon, authenticated
  with check (status = 'novo' and notes = '');

drop policy if exists "admin le lead" on public.leads;
create policy "admin le lead" on public.leads
  for select to authenticated using ((select private.is_admin()));

drop policy if exists "admin muda lead" on public.leads;
create policy "admin muda lead" on public.leads
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "admin apaga lead" on public.leads;
create policy "admin apaga lead" on public.leads
  for delete to authenticated using ((select private.is_admin()));

-- ── Rastreio: o que cada visitante fez em cada página ────────────────
-- Sem IP e sem dado pessoal: o visitante é um código aleatório do navegador.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null,
  session_id text not null,
  type text not null,
  path text not null,
  lang text,
  label text,
  href text,
  seconds integer,
  scroll smallint,
  source text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  device text,
  country text,
  region text,
  city text,
  constraint events_type_check check (
    type in ('pageview', 'page_exit', 'click', 'form_view', 'form_start', 'form_submit', 'video_play')
  ),
  constraint events_tamanho_check check (
    length(visitor_id) <= 40 and length(session_id) <= 40 and length(path) <= 300
    and length(coalesce(label, '')) <= 120 and length(coalesce(href, '')) <= 300
    and length(coalesce(source, '')) <= 60 and length(coalesce(referrer, '')) <= 200
    and length(coalesce(utm_source, '')) <= 120 and length(coalesce(utm_medium, '')) <= 120
    and length(coalesce(utm_campaign, '')) <= 160 and length(coalesce(utm_term, '')) <= 160
    and length(coalesce(utm_content, '')) <= 160 and length(coalesce(gclid, '')) <= 200
    and length(coalesce(device, '')) <= 20 and length(coalesce(country, '')) <= 60
    and length(coalesce(region, '')) <= 60 and length(coalesce(city, '')) <= 80
    and coalesce(seconds, 0) between 0 and 86400 and coalesce(scroll, 0) between 0 and 100
  )
);

-- "viu o formulário" entrou depois: o check é refeito para bancos que já existiam
alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check check (
  type in ('pageview', 'page_exit', 'click', 'form_view', 'form_start', 'form_submit', 'video_play')
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_visitor_idx on public.events (visitor_id, created_at);
create index if not exists events_session_idx on public.events (session_id);

alter table public.events enable row level security;

drop policy if exists "site insere evento" on public.events;
create policy "site insere evento" on public.events
  for insert to anon, authenticated with check (true);

drop policy if exists "admin le evento" on public.events;
create policy "admin le evento" on public.events
  for select to authenticated using ((select private.is_admin()));

drop policy if exists "admin apaga evento" on public.events;
create policy "admin apaga evento" on public.events
  for delete to authenticated using ((select private.is_admin()));

-- ── Blog ─────────────────────────────────────────────────────────────
-- title/excerpt: {"pt": "...", "en": "...", "es": "..."}
-- body: {"pt": [blocos], "en": [...], "es": [...]} (Portable Text, igual ao Sanity)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  status text not null default 'rascunho',
  published_at timestamptz not null default now(),
  title jsonb not null default '{}'::jsonb,
  excerpt jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  cover_url text,
  cover_alt text,
  cover_width integer,
  cover_height integer,
  sanity_id text unique,
  constraint posts_status_check check (status in ('rascunho', 'publicado')),
  constraint posts_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120)
);

create index if not exists posts_published_idx on public.posts (published_at desc);

alter table public.posts enable row level security;

drop policy if exists "todos leem post publicado" on public.posts;
create policy "todos leem post publicado" on public.posts
  for select to anon, authenticated
  using (status = 'publicado' and published_at <= now());

drop policy if exists "admin le post" on public.posts;
create policy "admin le post" on public.posts
  for select to authenticated using ((select private.is_admin()));

drop policy if exists "admin cria post" on public.posts;
create policy "admin cria post" on public.posts
  for insert to authenticated with check ((select private.is_admin()));

drop policy if exists "admin muda post" on public.posts;
create policy "admin muda post" on public.posts
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "admin apaga post" on public.posts;
create policy "admin apaga post" on public.posts
  for delete to authenticated using ((select private.is_admin()));

-- Imagens do blog: leitura pública pelo endereço, escrita só do admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog', 'blog', true, 8388608, array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin envia imagem do blog" on storage.objects;
create policy "admin envia imagem do blog" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog' and (select private.is_admin()));

drop policy if exists "admin troca imagem do blog" on storage.objects;
create policy "admin troca imagem do blog" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog' and (select private.is_admin()))
  with check (bucket_id = 'blog' and (select private.is_admin()));

drop policy if exists "admin apaga imagem do blog" on storage.objects;
create policy "admin apaga imagem do blog" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog' and (select private.is_admin()));
-- ── Números do painel ────────────────────────────────────────────────
-- Roda com a permissão de quem chama: sem ser admin, volta tudo zerado.
-- Pedido conta pela origem e campanha gravadas nele, igual à lista de Pedidos,
-- para o número da visão geral bater com a lista filtrada.
create or replace function public.dash_overview(p_from timestamptz, p_to timestamptz)
returns jsonb
language sql
stable
set search_path = ''
as $$
with ev as (
  select * from public.events where created_at >= p_from and created_at < p_to
),
ld as (
  select l.*, coalesce(l.source, 'Direto') as src, l.utm ->> 'utm_campaign' as campaign
  from public.leads l where created_at >= p_from and created_at < p_to
),
sess as (
  select
    session_id,
    min(visitor_id) as visitor_id,
    coalesce((array_agg(source order by created_at) filter (where source is not null))[1], 'Direto') as source,
    (array_agg(utm_campaign order by created_at) filter (where utm_campaign is not null))[1] as campaign,
    coalesce((array_agg(device order by created_at) filter (where device is not null))[1], 'desconhecido') as device,
    (array_agg(city order by created_at) filter (where city is not null))[1] as city,
    (array_agg(region order by created_at) filter (where region is not null))[1] as region,
    count(*) filter (where type = 'pageview') as pageviews,
    coalesce(sum(seconds) filter (where type = 'page_exit'), 0) as seconds
  from ev
  group by session_id
),
days as (
  select d::date as day
  from generate_series(
    (p_from at time zone 'America/Sao_Paulo')::date,
    ((p_to - interval '1 second') at time zone 'America/Sao_Paulo')::date,
    interval '1 day'
  ) as d
),
day_ev as (
  select (created_at at time zone 'America/Sao_Paulo')::date as day,
         count(distinct visitor_id) as visitors,
         count(*) filter (where type = 'pageview') as pageviews
  from ev group by 1
),
day_ld as (
  select (created_at at time zone 'America/Sao_Paulo')::date as day, count(*) as leads
  from ld group by 1
),
pages as (
  select
    path,
    count(*) filter (where type = 'pageview') as views,
    count(distinct visitor_id) filter (where type = 'pageview') as visitors,
    coalesce(round(avg(seconds) filter (where type = 'page_exit')), 0) as avg_seconds,
    coalesce(round(avg(scroll) filter (where type = 'page_exit')), 0) as avg_scroll,
    count(*) filter (where type = 'click') as clicks
  from ev
  group by path
),
page_leads as (
  select page as path, count(*) as leads from ld where page is not null group by page
),
src_sess as (
  select source, count(*) as sessions, count(distinct visitor_id) as visitors from sess group by source
),
src_ld as (
  select src as source, count(*) as leads from ld group by src
),
sources as (
  select source,
         coalesce(s.sessions, 0) as sessions,
         coalesce(s.visitors, 0) as visitors,
         coalesce(l.leads, 0) as leads
  from src_sess s full join src_ld l using (source)
),
camp_sess as (
  select campaign, count(*) as sessions, mode() within group (order by source) as source
  from sess where campaign is not null group by campaign
),
camp_ld as (
  select campaign,
         count(*) as leads,
         count(*) filter (where status = 'ganho') as won,
         mode() within group (order by src) as source
  from ld where campaign is not null group by campaign
),
campaigns as (
  select campaign,
         coalesce(s.source, l.source) as source,
         coalesce(s.sessions, 0) as sessions,
         coalesce(l.leads, 0) as leads,
         coalesce(l.won, 0) as won
  from camp_sess s full join camp_ld l using (campaign)
),
clicks as (
  select coalesce(label, href, 'sem nome') as label, count(*) as total, count(distinct visitor_id) as visitors
  from ev where type = 'click'
  group by 1
),
seg as (
  select substring(path from '^/(?:pt|en|es)/segmentos/([a-z0-9-]+)/?$') as slug, type, session_id
  from ev
  where path ~ '^/(pt|en|es)/segmentos/[a-z0-9-]+/?$'
),
segments as (
  select slug,
         count(distinct session_id) filter (where type = 'pageview') as viewed,
         count(distinct session_id) filter (where type = 'form_view') as saw_form,
         count(distinct session_id) filter (where type = 'form_start') as started,
         count(distinct session_id) filter (where type = 'form_submit') as sent
  from seg group by slug
)
select jsonb_build_object(
  'totals', jsonb_build_object(
    'visitors', (select count(distinct visitor_id) from ev),
    'sessions', (select count(*) from sess),
    'pageviews', (select count(*) from ev where type = 'pageview'),
    'leads', (select count(*) from ld),
    'avg_seconds', (select coalesce(round(avg(seconds)), 0) from sess where seconds > 0),
    'form_starts', (select count(distinct session_id) from ev where type = 'form_start'),
    'form_submits', (select count(distinct session_id) from ev where type = 'form_submit'),
    'whatsapp_clicks', (select count(*) from ev where type = 'click' and href like '%wa.me%'),
    'video_plays', (select count(*) from ev where type = 'video_play')
  ),
  'days', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day', d.day,
      'visitors', coalesce(e.visitors, 0),
      'pageviews', coalesce(e.pageviews, 0),
      'leads', coalesce(l.leads, 0)
    ) order by d.day), '[]'::jsonb)
    from days d left join day_ev e using (day) left join day_ld l using (day)
  ),
  'pages', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.views desc), '[]'::jsonb)
    from (
      select p.*, coalesce(pl.leads, 0) as leads
      from pages p left join page_leads pl using (path)
      where p.views > 0
      order by p.views desc limit 15
    ) t
  ),
  'sources', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.sessions desc, t.leads desc), '[]'::jsonb)
    from (select * from sources order by sessions desc, leads desc limit 10) t
  ),
  'campaigns', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.sessions desc, t.leads desc, t.campaign), '[]'::jsonb)
    from (select * from campaigns order by sessions desc, leads desc, campaign limit 20) t
  ),
  'devices', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.sessions desc), '[]'::jsonb)
    from (select device, count(*) as sessions from sess group by device) t
  ),
  'cities', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.visitors desc), '[]'::jsonb)
    from (
      select city, region, count(distinct visitor_id) as visitors
      from sess where city is not null
      group by city, region order by 3 desc limit 8
    ) t
  ),
  'clicks', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.total desc), '[]'::jsonb)
    from (select * from clicks order by total desc limit 10) t
  ),
  'segments', (
    select coalesce(jsonb_agg(to_jsonb(t) order by t.viewed desc, t.slug), '[]'::jsonb)
    from segments t
  )
);
$$;

-- Lista de visitantes do período, um por linha, com o que virou pedido.
-- Filtros opcionais: o visitante entra se teve alguma visita que bate com todos.
drop function if exists public.dash_visitors(timestamptz, timestamptz, integer);
create or replace function public.dash_visitors(
  p_from timestamptz,
  p_to timestamptz,
  p_source text default null,
  p_campaign text default null,
  p_path text default null,
  p_city text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  visitor_id text,
  first_seen timestamptz,
  last_seen timestamptz,
  sessions bigint,
  pageviews bigint,
  seconds bigint,
  source text,
  campaign text,
  device text,
  city text,
  region text,
  landing text,
  lead_id uuid,
  lead_name text,
  lead_company text,
  total bigint
)
language sql
stable
set search_path = ''
as $$
  with chosen as (
    select distinct e.visitor_id
    from public.events e
    where e.created_at >= p_from and e.created_at < p_to
      and (p_source is null or e.source = p_source)
      and (p_campaign is null or e.utm_campaign = p_campaign)
      and (p_city is null or e.city = p_city)
      and (p_path is null or (e.type = 'pageview' and e.path = p_path))
  ),
  v as (
    select
      e.visitor_id,
      min(e.created_at) as first_seen,
      max(e.created_at) as last_seen,
      count(distinct e.session_id) as sessions,
      count(*) filter (where e.type = 'pageview') as pageviews,
      coalesce(sum(e.seconds) filter (where e.type = 'page_exit'), 0) as seconds,
      coalesce((array_agg(e.source order by e.created_at) filter (where e.source is not null))[1], 'Direto') as source,
      (array_agg(e.utm_campaign order by e.created_at) filter (where e.utm_campaign is not null))[1] as campaign,
      (array_agg(e.device order by e.created_at) filter (where e.device is not null))[1] as device,
      (array_agg(e.city order by e.created_at) filter (where e.city is not null))[1] as city,
      (array_agg(e.region order by e.created_at) filter (where e.region is not null))[1] as region,
      (array_agg(e.path order by e.created_at) filter (where e.type = 'pageview'))[1] as landing
    from public.events e
    join chosen using (visitor_id)
    where e.created_at >= p_from and e.created_at < p_to
    group by e.visitor_id
  )
  select v.*, l.id, l.name, l.company, count(*) over () as total
  from v
  left join lateral (
    select id, name, company from public.leads
    where leads.visitor_id = v.visitor_id
    order by created_at desc limit 1
  ) l on true
  order by (l.id is not null) desc, v.last_seen desc, v.visitor_id
  limit least(greatest(p_limit, 1), 5000)
  offset greatest(p_offset, 0);
$$;

-- ── Pedido parado ────────────────────────────────────────────────────
-- Prazo de resposta: 1 dia útil (segunda a sexta, horário de Brasília) depois
-- de chegar. Pedido de sábado ou domingo começa a contar na segunda 0h; o de
-- sexta 15h vence segunda 15h. Feriado não entra na conta.
create or replace function private.answer_by(p_created timestamptz)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  with arrived as (
    select p_created at time zone 'America/Sao_Paulo' as t
  ),
  starts as (
    select case extract(isodow from t)
             when 6 then date_trunc('day', t) + interval '2 days'
             when 7 then date_trunc('day', t) + interval '1 day'
             else t
           end + interval '1 day' as t
    from arrived
  )
  select (case when extract(isodow from t) = 6 then t + interval '2 days' else t end) at time zone 'America/Sao_Paulo'
  from starts;
$$;

-- "Sem resposta": continua Novo depois do prazo
create or replace function private.is_stale(p_status text, p_created timestamptz)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_status = 'novo' and now() > private.answer_by(p_created);
$$;

revoke all on function private.answer_by(timestamptz) from public;
revoke all on function private.is_stale(text, timestamptz) from public;
grant execute on function private.answer_by(timestamptz) to authenticated;
grant execute on function private.is_stale(text, timestamptz) to authenticated;

-- Texto para comparar na busca: minúsculo, sem acento e com um espaço só entre as palavras.
-- Sem a extensão unaccent (não está ligada no projeto): troca as letras do português à mão.
create or replace function private.fold(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    translate(lower(coalesce(value, '')),
              'áàâãäåéèêëíìîïóòôõöúùûüçñý',
              'aaaaaaeeeeiiiiooooouuuucny'),
    '\s+', ' ', 'g');
$$;

revoke all on function private.fold(text) from public;
grant execute on function private.fold(text) to authenticated;

-- Lista de pedidos com filtros e busca. Tudo entra como parâmetro: nada do que
-- o admin digita vira SQL. Devolve o total, a contagem por situação (sem o
-- filtro de situação, para as abas) e a página pedida.
create or replace function public.dash_leads(
  p_from timestamptz default null,
  p_status text default null,
  p_source text default null,
  p_campaign text default null,
  p_path text default null,
  p_city text default null,
  p_search text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with q0 as (
    select trim(private.fold(p_search)) as folded
  ),
  q as (
    select
      -- menos de 3 letras ou números não busca (a tela avisa)
      case when length(regexp_replace(folded, '[^[:alnum:]]', '', 'g')) >= 3 then folded end as term,
      '%' || replace(replace(replace(folded, '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern,
      regexp_replace(folded, '\D', '', 'g') as digits
    from q0
  ),
  base as (
    select l.*
    from public.leads l cross join q
    where (p_from is null or l.created_at >= p_from)
      and (p_source is null or coalesce(l.source, 'Direto') = p_source)
      and (p_campaign is null or l.utm ->> 'utm_campaign' = p_campaign)
      and (p_path is null or l.page = p_path)
      and (p_city is null or l.city = p_city)
      and (
        q.term is null
        or private.fold(l.name) like q.pattern
        or private.fold(l.company) like q.pattern
        or private.fold(l.email) like q.pattern
        or (length(q.digits) >= 3 and regexp_replace(l.phone, '\D', '', 'g') like '%' || q.digits || '%')
      )
  ),
  picked as (
    select * from base
    where p_status is null
       or status = p_status
       or (p_status = 'sem_resposta' and private.is_stale(status, created_at))
  )
  select jsonb_build_object(
    'all', (select count(*) from base),
    'total', (select count(*) from picked),
    'counts', (select coalesce(jsonb_object_agg(c.status, c.n), '{}'::jsonb)
               from (select status, count(*) as n from base group by status
                     union all
                     select 'sem_resposta', count(*) from base where private.is_stale(status, created_at)) c),
    'rows', (
      select coalesce(jsonb_agg(to_jsonb(t) order by t.created_at desc, t.id), '[]'::jsonb)
      from (
        select id, created_at, name, company, email, phone, segment, source, city, region, status,
               status_at, page, gclid, utm ->> 'utm_campaign' as campaign, message, notes,
               private.is_stale(status, created_at) as stale
        from picked
        order by created_at desc, id
        limit least(greatest(p_limit, 1), 5000)
        offset greatest(p_offset, 0)
      ) t
    )
  );
$$;

revoke all on function public.dash_overview(timestamptz, timestamptz) from public, anon;
revoke all on function public.dash_visitors(timestamptz, timestamptz, text, text, text, text, integer, integer) from public, anon;
revoke all on function public.dash_leads(timestamptz, text, text, text, text, text, text, integer, integer) from public, anon;
grant execute on function public.dash_overview(timestamptz, timestamptz) to authenticated;
grant execute on function public.dash_visitors(timestamptz, timestamptz, text, text, text, text, integer, integer) to authenticated;
grant execute on function public.dash_leads(timestamptz, text, text, text, text, text, text, integer, integer) to authenticated;

-- Pedidos sem resposta agora (todos, não só do período), do mais novo ao mais antigo.
create or replace function public.dash_stale()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'total', count(*),
    'rows', coalesce(jsonb_agg(jsonb_build_object(
      'id', t.id, 'created_at', t.created_at, 'name', t.name, 'company', t.company,
      'source', t.source, 'answer_by', private.answer_by(t.created_at)
    ) order by t.created_at desc) filter (where t.n <= 200), '[]'::jsonb)
  )
  from (
    select l.*, row_number() over (order by l.created_at desc) as n
    from public.leads l
    where private.is_stale(l.status, l.created_at)
  ) t;
$$;
revoke all on function public.dash_stale() from public, anon;
grant execute on function public.dash_stale() to authenticated;
