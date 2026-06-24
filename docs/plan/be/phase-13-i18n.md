# 🌐 PHASE 13: Internationalization (i18n) — Vietnamese + English

> **Prerequisite:** Phase 11+ hoàn thành.

---

## 🎯 MVP Của Phase Này

- Backend error messages trả về đúng ngôn ngữ theo header `Accept-Language` hoặc query parameter `?lang=`
- Content động (tên sản phẩm, mô tả) giữ nguyên ngôn ngữ gốc (không dịch tự động)

## 🗄️ Database Changes (MVP)

Phase này **không có bảng mới** nào được tạo. Trong phiên bản MVP, chúng ta chỉ quốc tế hóa (localization) các thành phần giao diện tĩnh (UI text, labels, buttons) và các tin nhắn lỗi tĩnh từ server. Dữ liệu động do người dùng nhập (như tên sản phẩm, mô tả sản phẩm, tên shop) sẽ được hiển thị nguyên bản theo ngôn ngữ họ đã lưu vào DB từ trước.

---

## 📋 Task Breakdown

### Task 13.1: Backend i18n — Error Messages (2-3h)

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

## 🏁 Checklist Cuối Phase 13

- [ ] Backend error messages được dịch theo locale
- [ ] Backend nhận locale từ Accept-Language, query parameter ?lang=, hoặc cookie
- [ ] Commit: "feat: backend internationalization for error messages"
