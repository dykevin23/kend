-- ============================================================
-- 상품/SKU 상태 모델 kend 테스트용 데이터 준비 SQL
-- 대상: readme/todo/product-sku-status-test-scenarios.md §0
-- 셀러: 모이몰른 (SL0001, seller_id ddcd6695-7aa3-46fe-91c6-8ca4b8483a2c)
-- ⚠️ coucou(PL00000022 등)는 절대 건드리지 않음 — 아래 쿼리엔 없음
--
-- 사용법: APPLY 블록 실행 → 테스트.
-- RESTORE는 필수 아님 — 여러 상태 케이스가 데이터에 남아있는 게 이후 회귀
-- 확인에도 도움되므로 그대로 둬도 됨. 특정 상품만 원복하고 싶을 때 참고용.
-- ============================================================


-- ============================================================
-- APPLY — 테스트 상태로 전환
-- ============================================================

-- [P-SALE-OK] PR00000013 SOFT&냥이반목폴라티셔츠 — 변경 없음 (baseline)

-- [P-SALE-PARTIAL] PR00000019 피크닉원피스 (주문3·찜2·리뷰1)
-- SKU 5개 중 1개(sku-187, SIZE110/스카이블루, 원래 stock=3)만 품절 처리
UPDATE product_stock_keepings
SET status = 'SOLD_OUT', stock = 0
WHERE id = 'b2ccfb6f-2582-4c1c-82c8-85a796691e79'; -- sku-187

-- [P-SALE-STOPOPT] PR00000018 테오패딩점퍼 (주문2·찜1·리뷰1)
-- SKU 5개 중 1개(sku-183, SIZE120/라이트블루)만 판매중지
UPDATE product_stock_keepings
SET status = 'STOP'
WHERE id = '689ba3ff-bd3d-410a-894b-9867553ed8ff'; -- sku-183

-- [P-SALE-ALLGONE] PR00000015 크리미인견메쉬런닝세트 (주문2·리뷰2)
-- SKU 전체 5개 품절 처리 (product.status는 SALE 유지 — "일시 품절" 케이스)
UPDATE product_stock_keepings
SET status = 'SOLD_OUT', stock = 0
WHERE product_id = '43359fc8-1c6e-4196-94cb-d0b282c5b973';

-- [P-PREPARE] PR00000011 SOFT&포근스트라이프티셔츠 (주문2·리뷰2)
UPDATE products
SET status = 'PREPARE'
WHERE id = 'd74a441e-8a9a-4e37-90e5-2747db8cd7b1';

-- [P-STOP] PR00000010 SOFT&헤이면밍크기모레깅스 (주문1·리뷰1)
UPDATE products
SET status = 'STOP'
WHERE id = '8fc325ad-2668-42a5-8adc-35ba2e16ca96';

-- [P-END] PR00000008 C리오싱글루즈상하 (주문1·리뷰1)
UPDATE products
SET status = 'END'
WHERE id = '9c1aab22-18c5-4a49-93a1-f944e443f94a';

-- [P-CROSS-OPTION] PR00000004 C버디싱글상하 — §2-10 다중옵션 동적 비활성 테스트용
-- 컬러 2종(오프 화이트/라이트 옐로우) × 사이즈 5종. sku-11(SIZE100/라이트 옐로우, 원래 stock=10)만 품절 처리
-- → "라이트 옐로우" 선택 시 사이즈 100만 비활성(품절), "오프 화이트" 선택 시 전 사이즈 정상이어야 함
UPDATE product_stock_keepings
SET status = 'SOLD_OUT', stock = 0
WHERE id = 'de7b389e-f052-4631-a977-d1ba825ec7b9'; -- sku-11


-- ============================================================
-- RESTORE — 테스트 끝난 뒤 원복 (원래 값으로 복구)
-- ============================================================

-- P-SALE-PARTIAL 복구 (원래 stock=3, status=SALE)
UPDATE product_stock_keepings
SET status = 'SALE', stock = 3
WHERE id = 'b2ccfb6f-2582-4c1c-82c8-85a796691e79';

-- P-SALE-STOPOPT 복구 (원래 status=SALE, stock=4 — 변경 안 했으니 status만)
UPDATE product_stock_keepings
SET status = 'SALE'
WHERE id = '689ba3ff-bd3d-410a-894b-9867553ed8ff';

-- P-SALE-ALLGONE 복구 (원래 stock: sku-166=4, sku-167=5, sku-168=4, sku-169=5, sku-170=5)
UPDATE product_stock_keepings SET status = 'SALE', stock = 4 WHERE id = '8f5e12b6-33cf-43fa-8f31-107739d38e88'; -- sku-166
UPDATE product_stock_keepings SET status = 'SALE', stock = 5 WHERE id = '0f173102-6d02-4d33-a484-f8698b51fb26'; -- sku-167
UPDATE product_stock_keepings SET status = 'SALE', stock = 4 WHERE id = '81b120ce-fad0-41eb-b3b5-bd87861528bf'; -- sku-168
UPDATE product_stock_keepings SET status = 'SALE', stock = 5 WHERE id = '5b6ca089-4f3d-4bb9-99cc-6ede02ceca34'; -- sku-169
UPDATE product_stock_keepings SET status = 'SALE', stock = 5 WHERE id = '7268006a-7aec-4491-836f-8d92364c0582'; -- sku-170

-- P-PREPARE 복구
UPDATE products SET status = 'SALE' WHERE id = 'd74a441e-8a9a-4e37-90e5-2747db8cd7b1';

-- P-STOP 복구
UPDATE products SET status = 'SALE' WHERE id = '8fc325ad-2668-42a5-8adc-35ba2e16ca96';

-- P-END 복구
UPDATE products SET status = 'SALE' WHERE id = '9c1aab22-18c5-4a49-93a1-f944e443f94a';

-- P-CROSS-OPTION 복구
UPDATE product_stock_keepings SET status = 'SALE', stock = 10 WHERE id = 'de7b389e-f052-4631-a977-d1ba825ec7b9';
