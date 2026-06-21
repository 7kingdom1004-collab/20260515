-- is_deleted 컬럼 추가 (소프트 삭제용)
alter table products add column is_deleted boolean default false;

-- 인덱스 추가 (쿼리 성능)
create index products_is_deleted_idx on products(is_deleted);
