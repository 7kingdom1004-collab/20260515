-- user_id 컬럼 추가
alter table products add column user_id uuid references auth.users(id);

-- 인덱스 추가 (성능)
create index products_user_id_idx on products(user_id);

-- RLS 정책 재설정
drop policy "누구나 등록 가능" on products;
drop policy "누구나 수정 가능" on products;
drop policy "누구나 삭제 가능" on products;

-- 새 정책: 인증된 사용자만 등록 가능
create policy "인증된 사용자만 등록 가능" on products
  for insert
  with check (auth.uid() = user_id);

-- 새 정책: 본인 상품만 수정 가능
create policy "본인 상품만 수정 가능" on products
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 새 정책: 본인 상품만 삭제 가능
create policy "본인 상품만 삭제 가능" on products
  for delete
  using (auth.uid() = user_id);

-- 새 정책: 관리자는 모든 상품 수정 가능 (위험상품, 19금 등 모더레이션 목적)
create policy "관리자는 모든 상품 수정 가능" on products
  for update
  using (
    exists (
      select 1 from users
      where users.id = auth.uid() and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- 새 정책: 관리자는 모든 상품 삭제 가능
create policy "관리자는 모든 상품 삭제 가능" on products
  for delete
  using (
    exists (
      select 1 from users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );
