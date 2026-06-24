# Phase 1: Foundation Setup Implementation Plan - Shared Portal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khởi tạo package `@pixelmart/shared-web` dùng chung cho không gian Web, cấu hình TypeScript, Jest testing environment, Axios client với baseURL và credentials, và một MockButton để kiểm thử UI component.

**Architecture:** Gói `@pixelmart/shared-web` được cấu trúc như một local npm package nằm trong pnpm workspace của Web (`web/shared`). Nó đóng vai trò xuất bản (export) các core UI components, hooks và utils (như Axios instance) dùng chung cho các ứng dụng `client-web`, `seller-web`, và `admin-web`.

**Tech Stack:** React 18+, TypeScript 5+, Axios 1.x, Jest, ts-jest, React Testing Library.

## Global Constraints

- Môi trường chạy dự án: Node.js 18+
- Phiên bản chính của thư viện: React 18.3+, TypeScript 5.0+, Axios 1.7+
- Thư mục làm việc: `web/shared`
- Tên package: `@pixelmart/shared-web`
- Phải tuân thủ quy trình kiểm thử TDD (Test-Driven Development): Viết test lỗi trước, viết code sau, chạy lại test để đảm bảo thành công.
- Không sử dụng bất kỳ placeholder hay "TODO" nào trong mã nguồn.

---

### Task 1.1: Khởi tạo package.json, tsconfig.json & Jest configuration (4h)

**Files:**
- Create: `web/shared/package.json`
- Create: `web/shared/tsconfig.json`
- Create: `web/shared/babel.config.js`
- Create: `web/shared/jest.config.js`
- Create: `web/shared/tests/setupTests.js`
- Create: `web/shared/src/index.ts`
- Test: `web/shared/tests/package.test.js`

**Interfaces:**
- Consumes: Node.js environment
- Produces: `@pixelmart/shared-web` npm package configuration, TypeScript compiler configuration, and Jest testing framework setup.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/package.test.js` để kiểm tra cấu trúc cơ bản của package trước khi nó được khởi tạo.
```javascript
const assert = require('assert');
const fs = require('fs');
const path = require('path');

try {
  const pkgPath = path.resolve(__dirname, '../package.json');
  assert.ok(fs.existsSync(pkgPath), 'package.json does not exist');
  
  const pkg = require(pkgPath);
  assert.strictEqual(pkg.name, '@pixelmart/shared-web');
  assert.strictEqual(pkg.main, 'dist/index.js');
  assert.ok(pkg.peerDependencies && pkg.peerDependencies.react, 'React peer dependency missing');
  
  console.log('✅ package.test.js passed!');
} catch (err) {
  console.error('❌ package.test.js failed:', err.message);
  process.exit(1);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/shared/tests/package.test.js`
Expected: FAIL với lỗi không tìm thấy file `package.json` hoặc thư mục `tests` chưa tồn tại.
```
Error: Cannot find module '../package.json'
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/package.json`:
```json
{
  "name": "@pixelmart/shared-web",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "dependencies": {
    "axios": "^1.7.2"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@babel/preset-env": "^7.24.0",
    "@babel/preset-react": "^7.24.0",
    "@babel/preset-typescript": "^7.24.0",
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@types/jest": "^29.5.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "babel-jest": "^29.7.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

Tạo file `web/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests/**/*", "**/*.test.ts", "**/*.test.tsx"]
}
```

Tạo file `web/shared/babel.config.js`:
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
```

Tạo file `web/shared/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};
```

Tạo file `web/shared/tests/setupTests.js`:
```javascript
require('@testing-library/jest-dom');
```

Tạo file `web/shared/src/index.ts`:
```typescript
// Entry point của shared library
export const VERSION = '1.0.0';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/shared/tests/package.test.js`
Expected: PASS
```
✅ package.test.js passed!
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/package.json web/shared/tsconfig.json web/shared/babel.config.js web/shared/jest.config.js web/shared/tests/setupTests.js web/shared/src/index.ts web/shared/tests/package.test.js
git commit -m "chore: initialize shared-web library setup and package configurations"
```

---

### Task 1.2: Cấu hình Axios Client Instance (`src/utils/api.ts`) & Kiểm thử cấu hình (3h)

**Files:**
- Create: `web/shared/src/utils/api.ts`
- Test: `web/shared/tests/api.test.js`
- Modify: `web/shared/src/index.ts`

**Interfaces:**
- Consumes: Axios dependency
- Produces: `api` - Axios instance cấu hình sẵn `baseURL` và `withCredentials: true`.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/api.test.js`. Test này sẽ đăng ký `ts-node` để đọc file TypeScript trực tiếp và kiểm tra Axios instance có được cấu hình đúng đắn không.
```javascript
const assert = require('assert');
require('ts-node').register({ transpileOnly: true });

try {
  const { api } = require('../src/utils/api.ts');
  
  assert.ok(api, 'Axios API client instance should be exported');
  assert.strictEqual(api.defaults.baseURL, 'http://localhost:8000/api/v1');
  assert.strictEqual(api.defaults.withCredentials, true);
  
  console.log('✅ api.test.js passed successfully!');
} catch (err) {
  console.error('❌ api.test.js failed:', err.message);
  process.exit(1);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node web/shared/tests/api.test.js`
Expected: FAIL với lỗi không tìm thấy module `../src/utils/api.ts`.
```
Error: Cannot find module '../src/utils/api.ts'
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/src/utils/api.ts`:
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
});
```

Cập nhật `web/shared/src/index.ts` để export `api`:
```typescript
export const VERSION = '1.0.0';
export { api } from './utils/api';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node web/shared/tests/api.test.js`
Expected: PASS
```
✅ api.test.js passed successfully!
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/utils/api.ts web/shared/src/index.ts web/shared/tests/api.test.js
git commit -m "feat: add axios api client configured with baseURL and credentials"
```

---

### Task 1.3: Phát triển MockButton Component (`src/components/ui/MockButton.tsx`) & Kiểm thử UI Component (3h)

**Files:**
- Create: `web/shared/src/components/ui/MockButton.tsx`
- Test: `web/shared/tests/MockButton.test.tsx`
- Modify: `web/shared/src/index.ts`

**Interfaces:**
- Consumes: React dependency
- Produces: `MockButton` component nhận props chuẩn của HTML button (`React.ButtonHTMLAttributes<HTMLButtonElement>`).

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/MockButton.test.tsx` sử dụng React Testing Library.
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockButton } from '../src/components/ui/MockButton';

describe('MockButton Component', () => {
  it('renders button with children text', () => {
    render(<MockButton>Click me</MockButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<MockButton onClick={handleClick}>Click me</MockButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className and default button classes', () => {
    render(<MockButton className="custom-class">Click me</MockButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest web/shared/tests/MockButton.test.tsx`
Expected: FAIL do component `MockButton` chưa được định nghĩa.
```
Cannot find module '../src/components/ui/MockButton' or similar import compilation error
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/src/components/ui/MockButton.tsx`:
```typescript
import React from 'react';

export interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const MockButton: React.FC<MockButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  const defaultClasses = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition';
  const combinedClasses = `${defaultClasses} ${className}`.trim();

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
```

Cập nhật `web/shared/src/index.ts` để export `MockButton`:
```typescript
export const VERSION = '1.0.0';
export { api } from './utils/api';
export { MockButton } from './components/ui/MockButton';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest web/shared/tests/MockButton.test.tsx`
Expected: PASS
```
PASS  web/shared/tests/MockButton.test.tsx
  MockButton Component
    ✓ renders button with children text (X ms)
    ✓ triggers onClick handler when clicked (X ms)
    ✓ applies custom className and default button classes (X ms)
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/components/ui/MockButton.tsx web/shared/src/index.ts web/shared/tests/MockButton.test.tsx
git commit -m "feat: implement MockButton component and export from shared index"
```

---

## 🏁 Checklist Hoàn Thành Phase 1

- [ ] Dự án thư viện `@pixelmart/shared-web` nằm chính xác tại `web/shared/`.
- [ ] Lệnh `npm run test` (hoặc `pnpm test`) chạy không lỗi và vượt qua toàn bộ 3 file test: `package.test.js`, `api.test.js`, và `MockButton.test.tsx`.
- [ ] Thư mục build `dist` chứa code JS và file declaration `.d.ts` khi chạy `npm run build`.
- [ ] `api` instance có đúng `baseURL: http://localhost:8000/api/v1` và `withCredentials: true`.

## ⚠️ Lỗi Fresher Hay Mắc Phải

1. **Import không đúng path của React**: Quên import `React` hoặc cấu hình `tsconfig.json` thiếu `"jsx": "react-jsx"` gây ra lỗi JSX compiler.
2. **Thiếu dependencies**: Quên cài đặt `@types/react` hoặc các packages phụ trợ kiểm thử trong `devDependencies`.
3. **Cấu hình sai `withCredentials`**: Việc thiếu option này sẽ khiến browser chặn truyền JWT Cookies trong các request CORS giữa client (port 3000) và server (port 8000).
4. **Không xuất bản các module trong index.ts**: Triển khai các helper và component mới nhưng quên cập nhật file entry point `src/index.ts`, dẫn đến việc các package khác trong workspace không thể import được.
