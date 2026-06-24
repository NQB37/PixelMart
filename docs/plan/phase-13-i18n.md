# 🌐 PHASE 13: Internationalization (i18n) — Vietnamese + English

> **Prerequisite:** Phase 11+ hoàn thành.

---

## 🎯 MVP Của Phase Này

- Toggle ngôn ngữ Vi ↔ En ở header
- Tất cả UI text dịch được (labels, buttons, messages, errors)
- URL prefix theo locale: `/vi/products/...` và `/en/products/...`
- Backend error messages trả về đúng ngôn ngữ
- Locale preference lưu vào cookie (nhớ khi quay lại)
- Content động (tên sản phẩm, mô tả) giữ nguyên ngôn ngữ gốc (không dịch auto)

---

## 🗄️ Database Changes (MVP)

Phase này **không có bảng mới** nào được tạo. Trong phiên bản MVP, chúng ta chỉ quốc tế hóa (localization) các thành phần giao diện tĩnh (UI text, labels, buttons) và các tin nhắn lỗi tĩnh từ server. Dữ liệu động do người dùng nhập (như tên sản phẩm, mô tả sản phẩm, tên shop) sẽ được hiển thị nguyên bản theo ngôn ngữ họ đã lưu vào DB từ trước.

---

## 📋 Task Breakdown

### Task 13.1: Frontend i18n Setup với next-intl (3-4h)

```bash
cd web/client-web
pnpm add next-intl
```

#### Cấu hình Next.js cho i18n routing:

```
web/client-web/
├── messages/
│   ├── vi.json              # Vietnamese translations
│   └── en.json              # English translations
├── i18n/
│   ├── request.ts           # next-intl request config
│   └── routing.ts           # Locale routing config
├── middleware.ts             # Updated: locale detection + redirect
└── app/
    └── [locale]/             # ALL pages wrapped in locale segment
        ├── (storefront)/
        └── (auth)/
```

#### Translation files structure:

```json
// messages/vi.json
{
  "common": {
    "home": "Trang chủ",
    "search": "Tìm kiếm",
    "cart": "Giỏ hàng",
    "login": "Đăng nhập",
    "register": "Đăng ký",
    "logout": "Đăng xuất",
    "loading": "Đang tải...",
    "noResults": "Không tìm thấy kết quả"
  },
  "product": {
    "addToCart": "Thêm vào giỏ",
    "buyNow": "Mua ngay",
    "outOfStock": "Hết hàng",
    "inStock": "Còn {count} sản phẩm",
    "soldCount": "Đã bán {count}",
    "freeShipping": "Miễn phí vận chuyển",
    "priceFrom": "Từ {price}"
  },
  "cart": {
    "title": "Giỏ hàng của bạn",
    "empty": "Giỏ hàng trống",
    "total": "Tổng cộng",
    "checkout": "Tiến hành đặt hàng",
    "quantity": "Số lượng"
  },
  "order": {
    "title": "Đơn hàng",
    "status": {
      "PENDING": "Chờ xác nhận",
      "CONFIRMED": "Đã xác nhận",
      "SHIPPING": "Đang giao",
      "DELIVERED": "Đã giao",
      "CANCELLED": "Đã hủy"
    }
  },
  "auth": {
    "loginTitle": "Đăng nhập vào PixelMart",
    "registerTitle": "Tạo tài khoản mới",
    "emailPlaceholder": "Nhập email",
    "passwordPlaceholder": "Nhập mật khẩu",
    "forgotPassword": "Quên mật khẩu?",
    "noAccount": "Chưa có tài khoản?",
    "hasAccount": "Đã có tài khoản?"
  },
  "errors": {
    "required": "Trường này là bắt buộc",
    "invalidEmail": "Email không hợp lệ",
    "serverError": "Đã xảy ra lỗi. Vui lòng thử lại."
  }
}
```

```json
// messages/en.json  
{
  "common": {
    "home": "Home",
    "search": "Search",
    "cart": "Cart",
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "loading": "Loading...",
    "noResults": "No results found"
  },
  "product": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "outOfStock": "Out of Stock",
    "inStock": "{count} in stock",
    "soldCount": "{count} sold",
    "freeShipping": "Free Shipping",
    "priceFrom": "From {price}"
  }
}
```

### Task 13.2: Component Migration (4-5h)

Thay tất cả hardcoded text bằng translation keys:

```typescript
// TRƯỚC (hardcoded):
<Button>Thêm vào giỏ</Button>

// SAU (i18n):
import { useTranslations } from 'next-intl';

export function AddToCartButton() {
  const t = useTranslations('product');
  return <Button>{t('addToCart')}</Button>;
}
```

**Lưu ý quan trọng:**
- Server Components: dùng `getTranslations()` (async)
- Client Components: dùng `useTranslations()` (hook)
- Format số/tiền: dùng `useFormatter()` hoặc `Intl.NumberFormat`

### Task 13.3: Backend i18n — Error Messages (2-3h)

```bash
cd server
npm install i18next
```

Backend nhận locale từ:
1. Header `Accept-Language` (auto từ browser)
2. Query param `?lang=en`
3. Cookie `locale`

Error messages trả về đúng ngôn ngữ:
```typescript
// Thay vì: throw ApiError.badRequest('Sản phẩm hết hàng')
// Dùng: throw ApiError.badRequest(t('product.outOfStock'))
```

### Task 13.4: Language Switcher UI (1-2h)

- Dropdown hoặc toggle ở header: 🇻🇳 VI / 🇬🇧 EN
- Bấm chuyển → đổi URL locale prefix + lưu cookie
- Currency format thay đổi theo locale (₫ vs $)

---

## ⚠️ Lỗi fresher hay mắc:
- **Hardcode text rải rác:** Sau khi setup i18n, vẫn còn sót text hardcoded ở components ít dùng. Grep `"` trong JSX để tìm.
- **Quên format số:** `1000000` hiển thị thành `1,000,000` (EN) vs `1.000.000` (VI). Dùng `Intl.NumberFormat` với đúng locale.
- **Dịch content động:** Tên sản phẩm "iPhone 15" KHÔNG CẦN dịch. Chỉ dịch UI labels. Nếu seller muốn tên sản phẩm đa ngôn ngữ → cần thiết kế DB phức tạp hơn (future feature).

---

## 🏁 Checklist Cuối Phase 13

- [ ] Language switcher hoạt động (Vi ↔ En)
- [ ] URL routing: `/vi/products/...`, `/en/products/...`
- [ ] Tất cả UI labels dịch đúng
- [ ] Backend error messages theo locale
- [ ] Number/currency format đúng locale
- [ ] Locale preference lưu cookie
- [ ] SEO: `<html lang="vi">`, alternate hreflang tags
- [ ] Commit: "feat: internationalization with Vietnamese and English support"
