# 📋 Frontend Restructuring (Web & Mobile Workspace) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Di chuyển và tách biệt cấu trúc frontend monolith hiện tại thành các workspace Web (client-web Next.js, seller-web React-Vite, admin-web React-Vite, shared) và Mobile (client-mobile, delivery-mobile, shared) độc lập bằng pnpm workspace.

**Architecture:** Sử dụng pnpm Workspaces cục bộ để gom nhóm dự án Web dưới thư mục `web/` và các ứng dụng Mobile dưới thư mục `mobile/`. Mỗi nhóm có thư mục `shared/` riêng để tái sử dụng mã nguồn mà không gây chồng chéo config giữa Web (React/Tailwind) và Mobile (React Native).

**Tech Stack:** Next.js 15+, React + Vite + TypeScript, Expo (React Native), Tailwind CSS v4, Axios, pnpm.

## Global Constraints
- Tất cả các lệnh chạy dev/build phải sử dụng pnpm.
- Tuyệt đối không dùng chung workspace ở root cho toàn bộ dự án, chỉ cấu hình pnpm workspace riêng biệt cục bộ bên trong thư mục `web/` và `mobile/`.
- Cấu hình Tailwind v4 trong các app con phải quét thư mục `@shared` thông qua chỉ định `@source`.

---

### Task 1: Web Workspace Setup & Directory Restructuring

**Files:**
- Create: `web/pnpm-workspace.yaml`
- Modify: `.gitignore` (ở root)

**Interfaces:**
- Consumes: Thư mục `/client` hiện tại.
- Produces: Cấu trúc thư mục `/web/client-web` hoạt động độc lập trong workspace của `/web`.

- [ ] **Step 1: Cập nhật file `.gitignore` ở root để ignore các folder build/dependency của workspace mới**

  Chèn các dòng sau vào file `.gitignore` ở thư mục gốc:
  ```gitignore
  # Web Workspace
  web/**/node_modules/
  web/**/.next/
  web/**/dist/
  
  # Mobile Workspace
  mobile/**/node_modules/
  mobile/**/.expo/
  mobile/**/dist/
  ```

- [ ] **Step 2: Thực hiện di chuyển thư mục `client/` sang `/web/client-web/`**

  Chạy lệnh shell chuyển folder:
  ```bash
  mkdir -p web
  mv client web/client-web
  ```

- [ ] **Step 3: Tạo cấu hình Workspace `web/pnpm-workspace.yaml`**

  Tạo file `web/pnpm-workspace.yaml` với nội dung:
  ```yaml
  packages:
    - 'shared'
    - 'client-web'
    - 'seller-web'
    - 'admin-web'
  ```

- [ ] **Step 4: Chạy cài đặt để kiểm tra tích hợp workspace**

  Chạy lệnh:
  ```bash
  cd web && pnpm install
  ```
  Expected: Lệnh chạy thành công, cài đặt đầy đủ node_modules cho dự án `web/client-web`.

- [ ] **Step 5: Commit**

  ```bash
  git add .gitignore web/pnpm-workspace.yaml
  git commit -m "chore: setup web workspace directories and config"
  ```

---

### Task 2: Setup `web/shared` Package

**Files:**
- Create: `web/shared/package.json`
- Create: `web/shared/tsconfig.json`
- Create: `web/shared/src/index.ts`
- Create: `web/shared/src/utils/api.ts`
- Create: `web/shared/src/components/ui/mock-button.tsx`

**Interfaces:**
- Consumes: None.
- Produces: Package `@pixelmart/shared-web` xuất bản Axios `api` client và React `MockButton` component.

- [ ] **Step 1: Tạo `web/shared/package.json`**

  Tạo file:
  ```json
  {
    "name": "@pixelmart/shared-web",
    "version": "1.0.0",
    "private": true,
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "dependencies": {
      "axios": "^1.7.9"
    },
    "peerDependencies": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
  ```

- [ ] **Step 2: Tạo cấu hình TypeScript `web/shared/tsconfig.json`**

  Tạo file:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["dom", "dom.iterable", "esnext"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": ["src/**/*"]
  }
  ```

- [ ] **Step 3: Khởi tạo Api Client `web/shared/src/utils/api.ts`**

  Tạo file:
  ```typescript
  import axios from 'axios';

  export const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  ```

- [ ] **Step 4: Tạo component MockButton dùng để verify liên kết `web/shared/src/components/ui/mock-button.tsx`**

  Tạo file:
  ```typescript
  import React from 'react';

  interface MockButtonProps {
    label: string;
    onClick?: () => void;
  }

  export const MockButton: React.FC<MockButtonProps> = ({ label, onClick }) => {
    return (
      <button 
        style={{ padding: '8px 16px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={onClick}
      >
        {label}
      </button>
    );
  };
  ```

- [ ] **Step 5: Tạo entry point `web/shared/src/index.ts`**

  Tạo file:
  ```typescript
  export { api } from './utils/api';
  export { MockButton } from './components/ui/mock-button';
  ```

- [ ] **Step 6: Tạo file unit test để kiểm thử API Client**

  Tạo file `web/shared/src/utils/api.test.js` để chạy test không cần compiler phức tạp:
  ```javascript
  import { api } from './api.ts';
  import assert from 'assert';

  try {
    assert.strictEqual(api.defaults.baseURL, 'http://localhost:8000/api/v1');
    assert.strictEqual(api.defaults.withCredentials, true);
    console.log('✅ API Client config verified successfully!');
  } catch (error) {
    console.error('❌ API Client verification failed:', error);
    process.exit(1);
  }
  ```

- [ ] **Step 7: Chạy file verification test**

  Chạy: `node --import tsx web/shared/src/utils/api.test.js` (hoặc cài tsx nếu chưa có: `pnpm add -g tsx` / `npx tsx web/shared/src/utils/api.test.js`).
  Expected: Log ra `✅ API Client config verified successfully!`.

- [ ] **Step 8: Commit**

  ```bash
  git add web/shared
  git commit -m "feat: setup web/shared library with api client and mock component"
  ```

---

### Task 3: Scaffold Vite Apps (`seller-web` and `admin-web`)

**Files:**
- Create: `web/seller-web/package.json`
- Create: `web/seller-web/vite.config.ts`
- Create: `web/seller-web/index.html`
- Create: `web/seller-web/src/main.tsx`
- Create: `web/seller-web/src/App.tsx`
- Create: `web/admin-web/package.json`
- Create: `web/admin-web/vite.config.ts`
- Create: `web/admin-web/index.html`
- Create: `web/admin-web/src/main.tsx`
- Create: `web/admin-web/src/App.tsx`

**Interfaces:**
- Consumes: React, TypeScript, Vite.
- Produces: 2 ứng dụng Vite chạy ở cổng 3001 (`seller-web`) và 3002 (`admin-web`).

- [ ] **Step 1: Tạo file cấu hình `web/seller-web/package.json`**

  Tạo file:
  ```json
  {
    "name": "seller-web",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3001",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    "devDependencies": {
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "@vitejs/plugin-react": "^4.3.4",
      "typescript": "^5.0.0",
      "vite": "^6.0.0"
    }
  }
  ```

- [ ] **Step 2: Tạo `web/seller-web/vite.config.ts`**

  Tạo file:
  ```typescript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 3001,
    },
  });
  ```

- [ ] **Step 3: Tạo `web/seller-web/index.html`**

  Tạo file:
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>PixelMart Seller Panel</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 4: Tạo file React Entry `web/seller-web/src/main.tsx`**

  Tạo file:
  ```typescript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.tsx';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  ```

- [ ] **Step 5: Tạo component chính `web/seller-web/src/App.tsx`**

  Tạo file:
  ```typescript
  import React from 'react';

  function App() {
    return (
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <h1>🏪 PixelMart Seller Panel</h1>
        <p>Welcome to Seller Dashboard</p>
      </div>
    );
  }

  export default App;
  ```

- [ ] **Step 6: Tạo cấu hình `web/admin-web/package.json`**

  Tạo file:
  ```json
  {
    "name": "admin-web",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3002",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    "devDependencies": {
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "@vitejs/plugin-react": "^4.3.4",
      "typescript": "^5.0.0",
      "vite": "^6.0.0"
    }
  }
  ```

- [ ] **Step 7: Tạo `web/admin-web/vite.config.ts`**

  Tạo file:
  ```typescript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 3002,
    },
  });
  ```

- [ ] **Step 8: Tạo `web/admin-web/index.html`**

  Tạo file:
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>PixelMart Admin Dashboard</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 9: Tạo file React Entry `web/admin-web/src/main.tsx`**

  Tạo file:
  ```typescript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.tsx';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  ```

- [ ] **Step 10: Tạo component chính `web/admin-web/src/App.tsx`**

  Tạo file:
  ```typescript
  import React from 'react';

  function App() {
    return (
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <h1>👑 PixelMart Admin Dashboard</h1>
        <p>Welcome to Admin Dashboard</p>
      </div>
    );
  }

  export default App;
  ```

- [ ] **Step 11: Chạy pnpm install ở web workspace**

  Chạy: `cd web && pnpm install`
  Expected: Link thành công dependencies cho cả 3 apps.

- [ ] **Step 12: Commit**

  ```bash
  git add web/seller-web web/admin-web
  git commit -m "feat: scaffold seller-web and admin-web vite apps"
  ```

---

### Task 4: Link `@pixelmart/shared-web` to All Apps

**Files:**
- Modify: `web/client-web/package.json`
- Modify: `web/seller-web/package.json`
- Modify: `web/admin-web/package.json`
- Modify: `web/client-web/app/page.tsx`
- Modify: `web/seller-web/src/App.tsx`
- Modify: `web/admin-web/src/App.tsx`

**Interfaces:**
- Consumes: `@pixelmart/shared-web`
- Produces: Import và render thành công `MockButton` và log URL của `api` client trong cả 3 website con.

- [ ] **Step 1: Liên kết shared-web vào `web/client-web/package.json`**

  Mở file và thêm `@pixelmart/shared-web` vào phần `"dependencies"`:
  ```json
  "@pixelmart/shared-web": "workspace:*"
  ```

- [ ] **Step 2: Liên kết shared-web vào `web/seller-web/package.json`**

  Mở file và thêm `@pixelmart/shared-web` vào phần `"dependencies"`:
  ```json
  "@pixelmart/shared-web": "workspace:*"
  ```

- [ ] **Step 3: Liên kết shared-web vào `web/admin-web/package.json`**

  Mở file và thêm `@pixelmart/shared-web` vào phần `"dependencies"`:
  ```json
  "@pixelmart/shared-web": "workspace:*"
  ```

- [ ] **Step 4: Chạy pnpm install**

  Chạy: `cd web && pnpm install`
  Expected: pnpm tạo symlink thành công cho `@pixelmart/shared-web` vào các node_modules dự án con.

- [ ] **Step 5: Import và sử dụng trong `web/client-web/app/page.tsx`**

  Mở file và import MockButton:
  ```typescript
  import { MockButton } from '@pixelmart/shared-web';
  ```
  Render component này trên trang chủ để verify hiển thị.

- [ ] **Step 6: Import và sử dụng trong `web/seller-web/src/App.tsx`**

  Thay đổi `web/seller-web/src/App.tsx` thành:
  ```typescript
  import React from 'react';
  import { MockButton, api } from '@pixelmart/shared-web';

  function App() {
    const testApi = () => {
      console.log('Requesting api to:', api.defaults.baseURL);
    };

    return (
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <h1>🏪 PixelMart Seller Panel</h1>
        <p>Welcome to Seller Dashboard</p>
        <MockButton label="Click Seller" onClick={testApi} />
      </div>
    );
  }

  export default App;
  ```

- [ ] **Step 7: Import và sử dụng trong `web/admin-web/src/App.tsx`**

  Thay đổi `web/admin-web/src/App.tsx` thành:
  ```typescript
  import React from 'react';
  import { MockButton, api } from '@pixelmart/shared-web';

  function App() {
    const testApi = () => {
      console.log('Requesting api to:', api.defaults.baseURL);
    };

    return (
      <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
        <h1>👑 PixelMart Admin Dashboard</h1>
        <p>Welcome to Admin Dashboard</p>
        <MockButton label="Click Admin" onClick={testApi} />
      </div>
    );
  }

  export default App;
  ```

- [ ] **Step 8: Verify build & Dev server**

  Chạy đồng thời các dev server trong `web/` để verify:
  - `pnpm --filter client-web dev` (Next.js chạy ở port 3000)
  - `pnpm --filter seller-web dev` (Vite chạy ở port 3001)
  - `pnpm --filter admin-web dev` (Vite chạy ở port 3002)
  Expected: Cả 3 ứng dụng đều render đúng text, không lỗi compile và hiển thị Mock Button màu xanh.

- [ ] **Step 9: Commit**

  ```bash
  git add web/client-web/package.json web/seller-web/package.json web/admin-web/package.json web/client-web/app/page.tsx web/seller-web/src/App.tsx web/admin-web/src/App.tsx
  git commit -m "feat: link shared-web package and import mock elements into apps"
  ```

---

### Task 5: Mobile Workspace Placeholder Setup

**Files:**
- Create: `mobile/pnpm-workspace.yaml`
- Create: `mobile/shared/package.json`
- Create: `mobile/client-mobile/package.json`
- Create: `mobile/delivery-mobile/package.json`

**Interfaces:**
- Consumes: pnpm CLI.
- Produces: Cấu trúc thư mục cho không gian làm việc di động.

- [ ] **Step 1: Tạo `mobile/pnpm-workspace.yaml`**

  Tạo file:
  ```yaml
  packages:
    - 'shared'
    - 'client-mobile'
    - 'delivery-mobile'
  ```

- [ ] **Step 2: Tạo placeholder `mobile/shared/package.json`**

  Tạo file:
  ```json
  {
    "name": "@pixelmart/shared-mobile",
    "version": "1.0.0",
    "private": true,
    "main": "./src/index.js"
  }
  ```

- [ ] **Step 3: Tạo placeholder `mobile/client-mobile/package.json`**

  Tạo file:
  ```json
  {
    "name": "client-mobile",
    "version": "1.0.0",
    "private": true,
    "dependencies": {
      "@pixelmart/shared-mobile": "workspace:*"
    }
  }
  ```

- [ ] **Step 4: Tạo placeholder `mobile/delivery-mobile/package.json`**

  Tạo file:
  ```json
  {
    "name": "delivery-mobile",
    "version": "1.0.0",
    "private": true,
    "dependencies": {
      "@pixelmart/shared-mobile": "workspace:*"
    }
  }
  ```

- [ ] **Step 5: Chạy cài đặt link workspace mobile**

  Chạy: `cd mobile && pnpm install`
  Expected: Chạy thành công mà không có lỗi.

- [ ] **Step 6: Commit**

  ```bash
  git add mobile/
  git commit -m "chore: setup mobile workspace and placeholders"
  ```
