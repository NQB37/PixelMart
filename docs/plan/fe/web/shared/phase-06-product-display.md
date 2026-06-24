# Phase 6: Product Display Implementation Plan - Shared Portal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai các thành phần UI chung (ProductCard, Spinner, Alert) và custom hook `useDebounce` để chia sẻ giữa các cổng thông tin client, seller và admin.

**Architecture:** Các component và hook trong phase này được phân bổ vào các thư mục tương ứng trong gói `@pixelmart/shared-web`: `src/hooks/` cho hooks, `src/components/ui/` cho các atomic UI components và `src/components/shared/` cho các component phức tạp hơn như `ProductCard`. Tất cả đều được export thông qua `src/index.ts`.

**Tech Stack:** React 18+, TypeScript 5+, Jest, React Testing Library.

## Global Constraints

- Môi trường chạy dự án: Node.js 18+
- Phiên bản chính của thư viện: React 18.3+, TypeScript 5.0+
- Thư mục làm việc: `web/shared`
- Toàn bộ component và hook cần đảm bảo clean typing bằng TypeScript.
- Phải áp dụng TDD để kiểm thử hoạt động của hooks và components.
- Không sử dụng bất kỳ placeholder hay "TODO" nào trong mã nguồn.

---

### Task 6.1: Phát triển Custom Hook `useDebounce` (3h)

**Files:**
- Create: `web/shared/src/hooks/useDebounce.ts`
- Test: `web/shared/tests/useDebounce.test.ts`
- Modify: `web/shared/src/index.ts`

**Interfaces:**
- Consumes: React dependency (useState, useEffect)
- Produces: `useDebounce<T>(value: T, delay: number): T` hook giúp trì hoãn việc cập nhật giá trị đầu vào.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/useDebounce.test.ts`. File test này sử dụng fake timers của Jest để mô phỏng sự trễ về thời gian.
```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../src/hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });
    // Vẫn trả về giá trị cũ do chưa hết thời gian debounce
    expect(result.current).toBe('hello');

    // Chạy nhanh thời gian qua 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest web/shared/tests/useDebounce.test.ts`
Expected: FAIL. Không tìm thấy module `../src/hooks/useDebounce`.
```
Cannot find module '../src/hooks/useDebounce' or similar import compilation error
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/src/hooks/useDebounce.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

Cập nhật `web/shared/src/index.ts` để export hook mới:
```typescript
// Thêm vào cuối file index.ts
export { useDebounce } from './hooks/useDebounce';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest web/shared/tests/useDebounce.test.ts`
Expected: PASS
```
PASS  web/shared/tests/useDebounce.test.ts
  useDebounce Hook
    ✓ should return initial value immediately (X ms)
    ✓ should debounce value updates (X ms)
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/hooks/useDebounce.ts web/shared/src/index.ts web/shared/tests/useDebounce.test.ts
git commit -m "feat: implement and export useDebounce hook with tests"
```

---

### Task 6.2: Triển khai Spinner Component (2h)

**Files:**
- Create: `web/shared/src/components/ui/Spinner.tsx`
- Test: `web/shared/tests/Spinner.test.tsx`
- Modify: `web/shared/src/index.ts`

**Interfaces:**
- Consumes: React dependency
- Produces: `Spinner` component hiển thị hiệu ứng xoay loading. Nhận props `size?: 'sm' | 'md' | 'lg'` và `className?: string`.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/Spinner.test.tsx`:
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../src/components/ui/Spinner';

describe('Spinner Component', () => {
  it('renders correctly with default size', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('h-8');
  });

  it('applies correct class for custom sizes', () => {
    const { rerender } = render(<Spinner size="sm" />);
    let spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-4');
    expect(spinner).toHaveClass('h-4');

    rerender(<Spinner size="lg" />);
    spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('h-12');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest web/shared/tests/Spinner.test.tsx`
Expected: FAIL. Lỗi import do component chưa được khai báo.
```
Cannot find module '../src/components/ui/Spinner'
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/src/components/ui/Spinner.tsx`:
```typescript
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      data-testid="spinner"
      className={`animate-spin rounded-full border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent ${sizeClasses[size]} ${className}`}
      role="status"
    />
  );
};
```

Cập nhật `web/shared/src/index.ts` để export Spinner:
```typescript
// Thêm vào cuối file index.ts
export { Spinner } from './components/ui/Spinner';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest web/shared/tests/Spinner.test.tsx`
Expected: PASS
```
PASS  web/shared/tests/Spinner.test.tsx
  Spinner Component
    ✓ renders correctly with default size (X ms)
    ✓ applies correct class for custom sizes (X ms)
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/components/ui/Spinner.tsx web/shared/src/index.ts web/shared/tests/Spinner.test.tsx
git commit -m "feat: implement and export loading Spinner component with tests"
```

---

### Task 6.3: Triển khai Alert Component (2h)

**Files:**
- Create: `web/shared/src/components/ui/Alert.tsx`
- Test: `web/shared/tests/Alert.test.tsx`
- Modify: `web/shared/src/index.ts`

**Interfaces:**
- Consumes: React dependency
- Produces: `Alert` component hiển thị các thông báo: `success` | `error` | `warning` | `info` kèm nút tắt đóng thông báo.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/Alert.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../src/components/ui/Alert';

describe('Alert Component', () => {
  it('renders alert message correctly', () => {
    render(<Alert type="success" message="Success message" />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('applies correct styling classes based on type', () => {
    const { rerender } = render(<Alert type="error" message="Error" />);
    let alertContainer = screen.getByTestId('alert-container');
    expect(alertContainer).toHaveClass('bg-red-50');

    rerender(<Alert type="warning" message="Warning" />);
    alertContainer = screen.getByTestId('alert-container');
    expect(alertContainer).toHaveClass('bg-yellow-50');
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Alert type="info" message="Info" onClose={handleClose} />);
    const closeBtn = screen.getByRole('button', { name: /close alert/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest web/shared/tests/Alert.test.tsx`
Expected: FAIL do component `Alert` chưa được tạo.
```
Cannot find module '../src/components/ui/Alert'
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/src/components/ui/Alert.tsx`:
```typescript
import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  className = '',
}) => {
  const typeClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      data-testid="alert-container"
      className={`p-4 border rounded-md flex items-center justify-between ${typeClasses[type]} ${className}`}
      role="alert"
    >
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-current opacity-70 hover:opacity-100 transition focus:outline-none"
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};
```

Cập nhật `web/shared/src/index.ts` để export Alert:
```typescript
// Thêm vào cuối file index.ts
export { Alert } from './components/ui/Alert';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest web/shared/tests/Alert.test.tsx`
Expected: PASS
```
PASS  web/shared/tests/Alert.test.tsx
  Alert Component
    ✓ renders alert message correctly (X ms)
    ✓ applies correct styling classes based on type (X ms)
    ✓ triggers onClose when close button is clicked (X ms)
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/components/ui/Alert.tsx web/shared/src/index.ts web/shared/tests/Alert.test.tsx
git commit -m "feat: implement and export Alert component with support for styles and closing handler"
```

---

### Task 6.4: Triển khai ProductCard Component (4h)

**Files:**
- Create: `web/shared/src/components/shared/ProductCard.tsx`
- Test: `web/shared/tests/ProductCard.test.tsx`
- Modify: `web/shared/src/index.ts`

**Interfaces:**
- Consumes: React dependency
- Produces: `ProductCard` component để hiển thị chi tiết sản phẩm dưới dạng Card, tính toán phần trăm giảm giá và kích hoạt hàm callback thêm vào giỏ hàng.

- [ ] **Step 1: Write the failing test**

Tạo file `web/shared/tests/ProductCard.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../src/components/shared/ProductCard';

describe('ProductCard Component', () => {
  const defaultProps = {
    id: 'prod-123',
    name: 'Sample Product Name',
    price: 150000,
    imageUrl: 'https://example.com/image.jpg',
    rating: 4.5,
    reviewCount: 20,
    onAddToCart: jest.fn(),
  };

  it('renders product details correctly', () => {
    render(<ProductCard {...defaultProps} />);
    
    expect(screen.getByText('Sample Product Name')).toBeInTheDocument();
    expect(screen.getByAltText('Sample Product Name')).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(screen.getByText('150.000 ₫')).toBeInTheDocument();
    expect(screen.getByText('4.5 (20)')).toBeInTheDocument();
  });

  it('displays discount badge and original price if discounted', () => {
    render(<ProductCard {...defaultProps} originalPrice={200000} />);
    
    expect(screen.getByText('-25%')).toBeInTheDocument();
    expect(screen.getByText('200.000 ₫')).toBeInTheDocument();
  });

  it('triggers onAddToCart handler when Add to Cart button is clicked', () => {
    render(<ProductCard {...defaultProps} />);
    const button = screen.getByRole('button', { name: /thêm vào giỏ/i });
    fireEvent.click(button);
    expect(defaultProps.onAddToCart).toHaveBeenCalledWith('prod-123');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest web/shared/tests/ProductCard.test.tsx`
Expected: FAIL do chưa có file components/shared/ProductCard.tsx.
```
Cannot find module '../src/components/shared/ProductCard'
```

- [ ] **Step 3: Write minimal implementation**

Tạo file `web/shared/src/components/shared/ProductCard.tsx`:
```typescript
import React from 'react';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  onAddToCart?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  imageUrl,
  rating = 0,
  reviewCount = 0,
  onAddToCart,
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(originalPrice)
    : '';

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col h-full">
      <div className="relative pt-[100%] w-full bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 h-10 mb-2">
          {name}
        </h3>

        {rating > 0 && (
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-xs text-gray-600 ml-1 font-medium">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-red-600">{formattedPrice}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={() => onAddToCart(id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded transition focus:outline-none"
            >
              Thêm vào giỏ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

Cập nhật `web/shared/src/index.ts` để export ProductCard:
```typescript
// Thêm vào cuối file index.ts
export { ProductCard } from './components/shared/ProductCard';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest web/shared/tests/ProductCard.test.tsx`
Expected: PASS
```
PASS  web/shared/tests/ProductCard.test.tsx
  ProductCard Component
    ✓ renders product details correctly (X ms)
    ✓ displays discount badge and original price if discounted (X ms)
    ✓ triggers onAddToCart handler when Add to Cart button is clicked (X ms)
```

- [ ] **Step 5: Commit**

```bash
git add web/shared/src/components/shared/ProductCard.tsx web/shared/src/index.ts web/shared/tests/ProductCard.test.tsx
git commit -m "feat: implement and export ProductCard component with responsive design and testing"
```

---

## 🏁 Checklist Hoàn Thành Phase 6

- [ ] Toàn bộ component (`ProductCard`, `Spinner`, `Alert`) và hook (`useDebounce`) đều nằm chính xác tại các thư mục tương ứng trong gói `@pixelmart/shared-web`.
- [ ] Lệnh `npm run test` (hoặc `pnpm test`) chạy không lỗi và vượt qua toàn bộ các bài kiểm thử tương ứng.
- [ ] Định dạng tiền tệ VND được hiển thị đúng định dạng chuẩn Việt Nam (`150.000 ₫`) bằng cách sử dụng `Intl.NumberFormat`.
- [ ] Phần trăm giảm giá được tính toán chính xác và hiển thị ở dạng làm tròn số nguyên (`Math.round`).
- [ ] Tất cả các component/hook được xuất bản thông qua file entry point `src/index.ts`.

## ⚠️ Lỗi Fresher Hay Mắc Phải

1. **Hiển thị lỗi định dạng tiền tệ**: Việc hardcode ký hiệu tiền tệ hoặc dấu phân cách hàng nghìn thay vì dùng `Intl.NumberFormat` sẽ gây lỗi hiển thị khi chuyển đổi Locale/i18n.
2. **Quên làm sạch Timer trong hook**: Trong `useDebounce`, việc thiếu hàm trả về dọn dẹp `clearTimeout(handler)` trong `useEffect` sẽ dẫn tới hiện tượng rò rỉ bộ nhớ (memory leaks) khi component unmount hoặc value thay đổi liên tục.
3. **Kiểm thử bất đồng bộ sai cách**: Khi viết test cho `useDebounce`, không bọc lệnh cập nhật trạng thái hoặc dịch chuyển thời gian (`advanceTimersByTime`) bên trong hàm `act(() => { ... })` dẫn đến các cảnh báo lỗi của React Testing Library.
4. **Không tối ưu ảnh thẻ sản phẩm**: Sử dụng ảnh trực tiếp mà không có padding ratio (`pt-[100%]`) hoặc class fit (`object-cover`) khiến hình ảnh sản phẩm hiển thị bị méo hoặc sai tỷ lệ trên các thiết bị.
