# 휴대폰 인증 도입 계획 (Phase 1)

> 작성일: 2026-04-22  
> 목적: 휴대폰 인증을 도입하여 본인 확인 수단을 확보하고, 이를 통해 회원 관련 미해결 항목들을 일괄 해결

---

## 배경

현재 KEND는 본인 확인 수단이 없어 다음 기능을 구현할 수 없는 상태:

- **아이디 찾기**: 누가 누구인지 증명 불가
- **비밀번호 찾기**: 이메일 가입자 한정 발송 외 추가 검증 어려움
- **소셜 회원가입 추가정보 입력 flow**: 소셜 가입자에게서 휴대폰 등 정보를 받아야 함
- **결제 본인확인**: 추후 결제 본격 오픈 시 필수

휴대폰 인증을 도입하면 위 항목들이 한 번에 해결됨.

---

## Phase 구분

### Phase 1 (MVP, 본 문서)
- **SMS OTP** 인증 도입 (간단/저렴/빠른 구현)
- 휴대폰 번호 인증 + 실명/생년월일 직접 입력 (검증 X)
- 회원가입(이메일/소셜) 시 휴대폰 인증 추가 단계
- 아이디/비밀번호 찾기 구현
- 기존 회원에게는 로그인 후 정보 입력 페이지로 유도

### Phase 2 (결제 본격 오픈 시)
- **NICE 본인확인** 같은 본인확인 서비스로 업그레이드
- 진짜 본인확인(실명/CI/DI 검증), 중복 가입 방지
- 본 문서에서는 다루지 않음

---

## SMS Provider 선택

| Provider | 특징 | 장단점 |
|----------|------|--------|
| **Supabase Phone Auth (Twilio)** | Supabase 내장, 가장 간단 | 한국 발송 비싸고 알림톡 미지원 |
| **NHN Cloud** | 국내 표준, 알림톡/SMS 통합 | 안정적, 사업자 등록 필요 |
| **Coolsms** | 국내 SMS 특화 | 저렴, 카카오 알림톡 지원 |
| **Aligo** | 국내 SMS 보편적 | 저렴, 단순 |

**추천**: **Coolsms** 또는 **NHN Cloud**
- 한국 SMS 발송 비용 우위
- 추후 카카오 알림톡 전환 가능 (마케팅 메시지/주문 알림 등)
- Supabase Phone Auth는 OTP 검증 로직만 빌려오고 발송은 별도 서비스 사용 가능

> 결정 필요: Provider 선택 + 계약/요금제 검토

---

## 작업 범위

### 1. DB 스키마 변경

`profiles` 테이블에 컬럼 추가:

| 컬럼 | 타입 | 비고 |
|------|------|------|
| `phone` | text | E.164 형식 (+8210...) |
| `phone_verified` | boolean default false | 인증 완료 여부 |
| `phone_verified_at` | timestamptz | 인증 일시 |
| `real_name` | text | 사용자 입력 (검증 X) |
| `birth_date` | date | 사용자 입력 (검증 X) |
| `gender` | text nullable | 사용자 입력 (선택) |

**RLS 고려**: 본인만 조회/수정 가능하도록 정책 추가

### 2. OTP 발송/검증 Edge Function

Supabase Edge Function으로 구현:

- `POST /functions/v1/phone/send-otp` - 휴대폰 번호 받아서 OTP 발송 (SMS provider 호출)
- `POST /functions/v1/phone/verify-otp` - OTP 코드 검증 후 토큰/세션 발급
- 발송 빈도 제한 (rate limit), 만료 시간 (3분), 시도 횟수 제한

### 3. 회원가입 플로우 개편

**이메일 회원가입 (신규)**:
```
이메일/비밀번호 입력 → 휴대폰 인증 → 추가정보 입력(닉네임/실명/생년월일) → 가입 완료
```

**소셜 회원가입 (신규)**:
```
소셜 OAuth → (가입 정보 없으면) 휴대폰 인증 → 추가정보 입력 → 가입 완료
```

### 4. 기존 회원 처리

기존 가입자는 `phone_verified = false` 상태:
- 로그인 시 `phone_verified` 체크
- 미인증 시 추가 정보 입력 페이지로 강제 이동
- 인증 완료 후 정상 서비스 이용

### 5. 아이디 찾기

```
휴대폰 번호 입력 → OTP 인증 → 가입 정보 안내
  ├─ 이메일 가입자 → "이메일: aaa@bbb.com 으로 가입되어 있어요"
  └─ 소셜 가입자 → "[카카오/구글/애플/네이버]로 가입하셨어요"
```

### 6. 비밀번호 찾기

```
휴대폰 번호 입력 → OTP 인증
  ├─ 이메일 가입자 → 새 비밀번호 입력 → 변경 완료
  └─ 소셜 가입자 → "소셜 로그인은 비밀번호가 없어요" 안내
```

---

## 신규 페이지/라우트

| 라우트 | 설명 |
|--------|------|
| `/auth/phone/verify` | 휴대폰 OTP 입력 페이지 (회원가입 흐름 중) |
| `/auth/profile-setup` | 추가 정보 입력 페이지 (닉네임/실명/생년월일) |
| `/auth/find-id` | 아이디 찾기 |
| `/auth/find-password` | 비밀번호 찾기 |
| `/auth/reset-password` | 새 비밀번호 입력 |

> **Note**: 위 신규 페이지들은 [native-swipe-blacklist.md](../active/native-swipe-blacklist.md)에 추가 필요

---

## 작업 순서 제안

1. **Provider 선택 및 계약** (1~2일)
2. **DB 스키마 마이그레이션** (0.5일)
3. **Edge Function: send-otp / verify-otp** (1~2일)
4. **추가정보 입력 페이지 + 라우트** (1일)
5. **회원가입 플로우 통합** (이메일+소셜) (1~2일)
6. **기존 회원 강제 입력 유도 처리** (1일)
7. **아이디/비밀번호 찾기 페이지** (1~2일)
8. **테스트 및 QA** (1일)

총 예상: **약 8~12일**

---

## 결정 필요 사항

- [ ] SMS provider 선택 (Coolsms / NHN Cloud / 기타)
- [ ] 사용자 정보 추가 입력 항목 확정 (닉네임 외에 실명/생년월일/성별 모두 받을지)
- [ ] 기존 회원 강제 입력 시점 (다음 로그인 / 다음 결제 등)
- [ ] OTP 발송 빈도/시도 제한 정책

---

## 관련 문서

- [internal-test-1st.md](../active/internal-test-1st.md) - 1차 내부 테스트에서 도출된 미해결 항목
- [auth-model.md](../core/auth-model.md) - 현재 인증 모델
- [database.md](../core/database.md) - DB 구조
- [native-swipe-blacklist.md](../active/native-swipe-blacklist.md) - 신규 페이지 blacklist 추가 필요
