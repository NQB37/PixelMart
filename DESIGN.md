# Design System — E-commerce (Mint Fresh)

> **Direction:** Trẻ trung · Tối giản · Hiện đại · Năng động.
> **Màu chủ đạo:** Mint green (bạc hà). Toàn bộ palette xoay quanh mint, cân bằng bởi một sắc **coral** làm điểm nhấn khuyến mãi.
> **Stack:** Tailwind CSS + shadcn/ui. Mọi token màu là **CSS variable ở dạng HSL nguyên bản** (`H S% L%`), đúng chuẩn shadcn để dùng qua `hsl(var(--token))`.

---

## 0. Nguyên tắc nền tảng

| Nguyên tắc | Áp dụng |
|---|---|
| **Mint làm neo thương hiệu, 2 vai trò** | `primary` = mint đậm (jade) đủ tương phản để chữ trắng đạt WCAG AA; nền/`secondary`/`accent` = mint pastel nhạt. Cảm giác tổng thể luôn "minty" nhưng nút bấm vẫn đọc được. |
| **Một điểm nhấn duy nhất: Coral** | Mint (~160°) và coral (~11°) gần bù nhau trên vòng màu → tương phản tươi, trẻ. Chỉ dùng cho **Sale badge / Banner ưu đãi**, không lạm dụng. |
| **Tối giản = kỷ luật khoảng trắng** | Ưu tiên spacing & typography chuẩn xác hơn là hiệu ứng. Bo góc mềm (`--radius: 0.75rem`), viền mảnh, đổ bóng nhẹ. |

---

## 1. Theme Tokens (chuẩn shadcn/ui)

Bảng so sánh trực tiếp **Light (`:root`)** ↔ **Dark (`.dark`)**. Giá trị ở dạng HSL nguyên bản.

| Token | Light `:root` | Dark `.dark` | Vai trò |
|---|---|---|---|
| `--background` | `150 30% 99%` | `170 28% 8%` | Nền trang (ám mint rất nhẹ) |
| `--foreground` | `165 28% 12%` | `150 24% 96%` | Chữ chính |
| `--card` | `0 0% 100%` | `170 24% 11%` | Nền product card / panel |
| `--card-foreground` | `165 28% 12%` | `150 24% 96%` | Chữ trên card |
| `--popover` | `0 0% 100%` | `170 26% 10%` | Dropdown, tooltip, combobox |
| `--popover-foreground` | `165 28% 12%` | `150 24% 96%` | Chữ trong popover |
| `--primary` | `161 84% 28%` | `156 70% 52%` | **Mint thương hiệu** — nút chính, link, active |
| `--primary-foreground` | `150 40% 98%` | `165 65% 8%` | Chữ/icon trên nền primary |
| `--secondary` | `156 44% 94%` | `168 18% 18%` | Nút phụ, chip, nền mint nhạt |
| `--secondary-foreground` | `163 40% 22%` | `150 20% 92%` | Chữ trên secondary |
| `--muted` | `160 24% 96%` | `170 16% 16%` | Nền phụ, skeleton, hàng ngăn cách |
| `--muted-foreground` | `165 12% 42%` | `158 14% 62%` | Chữ phụ, caption, placeholder |
| `--accent` | `157 55% 90%` | `166 24% 20%` | Hover ghost/menu, nền nhấn nhẹ |
| `--accent-foreground` | `163 45% 20%` | `150 24% 96%` | Chữ trên accent |
| `--destructive` | `0 84% 60%` | `0 72% 57%` | Xóa, lỗi, cảnh báo |
| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` | Chữ trên destructive |
| `--border` | `156 22% 90%` | `168 16% 20%` | Viền card, divider |
| `--input` | `156 22% 90%` | `168 16% 22%` | Viền field |
| `--ring` | `160 84% 33%` | `156 70% 52%` | Focus ring (mint) |
| `--radius` | `0.75rem` | `0.75rem` | Bán kính bo góc gốc |

### Token mở rộng (ngoài shadcn) — điểm nhấn thương mại

| Token | Light `:root` | Dark `.dark` | Vai trò |
|---|---|---|---|
| `--highlight` | `11 82% 54%` | `12 84% 63%` | **Coral** — Sale badge, giá giảm, nhãn "HOT" |
| `--highlight-foreground` | `0 0% 100%` | `15 50% 12%` | Chữ trên coral (in đậm) |
| `--success` | `142 71% 40%` | `142 65% 52%` | "Còn hàng", đặt hàng thành công |
| `--warning` | `38 92% 50%` | `38 90% 58%` | "Sắp hết hàng", chờ xử lý |

> **Ghi chú tương phản:** `primary` sáng ~4.7:1 với chữ trắng (đạt AA cho text thường). `highlight` (coral) ~4:1 — **luôn dùng chữ trắng in đậm** cho badge. Đừng dùng mint pastel làm nền cho chữ trắng.

### CSS đầy đủ (dán vào `app/globals.css`)

```css
@layer base {
  :root {
    --background: 150 30% 99%;
    --foreground: 165 28% 12%;
    --card: 0 0% 100%;
    --card-foreground: 165 28% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 165 28% 12%;
    --primary: 161 84% 28%;
    --primary-foreground: 150 40% 98%;
    --secondary: 156 44% 94%;
    --secondary-foreground: 163 40% 22%;
    --muted: 160 24% 96%;
    --muted-foreground: 165 12% 42%;
    --accent: 157 55% 90%;
    --accent-foreground: 163 45% 20%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 156 22% 90%;
    --input: 156 22% 90%;
    --ring: 160 84% 33%;
    --radius: 0.75rem;

    /* extended */
    --highlight: 11 82% 54%;
    --highlight-foreground: 0 0% 100%;
    --success: 142 71% 40%;
    --warning: 38 92% 50%;
  }

  .dark {
    --background: 170 28% 8%;
    --foreground: 150 24% 96%;
    --card: 170 24% 11%;
    --card-foreground: 150 24% 96%;
    --popover: 170 26% 10%;
    --popover-foreground: 150 24% 96%;
    --primary: 156 70% 52%;
    --primary-foreground: 165 65% 8%;
    --secondary: 168 18% 18%;
    --secondary-foreground: 150 20% 92%;
    --muted: 170 16% 16%;
    --muted-foreground: 158 14% 62%;
    --accent: 166 24% 20%;
    --accent-foreground: 150 24% 96%;
    --destructive: 0 72% 57%;
    --destructive-foreground: 0 0% 100%;
    --border: 168 16% 20%;
    --input: 168 16% 22%;
    --ring: 156 70% 52%;

    /* extended */
    --highlight: 12 84% 63%;
    --highlight-foreground: 15 50% 12%;
    --success: 142 65% 52%;
    --warning: 38 90% 58%;
  }
}
```

---

## 2. Gradients (dải màu trẻ trung)

Dùng hoàn toàn class Tailwind. `from-primary` / `to-highlight`… hoạt động được vì các token đã map thành màu trong config (mục 7). `via-*` / `to-*` dùng thang màu Tailwind gần với mint (emerald / teal) để chuyển mượt.

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
| Numeric/Mono *(tùy chọn)* | **Geist Mono** | Cho giá tiền / SKU / mã đơn — bật `tabular-nums` để số thẳng cột. |

```css
/* globals.css — sau khi import font (next/font hoặc @fontsource) */
:root {
  --font-display: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
}
body { font-family: var(--font-body); }
```

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

```js
// tailwind.config.js → theme.extend.borderRadius
borderRadius: {
  xl: "calc(var(--radius) + 4px)",
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
}
```

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

### 6a. Tailwind v3 — `tailwind.config.js` (như yêu cầu)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        highlight: { DEFAULT: "hsl(var(--highlight))", foreground: "hsl(var(--highlight-foreground))" },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### 6b. Tailwind v4 (project này dùng v4) — `@theme inline` trong `globals.css`

> PixelMart dùng Tailwind v4, không có `tailwind.config.js`. Giữ nguyên block `:root`/`.dark` ở mục 1, và khai báo mapping bằng `@theme inline`:

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-highlight: hsl(var(--highlight));
  --color-highlight-foreground: hsl(var(--highlight-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --radius-xl: calc(var(--radius) + 4px);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  --font-display: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

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
