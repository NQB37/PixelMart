# Phase 13: Internationalization (i18n) - Đa Ngôn Ngữ Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thiết lập hệ thống đa ngôn ngữ (Tiếng Việt và Tiếng Anh) cho Admin Portal sử dụng `react-i18next`, tích hợp các tệp dịch JSON cục bộ và xây dựng thành phần chuyển đổi ngôn ngữ (Language Switcher) trên thanh công cụ Header.

**Architecture:** Sử dụng thư viện `i18next` và `react-i18next` để quản lý tài nguyên dịch thuật. Cấu hình `i18n.ts` tại thư mục `src/lib` đóng vai trò khởi tạo chính, tải các tệp ngôn ngữ từ các thư mục JSON (`vi/translation.json`, `en/translation.json`) và lưu cấu hình ngôn ngữ hiện tại của người dùng vào `localStorage` để duy trì trạng thái khi tải lại trang.

**Tech Stack:** React 18, i18next, react-i18next, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Thư mục làm việc: `web/admin-web/`
- Hai ngôn ngữ chính hỗ trợ: Tiếng Việt (`vi`) và Tiếng Anh (`en`). Mặc định ban đầu chọn `vi`.
- Key lưu trữ trong LocalStorage: `admin_lang`
- Mọi chuỗi ký tự hiển thị trên giao diện của Sidebar, Header và Dashboard chính cần được chuyển sang hàm dịch `t('key')` thay vì viết cứng.
- Không sử dụng code placeholder hay các ghi chú TBD/TODO trong code triển khai chính thức.

---

## 📋 Task Breakdown

### Task 13.1: Cấu hình react-i18next & Định nghĩa Dictionary

**Files:**
- Create: `web/admin-web/src/locales/vi/translation.json`
- Create: `web/admin-web/src/locales/en/translation.json`
- Create: `web/admin-web/src/lib/i18n.ts`
- Create: `web/admin-web/src/__tests__/i18n.test.tsx`
- Modify: `web/admin-web/src/main.tsx` (import `./lib/i18n`)

**Interfaces:**
- Consumes: None
- Produces: `i18n` instance sẵn sàng dịch các chuỗi văn bản với hook `useTranslation`.

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/src/__tests__/i18n.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTranslation } from 'react-i18next';
import '../lib/i18n'; // Import initialized config

function TransTest() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <span data-testid="trans-text">{t('dashboard.title')}</span>
      <button onClick={() => i18n.changeLanguage('en')} aria-label="to-en">EN</button>
      <button onClick={() => i18n.changeLanguage('vi')} aria-label="to-vi">VI</button>
    </div>
  );
}

describe('i18n configuration setup', () => {
  it('correctly translates keys and reacts to language changes', async () => {
    render(<TransTest />);

    // Default should be Vietnamese
    expect(screen.getByTestId('trans-text')).toHaveTextContent('Bảng Điều Khiển');

    const toEnBtn = screen.getByRole('button', { name: /to-en/i });
    await act(async () => {
      toEnBtn.click();
    });

    expect(screen.getByTestId('trans-text')).toHaveTextContent('Dashboard Overview');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npm run test`
Expected: FAIL với lỗi không import được `../lib/i18n` do file chưa được tạo.

- [ ] **Step 3: Write minimal implementation**

```json
// web/admin-web/src/locales/vi/translation.json
{
  "common": {
    "search": "Tìm kiếm...",
    "confirm": "Xác nhận",
    "cancel": "Hủy",
    "actions": "Hành động"
  },
  "sidebar": {
    "dashboard": "Bảng điều khiển",
    "shops": "Cửa hàng",
    "users": "Người dùng"
  },
  "dashboard": {
    "title": "Bảng Điều Khiển",
    "subtitle": "Thống kê hoạt động của hệ thống PixelMart theo thời gian thực.",
    "revenue": "Tổng doanh thu",
    "orders": "Tổng đơn hàng"
  }
}
```

```json
// web/admin-web/src/locales/en/translation.json
{
  "common": {
    "search": "Search...",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "actions": "Actions"
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "shops": "Shops",
    "users": "Users"
  },
  "dashboard": {
    "title": "Dashboard Overview",
    "subtitle": "Real-time store platform activity statistics.",
    "revenue": "Total Revenue",
    "orders": "Total Orders"
  }
}
```

```typescript
// web/admin-web/src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from '../locales/vi/translation.json';
import enTranslation from '../locales/en/translation.json';

const savedLang = localStorage.getItem('admin_lang') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: viTranslation },
      en: { translation: enTranslation },
    },
    lng: savedLang,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
```

Modify `web/admin-web/src/main.tsx` to include `import './lib/i18n';` tại dòng đầu tiên của file:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/i18n'; // Khởi tạo i18n trước khi render React App
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Modify `web/admin-web/package.json` to add i18n dependencies:
Run: `npm install i18next react-i18next`
(Add entries to dependencies in `package.json` file inside implementing phase).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web/admin-web && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/locales/ src/lib/i18n.ts src/main.tsx src/__tests__/i18n.test.tsx
git commit -m "feat(admin): configure react-i18next and define dictionaries for vi and en"
```

---

### Task 13.2: Xây dựng LanguageSwitcher & Cập Nhật Hệ Thống Bản Dịch Trên Giao Diện Layout

**Files:**
- Create: `web/admin-web/src/components/layout/LanguageSwitcher.tsx`
- Create: `web/admin-web/src/__tests__/LanguageSwitcher.test.tsx`
- Modify: `web/admin-web/src/components/layout/Header.tsx` (chèn LanguageSwitcher vào header)
- Modify: `web/admin-web/src/components/layout/Sidebar.tsx` (dùng useTranslation dịch menu navigation)

**Interfaces:**
- Consumes: `useTranslation` hook
- Produces: Component `LanguageSwitcher` dạng dropdown hoặc toggle switch. Cho phép click thay đổi ngôn ngữ đang chạy (`i18n.changeLanguage`) và cập nhật value vào LocalStorage.

- [ ] **Step 1: Write the failing test**

```typescript
// web/admin-web/src/__tests__/LanguageSwitcher.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';

// Mock useTranslation
const changeLanguageMock = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'vi',
      changeLanguage: changeLanguageMock
    }
  })
}));

describe('LanguageSwitcher Component', () => {
  it('displays active language and triggers changeLanguage mock when switch is clicked', () => {
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox', { name: /language-select/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('vi');

    fireEvent.change(select, { target: { value: 'en' } });
    expect(changeLanguageMock).toHaveBeenCalledWith('en');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web/admin-web && npm run test`
Expected: FAIL với lỗi không tìm thấy `LanguageSwitcher` component.

- [ ] **Step 3: Write minimal implementation**

```typescript
// web/admin-web/src/components/layout/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('admin_lang', newLang);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-slate-300">
      <Globe className="h-4 w-4 text-slate-500" />
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        aria-label="language-select"
        className="bg-transparent text-xs font-semibold text-slate-300 outline-none cursor-pointer focus:ring-0 focus:outline-none"
      >
        <option value="vi" className="bg-slate-900 text-slate-100">VI</option>
        <option value="en" className="bg-slate-900 text-slate-100">EN</option>
      </select>
    </div>
  );
}
```

```typescript
// web/admin-web/src/components/layout/Header.tsx
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher'; // Tích hợp LanguageSwitcher

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6 text-white">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="toggle-sidebar"
          className="rounded p-1 hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">PixelMart Admin</h1>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher /> {/* Đa ngôn ngữ button */}
        <button className="relative rounded p-1 hover:bg-slate-800" aria-label="Notifications">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
        </button>
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="h-5 w-5 text-slate-300" />
          </div>
          <span className="hidden text-sm font-medium sm:inline">Admin User</span>
        </div>
      </div>
    </header>
  );
}
```

```typescript
// web/admin-web/src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Hook i18n

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { name: t('sidebar.dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('sidebar.shops'), path: '/admin/shops', icon: Store },
    { name: t('sidebar.users'), path: '/admin/users', icon: Users },
  ];

  return (
    <aside
      data-testid="admin-sidebar"
      data-collapsed={isCollapsed}
      className={`border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-slate-800 hover:text-white ${
                isActive ? 'bg-slate-800 text-white font-semibold' : ''
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web/admin-web && npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/LanguageSwitcher.tsx src/__tests__/LanguageSwitcher.test.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(admin): integration of LanguageSwitcher widget and translate sidebar elements"
```

---

## 🏁 Definition of Done & Checklists

### Checklist cuối phase
- [ ] Thay đổi Option chọn trong dropdown `LanguageSwitcher` tự động cập nhật ngôn ngữ giao diện (chữ dịch hiển thị đúng ngôn ngữ đích).
- [ ] Ngôn ngữ đã chọn được ghi vào `localStorage` có key `admin_lang`.
- [ ] F5 reload lại trang, giao diện giữ nguyên ngôn ngữ đã chọn trước đó.
- [ ] Không có cảnh báo lỗi "missing translation key" trên console trình duyệt của dev server.

### ⚠️ Lỗi Fresher hay mắc
1. **Quên import tệp `i18n.ts` tại file entry point chính (`main.tsx`):** Dẫn đến việc ứng dụng chạy nhưng không tìm thấy instance cấu hình, hàm dịch `t()` sẽ không hoạt động hoặc crash ứng dụng.
2. **Không dùng `t` cho toàn bộ ký tự hiển thị:** Viết sót, dịch thiếu các key tĩnh làm cho trang hiển thị nửa tiếng Việt nửa tiếng Anh.
3. **Gọi `changeLanguage` bất đồng bộ làm ảnh hưởng test:** Khi viết test thay đổi ngôn ngữ, không bọc các event click đổi ngôn ngữ trong block `act(...)` dẫn đến các cảnh báo thay đổi state ngoài luồng điều khiển của Testing Library.
