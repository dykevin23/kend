# Database Conventions

## Column Naming

### 주소 관련
| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| `zone_code` | 우편번호 | "06658" |
| `address` | 기본 주소 | "서울시 서초구 명달로 122-12" |
| `address_detail` | 상세 주소 | "502호" |

### 시간 관련
| 컬럼명 | 설명 |
|--------|------|
| `created_at` | 생성 일시 |
| `updated_at` | 수정 일시 |

### ID 관련
| 컬럼명 | 설명 |
|--------|------|
| `id` | 테이블 기본 PK (UUID) |
| `{table}_id` | 외래키 참조 시 (예: `user_id`, `product_id`) |

---

## 테이블별 참고

### user_addresses
```
id, user_id, label, zone_code, address, address_detail, is_default, created_at, updated_at
```

### admin_seller_address
```
id, seller_id, address_name, address_type, zone_code, address, address_detail, created_at, updated_at
```
