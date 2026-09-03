-- Esquema PostgreSQL local. La API tambien lo crea automaticamente al iniciar.
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(320) not null unique,
  password_hash varchar(256) not null,
  role varchar(20) not null check (role in ('candidato', 'empresa')),
  email_verified boolean not null default false,
  verification_token varchar(128) unique,
  created_at timestamp not null default now()
);

create table if not exists candidatos (
  id uuid primary key references users(id) on delete cascade,
  nombre varchar(160) not null,
  dni varchar(8) not null unique,
  num_conadis varchar(80) not null default '',
  conadis_valido boolean not null default false,
  titulo_profesional varchar(160) not null default '',
  resumen_perfil text not null default '',
  habilidades jsonb not null default '[]',
  adaptaciones jsonb not null default '[]',
  cv_nombre_file varchar(255) not null default '',
  cv_content_type varchar(100) not null default 'application/pdf',
  cv_data bytea,
  updated_at timestamp not null default now()
);

create table if not exists empresas (
  id uuid primary key references users(id) on delete cascade,
  ruc varchar(11) not null unique,
  razon_social varchar(180) not null,
  sector varchar(120) not null default '',
  ciudad varchar(120) not null default '',
  colaboradores varchar(80) not null default '',
  descripcion text not null default '',
  updated_at timestamp not null default now()
);

create table if not exists ofertas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  titulo varchar(180) not null,
  modalidad varchar(20) not null check (modalidad in ('Remoto', 'Hibrido', 'Presencial', 'Híbrido')),
  ubicacion varchar(160) not null default '',
  experiencia varchar(160) not null default '',
  salario varchar(120) not null default '',
  funciones text not null,
  adaptaciones jsonb not null default '[]',
  activa boolean not null default true,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists postulaciones (
  id uuid primary key default gen_random_uuid(),
  oferta_id uuid not null references ofertas(id) on delete cascade,
  candidato_id uuid not null references candidatos(id) on delete cascade,
  estado varchar(30) not null default 'recibida',
  created_at timestamp not null default now(),
  constraint uq_postulacion_oferta_candidato unique (oferta_id, candidato_id)
);

create index if not exists postulaciones_empresa_idx on postulaciones (oferta_id, created_at desc);

create table if not exists ruc_registros (
  ruc varchar(11) primary key,
  razon_social varchar(180) not null,
  activo boolean not null default true,
  created_at timestamp not null default now()
);

create table if not exists conadis_registros (
  dni varchar(8) primary key,
  carnet varchar(80) not null unique,
  tipo_discapacidad varchar(160) not null,
  activo boolean not null default true,
  created_at timestamp not null default now()
);

create index if not exists ofertas_activas_created_idx on ofertas (activa, created_at desc);

/* El bloque anterior reemplaza las tablas y politicas especificas de Supabase. */
/*
create table if not exists public.candidatos (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  dni text not null unique,
  num_conadis text not null default '',
  conadis_valido boolean not null default false,
  titulo_profesional text not null default '',
  resumen_perfil text not null default '',
  habilidades text[] not null default '{}',
  adaptaciones text[] not null default '{}',
  cv_nombre_file text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.empresas (
  id uuid primary key references auth.users(id) on delete cascade,
  ruc text not null unique,
  razon_social text not null,
  sector text not null default '',
  ciudad text not null default '',
  colaboradores text not null default '',
  descripcion text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ofertas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  titulo text not null,
  modalidad text not null check (modalidad in ('Remoto', 'Híbrido', 'Presencial')),
  ubicacion text not null default '',
  experiencia text not null default '',
  salario text not null default '',
  funciones text not null,
  adaptaciones text[] not null default '{}',
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidatos enable row level security;
alter table public.empresas enable row level security;
alter table public.ofertas enable row level security;

create policy "candidatos pueden leer su perfil"
  on public.candidatos for select using (auth.uid() = id);
create policy "candidatos pueden editar su perfil"
  on public.candidatos for update using (auth.uid() = id);
create policy "empresas pueden leer su perfil"
  on public.empresas for select using (auth.uid() = id);
create policy "empresas pueden editar su perfil"
  on public.empresas for update using (auth.uid() = id);
create policy "cualquiera puede leer ofertas activas"
  on public.ofertas for select using (activa = true);
create policy "empresas pueden crear sus ofertas"
  on public.ofertas for insert with check (auth.uid() = empresa_id);
create policy "empresas pueden editar sus ofertas"
  on public.ofertas for update using (auth.uid() = empresa_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'role' = 'candidato' then
    insert into public.candidatos (id, nombre, dni, num_conadis, conadis_valido)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'nombre', ''),
      coalesce(new.raw_user_meta_data->>'dni', ''),
      coalesce(new.raw_user_meta_data->>'numConadis', ''),
      coalesce((new.raw_user_meta_data->>'conadisValido')::boolean, false)
    );
  elsif new.raw_user_meta_data->>'role' = 'empresa' then
    insert into public.empresas (id, ruc, razon_social)
    values (new.id, coalesce(new.raw_user_meta_data->>'ruc', ''), coalesce(new.raw_user_meta_data->>'razon_social', ''));
  end if;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
*/
