# Design System — E-commerce (Mint Fresh)

> **Direction:** Trẻ trung · Tối giản · Hiện đại · Năng động.
> **Màu chủ đạo:** Mint green (bạc hà). Toàn bộ palette xoay quanh mint, cân bằng bởi một sắc **coral** làm điểm nhấn khuyến mãi.
> **Stack:** Tailwind CSS **v4** + shadcn/ui. Mọi token màu là CSS variable ở dạng **OKLCH** (một _màu hoàn chỉnh_ `oklch(L C H)`, không phải triplet kênh HSL) — dùng trực tiếp qua `var(--token)`, **không** bọc `hsl()`.
>
> **Nguồn chuẩn (source of truth):** [`website/shared/src/styles/theme.css`](website/shared/src/styles/theme.css). Tài liệu này phản chiếu đúng các giá trị trong file đó — sửa token thì sửa cả hai.

**Vì sao OKLCH thay vì HSL?** Đồng đều về mặt thị giác (đổi `L` là đổi độ sáng cảm nhận thật, không lệch như HSL), gamut rộng hơn cho mint tươi, và ở Tailwind v4 modifier opacity (`bg-primary/90`) vẫn chạy qua `color-mix()` dù giá trị là `oklch()`.

---

## 0. Nguyên tắc nền tảng

| Nguyên tắc | Áp dụng |
|---|---|
| **Mint làm neo thương hiệu, 2 vai trò** | `primary` = mint đậm (jade) đủ tương phản để chữ trắng đạt WCAG AA; nền/`secondary`/`accent` = mint pastel nhạt. Cảm giác tổng thể luôn "minty" nhưng nút bấm vẫn đọc được. |
| **Một điểm nhấn duy nhất: Coral** | Mint (H≈162) và coral (H≈35) gần bù nhau trên vòng màu → tương phản tươi, trẻ. Chỉ dùng cho **Sale badge / Banner ưu đãi**, không lạm dụng. |
| **Tối giản = kỷ luật khoảng trắng** | Ưu tiên spacing & typography chuẩn xác hơn là hiệu ứng. Bo góc mềm (`--radius: 0.75rem`), viền mảnh, đổ bóng nhẹ. |

---

## 1. Theme Tokens (chuẩn shadcn/ui, OKLCH)

Bảng so sánh trực tiếp **Light (`:root`)** ↔ **Dark (`.dark`)**. Giá trị ở dạng `oklch(L C H)`.

| Token | Light `:root` | Dark `.dark` | Vai trò |
|---|---|---|---|
| `--background` | `oklch(0.99 0.006 165)` | `oklch(0.19 0.02 175)` | Nền trang (ám mint rất nhẹ) |
| `--foreground` | `oklch(0.25 0.02 170)` | `oklch(0.96 0.01 165)` | Chữ chính |
| `--card` | `oklch(1 0 0)` | `oklch(0.22 0.02 173)` | Nền product card / panel |
| `--card-foreground` | `oklch(0.25 0.02 170)` | `oklch(0.96 0.01 165)` | Chữ trên card |
| `--popover` | `oklch(1 0 0)` | `oklch(0.21 0.02 173)` | Dropdown, tooltip, combobox |
| `--popover-foreground` | `oklch(0.25 0.02 170)` | `oklch(0.96 0.01 165)` | Chữ trong popover |
| `--primary` | `oklch(0.54 0.12 162)` | `oklch(0.78 0.15 165)` | **Mint thương hiệu** — nút chính, link, active |
| `--primary-foreground` | `oklch(0.99 0.01 160)` | `oklch(0.22 0.05 170)` | Chữ/icon trên nền primary |
| `--secondary` | `oklch(0.95 0.035 165)` | `oklch(0.28 0.025 172)` | Nút phụ, chip, nền mint nhạt |
| `--secondary-foreground` | `oklch(0.4 0.06 165)` | `oklch(0.93 0.015 165)` | Chữ trên secondary |
| `--muted` | `oklch(0.97 0.012 165)` | `oklch(0.26 0.02 172)` | Nền phụ, skeleton, hàng ngăn cách |
| `--muted-foreground` | `oklch(0.55 0.02 170)` | `oklch(0.7 0.025 168)` | Chữ phụ, caption, placeholder |
| `--accent` | `oklch(0.93 0.05 160)` | `oklch(0.3 0.03 170)` | Hover ghost/menu, nền nhấn nhẹ |
| `--accent-foreground` | `oklch(0.4 0.06 165)` | `oklch(0.96 0.01 165)` | Chữ trên accent |
| `--destructive` | `oklch(0.6 0.22 25)` | `oklch(0.62 0.2 25)` | Xóa, lỗi, cảnh báo |
| `--destructive-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Chữ trên destructive |
| `--border` | `oklch(0.92 0.015 165)` | `oklch(0.3 0.02 172)` | Viền card, divider |
| `--input` | `oklch(0.92 0.015 165)` | `oklch(0.32 0.02 172)` | Viền field |
| `--ring` | `oklch(0.54 0.12 162)` | `oklch(0.78 0.15 165)` | Focus ring (mint) |
| `--radius` | `0.75rem` | `0.75rem` | Bán kính bo góc gốc |

### Token mở rộng (ngoài shadcn) — điểm nhấn thương mại

| Token | Light `:root` | Dark `.dark` | Vai trò |
|---|---|---|---|
| `--highlight` | `oklch(0.66 0.18 35)` | `oklch(0.7 0.16 38)` | **Coral** — Sale badge, giá giảm, nhãn "HOT" |
| `--highlight-foreground` | `oklch(0.99 0 0)` | `oklch(0.22 0.04 40)` | Chữ trên coral (in đậm) |
| `--success` | `oklch(0.62 0.15 155)` | `oklch(0.72 0.15 155)` | "Còn hàng", đặt hàng thành công |
| `--warning` | `oklch(0.78 0.15 80)` | `oklch(0.8 0.15 82)` | "Sắp hết hàng", chờ xử lý |

> **Ghi chú tương phản:** `primary` light (L≈0.54) đạt ≈4.5:1 với chữ trắng (AA cho text thường). `highlight` (coral) ≈4:1 — **luôn dùng chữ trắng in đậm** cho badge. Đừng dùng mint pastel (`secondary`/`accent`) làm nền cho chữ trắng.

### CSS token — trích từ `website/shared/src/styles/theme.css`

```css
:root {
  --radius: 0.75rem;
  --background: oklch(0.99 0.006 165);
  --foreground: oklch(0.25 0.02 170);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.25 0.02 170);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.25 0.02 170);
  --primary: oklch(0.54 0.12 162); /* deep mint — AA on white */
  --primary-foreground: oklch(0.99 0.01 160);
  --secondary: oklch(0.95 0.035 165);
  --secondary-foreground: oklch(0.4 0.06 165);
  --muted: oklch(0.97 0.012 165);
  --muted-foreground: oklch(0.55 0.02 170);
  --accent: oklch(0.93 0.05 160);
  --accent-foreground: oklch(0.4 0.06 165);
  --destructive: oklch(0.6 0.22 25);
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.92 0.015 165);
  --input: oklch(0.92 0.015 165);
  --ring: oklch(0.54 0.12 162);

  /* commerce accents */
  --highlight: oklch(0.66 0.18 35); /* coral */
  --highlight-foreground: oklch(0.99 0 0);
  --success: oklch(0.62 0.15 155);
  --warning: oklch(0.78 0.15 80);
}

.dark {
  --background: oklch(0.19 0.02 175);
  --foreground: oklch(0.96 0.01 165);
  --card: oklch(0.22 0.02 173);
  --card-foreground: oklch(0.96 0.01 165);
  --popover: oklch(0.21 0.02 173);
  --popover-foreground: oklch(0.96 0.01 165);
  --primary: oklch(0.78 0.15 165); /* bright mint on dark */
  --primary-foreground: oklch(0.22 0.05 170);
  --secondary: oklch(0.28 0.025 172);
  --secondary-foreground: oklch(0.93 0.015 165);
  --muted: oklch(0.26 0.02 172);
  --muted-foreground: oklch(0.7 0.025 168);
  --accent: oklch(0.3 0.03 170);
  --accent-foreground: oklch(0.96 0.01 165);
  --destructive: oklch(0.62 0.2 25);
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.3 0.02 172);
  --input: oklch(0.32 0.02 172);
  --ring: oklch(0.78 0.15 165);

  --highlight: oklch(0.7 0.16 38);
  --highlight-foreground: oklch(0.22 0.04 40);
  --success: oklch(0.72 0.15 155);
  --warning: oklch(0.8 0.15 82);
}
```

---

## 2. Gradients (dải màu trẻ trung)

Dùng hoàn toàn class Tailwind. `from-primary` / `to-highlight`… hoạt động được vì các token đã map thành màu trong `@theme inline` (mục 6). `via-*` / `to-*` dùng thang màu Tailwind gần với mint (emerald / teal) để chuyển mượt.

| # | Tên | Class Tailwind | Dùng cho |
|---|---|---|---|
| 1 | **Mint Flow** (mát, tươi) | `bg-gradient-to-br from-primary via-emerald-400 to-teal-300` | Banner ưu đãi, hero, section CTA |
| 2 | **Sunset Pop** (ấm, hút mắt) | `bg-gradient-to-r from-highlight to-rose-400` | Tag giảm giá, Flash Sale, nhãn "HOT" |
| 3 | **Buy Now** (bóng, dứt khoát) | `bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-500 hover:to-primary` | Nút "Mua ngay", "Thanh toán" |

```tsx
{/* 1. Banner ưu đãi */}
<div className="bg-gradient-to-br from-primary via-emerald-400 to-teal-300 text-white rounded-xl p-8">
  <h2 className="font-display text-3xl font-bold">Sale cuối tuần · giảm đến 50%</h2>
</div>

{/* 2. Sale badge */}
<span className="bg-gradient-to-r from-highlight to-rose-400 text-white font-semibold text-xs
                 uppercase tracking-wide rounded-md px-2 py-1">
  -30%
</span>

{/* 3. Nút Mua ngay */}
<button className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground
                   hover:from-emerald-500 hover:to-primary transition-colors
                   rounded-lg px-6 py-3 font-semibold shadow-sm shadow-primary/20">
  Mua ngay
</button>
```

> Chỉ dùng **một** gradient nổi bật trên mỗi màn hình. Text trên gradient luôn màu trắng, in đậm.

---

## 3. Typography & Font Scale

**Cặp font đề xuất (có chủ đích):**

| Vai trò | Font | Lý do |
|---|---|---|
| Display (heading, giá, nút) | **Plus Jakarta Sans** | Geometric bo tròn → trẻ trung, thân thiện; hợp tông mint. Dùng weight 600–800, tiết chế. |
| Body (mô tả, form, meta) | **Inter** | Trung tính, dễ đọc ở size nhỏ, hỗ trợ số tốt. |
| Numeric *(tùy chọn)* | **Geist Mono** | Cho giá tiền / SKU / mã đơn — hoặc dùng Inter + `tabular-nums` để số thẳng cột. |

Font được nạp qua Google Fonts `@import` ở đầu mỗi entry CSS (`client/app/globals.css`, `admin|vendor/src/index.css`); token font khai báo trong `@theme inline` của `theme.css`:

```css
/* trong @theme inline (theme.css) */
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-display: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
```

`h1–h6` mặc định dùng `font-display`; body dùng `font-sans`.

**Bảng font scale → thành phần e-commerce:**

| Class | px / line-height | Weight gợi ý | Thành phần thực tế |
|---|---|---|---|
| `text-xs` | 12 / 16 | 500 | Badge, caption, breadcrumb, "Đã bán 1.2k", nhãn thuộc tính |
| `text-sm` | 14 / 20 | 400–500 | Thông tin phụ sản phẩm, helper form, meta review, footer |
| `text-base` | 16 / 24 | 400 | Body chính, **mô tả chi tiết sản phẩm**, input |
| `text-lg` | 18 / 28 | 600 | **Tên sản phẩm trên card**, tiêu đề phụ |
| `text-xl` | 20 / 28 | 700 | **Giá hiện tại trên card**, tiêu đề khối |
| `text-2xl` | 24 / 32 | 700 | **Tên sản phẩm ở trang chi tiết (PDP)**, tiêu đề danh mục |
| `text-3xl` | 30 / 36 | 800 | Tiêu đề trang, **giá chính ở PDP** |
| `text-4xl` | 36 / 40 | 800 | Hero heading (mobile) |
| `text-5xl` | 48 / 1 | 800 | Hero heading (desktop), tiêu đề chiến dịch |

```tsx
<h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Tai nghe Gaming Pro</h1>
<p  className="text-base text-muted-foreground">Mô tả chi tiết sản phẩm…</p>
{/* Giá: dùng tabular-nums để không nhảy cột */}
<span className="font-display text-3xl font-extrabold text-primary tabular-nums">1.290.000₫</span>
<span className="text-sm text-muted-foreground line-through tabular-nums">1.890.000₫</span>
```

---

## 4. Border Radius System

Biến gốc `--radius: 0.75rem` (12px) → mềm mại, trẻ trung. Các cấp kế thừa tự động qua `calc()`.

| Tailwind class | Giá trị | Dùng cho |
|---|---|---|
| `rounded-sm` | `calc(var(--radius) - 4px)` = 8px | Badge, chip, tag nhỏ |
| `rounded-md` | `calc(var(--radius) - 2px)` = 10px | Input, button, dropdown item |
| `rounded-lg` | `var(--radius)` = 12px | **Product card**, panel, dialog |
| `rounded-xl` | `calc(var(--radius) + 4px)` = 16px | Banner, hero, modal lớn |
| `rounded-full` | `9999px` | Avatar, icon button, pill filter |

---

## 5. Iconography & Spacing Grid

### Icon — **Lucide React**

| Thuộc tính | Giá trị | Ghi chú |
|---|---|---|
| Thư viện | `lucide-react` | Đồng bộ, nét mảnh, hợp tối giản |
| `strokeWidth` | **1.5** (mặc định 2) | 1.5 = thanh thoát, hiện đại; 2 cho icon rất nhỏ |
| Kích thước | 16 (inline) · 20 (nút/nav) · 24 (feature/empty state) | Khớp với type scale |
| Màu | `text-foreground` / `text-muted-foreground`; `text-primary` khi active | Icon dùng `currentColor` |

```tsx
import { ShoppingCart } from "lucide-react";
<ShoppingCart className="size-5 text-muted-foreground" strokeWidth={1.5} />
```

### Spacing scale (base 4px của Tailwind)

| Ngữ cảnh | Class | Giá trị |
|---|---|---|
| Container trang | `max-w-7xl mx-auto px-4 md:px-6 lg:px-8` | 1280px, padding 16→32px |
| Khoảng cách giữa section | `py-12 md:py-16 lg:py-24` | 48 → 96px |
| Grid product card | `grid gap-4 md:gap-6` | 16 → 24px |
| Padding trong card | `p-4` | 16px |
| Khoảng cách tiêu đề ↔ nội dung | `space-y-2` / `space-y-4` | 8 / 16px |
| Gap trong nút (icon + text) | `gap-2` | 8px |

```tsx
<section className="py-12 md:py-16">
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {/* product cards */}
    </div>
  </div>
</section>
```

---

## 6. Cấu hình Tailwind + shadcn/ui

### 6a. Tailwind v4 (dự án dùng cái này) — `@theme inline` trong `theme.css`

Vì token là `oklch()` hoàn chỉnh, map **thẳng** `var(--x)` — **không** bọc `hsl()`. Trích từ `website/shared/src/styles/theme.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
}
```

Opacity modifier (`bg-primary/90`, `text-highlight/70`) chạy được vì Tailwind v4 dùng `color-mix()` — không cần tách kênh như HSL.

### 6b. Nếu dùng Tailwind v3 — `tailwind.config.js`

Với OKLCH hoàn chỉnh, map `var(--x)` trực tiếp:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        highlight: { DEFAULT: "var(--highlight)", foreground: "var(--highlight-foreground)" },
        success: "var(--success)",
        warning: "var(--warning)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};
```

> **Lưu ý v3:** khi color là `oklch()` hoàn chỉnh (không phải channel triplet), modifier opacity `bg-primary/90` **không** tự chạy trên Tailwind v3 — cần `color-mix()` thủ công hoặc tách kênh. Dự án đang ở v4 nên không vướng.

---

## 7. Ví dụ Product Card (ráp mọi token)

```tsx
<article className="group bg-card text-card-foreground rounded-lg border border-border
                    overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10">
  <div className="relative aspect-square bg-muted">
    <img src="..." alt="" className="size-full object-cover" />
    <span className="absolute left-2 top-2 bg-highlight text-highlight-foreground
                     text-xs font-semibold uppercase rounded-sm px-2 py-0.5">-30%</span>
  </div>
  <div className="p-4 space-y-2">
    <h3 className="font-display text-lg font-semibold line-clamp-2">Tên sản phẩm</h3>
    <p className="text-sm text-muted-foreground">Danh mục</p>
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-bold text-primary tabular-nums">890.000₫</span>
      <span className="text-sm text-muted-foreground line-through tabular-nums">1.290.000₫</span>
    </div>
    <button className="w-full mt-2 bg-primary text-primary-foreground rounded-md py-2.5
                       font-semibold hover:bg-primary/90 transition-colors">
      Thêm vào giỏ
    </button>
  </div>
</article>
```

---

### Checklist "quality floor"
- [ ] Chữ thường trên `primary`/`highlight` đạt tương phản ≥ 4.5:1 (đã tính sẵn ở token).
- [ ] Focus nhìn thấy được: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- [ ] Tôn trọng `prefers-reduced-motion` cho mọi transition/animation.
- [ ] Responsive: grid 2 cột (mobile) → 4 cột (desktop); container không tràn ngang.
