# UI 컴포넌트 가이드

## useAlert Hook

앱 전역에서 사용할 수 있는 Alert/Confirm 다이얼로그 시스템입니다.

### 설정

`root.tsx`에서 `AlertProvider`로 앱을 감싸서 사용합니다.

```tsx
// app/root.tsx
import { AlertProvider } from "./hooks/useAlert";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}
```

### 사용법

```tsx
import { useAlert } from "~/hooks/useAlert";

function MyComponent() {
  const { alert, confirm } = useAlert();

  // 단순 알림 (확인 버튼만)
  const handleShowAlert = () => {
    alert({
      title: "알림",
      message: "작업이 완료되었습니다.",
      primaryButton: {
        label: "확인",
        onClick: () => {
          // 확인 버튼 클릭 시 동작
        },
      },
    });
  };

  // 확인/취소 다이얼로그
  const handleShowConfirm = () => {
    confirm({
      title: "기본 배송지 설정",
      message: "등록한 배송지를 기본 배송지로 설정하시겠습니까?",
      primaryButton: {
        label: "예",
        onClick: () => {
          // 예 버튼 클릭 시 동작
        },
      },
      secondaryButton: {
        label: "아니오",
        onClick: () => {
          // 아니오 버튼 클릭 시 동작
        },
      },
    });
  };

  return (
    <div>
      <button onClick={handleShowAlert}>알림 표시</button>
      <button onClick={handleShowConfirm}>확인 다이얼로그 표시</button>
    </div>
  );
}
```

### API

#### `alert(props: AlertsProps): string`
단순 알림 다이얼로그를 표시합니다. 확인 버튼만 있습니다.
- **반환값**: 고유한 alert key (UUID)

#### `confirm(props: AlertsProps): string`
확인/취소 다이얼로그를 표시합니다. 두 개의 버튼을 지원합니다.
- **반환값**: 고유한 alert key (UUID)

#### `hideAlert(key: string): void`
특정 key를 가진 alert을 닫습니다.

#### `hideAlertAll(): void`
모든 열린 alert을 닫습니다.

#### AlertsProps

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | `string` | O | 다이얼로그 제목 |
| `message` | `string` | O | 다이얼로그 본문 메시지 |
| `primaryButton` | `{ label: string; onClick: () => void }` | O | 주요 버튼 (예, 확인 등) |
| `secondaryButton` | `{ label: string; onClick: () => void }` | X | 보조 버튼 (아니오, 취소 등) |

### Alert Key 활용

여러 개의 alert이 순차적으로 표시되거나, 특정 단계를 건너뛰며 한 번에 여러 alert을 닫아야 하는 경우 key를 활용합니다.

```tsx
import { useAlert } from "~/hooks/useAlert";

function MultiStepProcess() {
  const { confirm, hideAlert, hideAlertAll } = useAlert();
  const alertKeysRef = useRef<string[]>([]);

  const handleMultiStepConfirm = () => {
    // 첫 번째 확인
    const key1 = confirm({
      title: "1단계",
      message: "첫 번째 확인입니다.",
      primaryButton: {
        label: "다음",
        onClick: () => {
          // 두 번째 확인
          const key2 = confirm({
            title: "2단계",
            message: "두 번째 확인입니다.",
            primaryButton: {
              label: "완료",
              onClick: () => {
                // 모든 작업 완료
              },
            },
            secondaryButton: {
              label: "처음으로",
              onClick: () => {
                // 모든 alert 닫기
                hideAlertAll();
              },
            },
          });
          alertKeysRef.current.push(key2);
        },
      },
      secondaryButton: {
        label: "취소",
        onClick: () => {},
      },
    });
    alertKeysRef.current.push(key1);
  };

  // 특정 alert만 닫기
  const closeSpecificAlert = (key: string) => {
    hideAlert(key);
  };

  return <button onClick={handleMultiStepConfirm}>다단계 확인 시작</button>;
}
```

### 사용 가이드라인

#### 사용해야 하는 경우
- 사용자의 확인이 필요한 중요한 액션 (삭제, 변경 등)
- 에러 메시지 표시
- 작업 완료 알림
- 사용자 선택이 필요한 경우 (예/아니오)

#### 사용하지 말아야 하는 경우
- 폼 필드 유효성 검사 → 입력란 하단에 인라인으로 표시
- 일반적인 정보 표시 → 화면 내 텍스트로 표시
- 실시간 피드백 → Toast 사용 권장

### 디자인

다이얼로그는 다음과 같은 스타일로 표시됩니다:
- 중앙 정렬된 모달
- 둥근 모서리 (rounded-xl)
- 버튼은 pill 형태 (rounded-full)
- 주요 버튼: secondary 스타일
- 보조 버튼: outline 스타일

### 관련 파일

- `app/hooks/useAlert.tsx` - Hook 및 Provider
- `app/common/components/alert.tsx` - Alert 컴포넌트
- `app/common/components/ui/alert-dialog.tsx` - shadcn AlertDialog 기반 컴포넌트
