# Kênh Người Bán - Phase 13: i18n Internationalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp đa ngôn ngữ (Tiếng Việt và Tiếng Anh) cho giao diện Kênh người bán sử dụng thư viện `react-i18next` và xây dựng bộ chọn ngôn ngữ (Language Switcher) trên Header.

**Architecture:** Sử dụng `i18next` kết hợp `react-i18next` để quản lý các bản dịch JSON của hai ngôn ngữ Việt-Anh. Tạo component `LanguageSwitcher` để thay đổi ngôn ngữ động thông qua hàm `i18n.changeLanguage`.

**Tech Stack:** React 18, `i18next`, `react-i18next`, Vitest, React Testing Library.

> ⬜ **Chưa build** — plan mục tiêu; đã chỉnh cho khớp codebase. Chưa tích hợp i18n (không có `react-i18next` / thư mục `locales/`), và app hiện chưa có Sidebar/Header để gắn LanguageSwitcher.

## Global Constraints

- Node.js version >= 18
- Package manager: pnpm
- Toàn bộ source code của seller nằm trong thư mục `website/seller/`
- Sử dụng Path Alias `@/` trỏ tới `website/seller/src`
- TDD: Mọi component/helper phải viết test trước khi code minimal implementation
- Không sử dụng code placeholder (ví dụ: `// TODO`, `/* code here */`). Toàn bộ code trong plan phải hoạt động được.

---

## 📋 Task Breakdown

### Task 1: Cấu hình i18next & Tạo các File Ngôn ngữ (vi, en)

**Files:**
- Create: `website/seller/src/locales/vi/translation.json`
- Create: `website/seller/src/locales/en/translation.json`
- Create: `website/seller/src/i18n.ts`
- Modify: `website/seller/src/main.tsx`
- Create: `website/seller/src/tests/i18n.test.ts`

**Interfaces:**
- Consumes: Cấu hình Vite & packages ở Phase 1.
- Produces: Hệ thống dịch i18n sẵn sàng cung cấp dữ liệu qua `useTranslation`.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/tests/i18n.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import i18next from 'i18next';

describe('i18n initialization', () => {
  it('loads translation config with default language vi', async () => {
    // Đảm bảo i18n khởi tạo thành công
    expect(i18next.isInitialized).toBe(true);
    expect(i18next.language).toBe('vi');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì `i18n` chưa được import, cấu hình và khởi tạo.

- [ ] **Step 3: Write minimal implementation**
Cài đặt thư viện i18n:
Run: `pnpm --filter seller add i18next react-i18next`

Tạo file dịch Tiếng Việt:
Create: `website/seller/src/locales/vi/translation.json`
```json
{
  "common": {
    "dashboard": "Tổng quan",
    "products": "Sản phẩm",
    "orders": "Đơn hàng",
    "settings": "Thiết lập",
    "seller_portal": "Kênh Người Bán"
  }
}
```

Tạo file dịch Tiếng Anh:
Create: `website/seller/src/locales/en/translation.json`
```json
{
  "common": {
    "dashboard": "Dashboard",
    "products": "Products",
    "orders": "Orders",
    "settings": "Settings",
    "seller_portal": "Seller Portal"
  }
}
```

Tạo cấu hình khởi tạo i18n:
Create: `website/seller/src/i18n.ts`
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-react-i18next';
import viTranslation from './locales/vi/translation.json';
import enTranslation from './locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: viTranslation },
      en: { translation: enTranslation },
    },
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```
*(Lưu ý: Sửa đúng import react-i18next: `import { initReactI18next } from 'react-i18next';`)*
Sửa code `i18n.ts`:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from './locales/vi/translation.json';
import enTranslation from './locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: viTranslation },
      en: { translation: enTranslation },
    },
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

Cập nhật `main.tsx` để import file cấu hình `i18n.ts` khi chạy ứng dụng:
Modify: `website/seller/src/main.tsx:1-20`
(Nhập `import './i18n';` ở dòng đầu tiên của `website/seller/src/main.tsx`).

Tạo file setup test cho i18n nhằm tránh lỗi thiếu provider khi test:
Modify: `website/seller/src/tests/setup.ts:1-10`
```typescript
import '@testing-library/jest-dom';
import '../i18n';
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS 1/1 (i18n.test.ts)

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/locales/vi/translation.json website/seller/src/locales/en/translation.json website/seller/src/i18n.ts website/seller/src/main.tsx website/seller/src/tests/i18n.test.ts website/seller/src/tests/setup.ts
git commit -m "feat(seller): configure i18next and translation files for Vietnamese and English"
```

---

### Task 2: Xây dựng Bộ Chọn Ngôn ngữ (Language Switcher Component)

**Files:**
- Create: `website/seller/src/components/layout/LanguageSwitcher.tsx`
- Create: `website/seller/src/tests/languageSwitcher.test.tsx`

**Interfaces:**
- Consumes: Cấu hình `i18n` từ Task 1.
- Produces: Component `LanguageSwitcher` chứa giao diện nút bấm hoặc dropdown để thay đổi ngôn ngữ hiển thị.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/tests/languageSwitcher.test.tsx`
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';

describe('LanguageSwitcher Component', () => {
  it('renders correctly and lists selectable options', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì `LanguageSwitcher` chưa được tạo.

- [ ] **Step 3: Write minimal implementation**
Create: `website/seller/src/components/layout/LanguageSwitcher.tsx`
```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg shadow-sm">
      <Globe className="h-4 w-4 text-slate-500" />
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        aria-label="Chọn ngôn ngữ"
      >
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS 2/2 (languageSwitcher.test.tsx)

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/components/layout/LanguageSwitcher.tsx website/seller/src/tests/languageSwitcher.test.tsx
git commit -m "feat(seller): add LanguageSwitcher dropdown selection component"
```

---

### Task 3: Cập nhật Sidebar và Header dịch tự động đa ngôn ngữ

**Files:**
- Modify: `website/seller/src/components/layout/Sidebar.tsx`
- Modify: `website/seller/src/components/layout/Header.tsx`
- Create: `website/seller/src/tests/translationFlow.test.tsx`

**Interfaces:**
- Consumes: `LanguageSwitcher` và hook `useTranslation` từ i18n.
- Produces: Layout hiển thị chuẩn dịch tự động theo ngôn ngữ được chọn.

- [ ] **Step 1: Write the failing test**
Create: `website/seller/src/tests/translationFlow.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import i18n from '../i18n';
import Sidebar from '../components/layout/Sidebar';

describe('Internationalized Sidebar translate flow', () => {
  it('translates navigation links dynamically when switching languages', async () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // Tiếng Việt là mặc định
    expect(screen.getByText('Tổng quan')).toBeInTheDocument();

    // Chuyển sang Tiếng Anh
    i18n.changeLanguage('en');

    // Sau khi đổi, kiểm tra text đã chuyển thành tiếng Anh
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm --filter seller test run`
Expected: FAIL vì Sidebar chưa sử dụng hook `useTranslation` và vẫn đang hardcode chuỗi Tiếng Việt.

- [ ] **Step 3: Write minimal implementation**
Cập nhật Sidebar sử dụng hook `useTranslation`:
Modify: `website/seller/src/components/layout/Sidebar.tsx:1-60`
```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, ShoppingBag, Store, Settings, PackageOpen } from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();

  const menuItems = [
    { name: t('common.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('common.products'), path: '/products', icon: PackageOpen },
    { name: t('common.orders'), path: '/orders', icon: ShoppingBag },
    { name: t('common.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Store className="h-6 w-6 text-blue-400" />
        <span className="font-bold text-lg tracking-wider">PixelMart</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

Cập nhật Header sử dụng `LanguageSwitcher` và `useTranslation`:
Modify: `website/seller/src/components/layout/Header.tsx:1-40`
```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="font-semibold text-slate-800">{t('common.seller_portal')}</div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-100 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-slate-700">Nguyễn Văn Seller</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm --filter seller test run`
Expected: PASS tất cả 16 tests bao gồm cả test đổi ngôn ngữ động.

- [ ] **Step 5: Commit**
```bash
git add website/seller/src/components/layout/Sidebar.tsx website/seller/src/components/layout/Header.tsx website/seller/src/tests/translationFlow.test.tsx
git commit -m "feat(seller): internationalize Sidebar navigation links and add LanguageSwitcher into Header"
```

---

## 🏁 Phase Checklist & Common Fresher Errors

### 📋 Phase Complete Checklist
1. Thư viện `react-i18next` được tích hợp, dịch tự động hoạt động thông qua hook `useTranslation`.
2. Header chứa bộ chọn thay đổi ngôn ngữ Tiếng Việt và Tiếng Anh (`LanguageSwitcher`).
3. Khi thay đổi tùy chọn ngôn ngữ, Sidebar, Header và các nhãn chính tự động chuyển dịch mà không cần load lại trang.
4. i18n không làm ảnh hưởng hay gây crash cho các test case cũ của layout và router.
5. Cấu hình fallback được định hình chuẩn về Tiếng Việt (`vi`) khi không xác định được locale cụ thể.

### ⚠️ Common Fresher Errors
- **Error:** Quên khai báo các trường hoặc cụm dịch tương ứng giữa các file ngôn ngữ `vi/translation.json` và `en/translation.json` dẫn đến việc trang hiển thị mã key thô (ví dụ: `common.dashboard`) khi đổi ngôn ngữ.
  - *Fix:* Luôn kiểm tra song song và khai báo đầy đủ các key dịch giống hệt nhau ở cả 2 file.
- **Error:** Bị crash lỗi render trong môi trường test do các component con dùng hook `useTranslation` nhưng test suite không mock hoặc không import tệp `i18n.ts` vào setup.
  - *Fix:* Import file `i18n.ts` trực tiếp ở file cấu hình `website/seller/src/tests/setup.ts` để khởi tạo i18n một lần duy nhất cho toàn bộ môi trường test.
- **Error:** Định nghĩa thừa hoặc thiếu thẻ đóng ngoặc JSON trong tệp locales dẫn đến compile webpack/vite báo lỗi cú pháp parse JSON.
  - *Fix:* Sử dụng IDE extension hoặc check định dạng JSON hợp lệ trước khi lưu.
