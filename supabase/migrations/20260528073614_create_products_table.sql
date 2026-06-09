create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price text not null,
  price_mode text not null default 'sell',
  offer_price boolean default false,
  location text default '논현2동',
  trade_location text,
  category text default '중고거래',
  thumbnail_color text default '#E8D890',
  seller_name text,
  seller_location text,
  temperature numeric default 36.5,
  views int default 0,
  interests int default 0,
  chat_count int default 0,
  heart_count int default 0,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "누구나 읽기 가능" on products
  for select using (true);

create policy "누구나 등록 가능" on products
  for insert with check (true);

create policy "누구나 수정 가능" on products
  for update using (true) with check (true);

create policy "누구나 삭제 가능" on products
  for delete using (true);
