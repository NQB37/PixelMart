# 05 — Làm việc với Claude Code

Claude trong dự án này có 3 vai: **Mentor** (giải thích, đặt câu hỏi), **Pair programmer** (cùng plan, gợi ý), **Reviewer** (review PR).
Vì đây là dự án **học**, nguyên tắc vàng: **Claude giúp bạn hiểu nhanh hơn, không làm thay phần bạn cần học.**

## 1. Chia việc: tự viết vs giao cho Claude

| Bạn tự viết (đây là bài học) | Có thể giao Claude viết (bạn review kỹ) |
|---|---|
| Logic auth: hash, JWT, refresh rotation | Boilerplate: config ESLint/tsconfig, Dockerfile lần 2 trở đi |
| Service/business logic (checkout, tính tiền) | Seed data, fixture cho test |
| Prisma schema & quyết định quan hệ | Component UI lặp lại (sau khi bạn đã tự làm 1 cái) |
| Test case: **bạn nghĩ ra các trường hợp** | Viết thêm test theo danh sách case bạn đã liệt kê |
| Workflow GitHub Actions lần đầu | Tài liệu, README, changelog từ danh sách PR |

Quy tắc: **lần đầu gặp một pattern → tự làm. Lần thứ 3 → có thể giao.**

## 2. Quy trình cho mỗi ticket: Explore → Plan → Code → Verify

```
1. EXPLORE   "Đọc ticket PXM-12 (dán AC). Giải thích các khái niệm mình cần biết. Chưa viết code."
2. PLAN      Dùng plan mode (Shift+Tab) → "Đề xuất các bước, file sẽ tạo/sửa, test cần có."
             → Bạn sửa plan, chép checklist vào Jira.
3. CODE      Bạn viết. Kẹt thì hỏi gợi ý (xem mục 3).
4. VERIFY    Chạy test/lint/typecheck. "Review diff hiện tại của mình" trước khi mở PR.
```

## 3. Cách hỏi hiệu quả

**Hỏi kém:** "Login không chạy, sửa giúp."

**Hỏi tốt:**
```
Ticket: PXM-12 (AC2: sai mật khẩu → 401)
Mong đợi: POST /v1/auth/login trả 401
Thực tế: trả 500, log: <dán stack trace>
Đã thử: kiểm tra argon2.verify trả false, …
File liên quan: apps/api/src/identity/auth.service.ts
Yêu cầu: đừng sửa code, hãy chỉ cho mình hướng debug.
```

Các mức trợ giúp — **tự chọn mức thấp nhất đủ dùng**:
1. "Cho mình một **gợi ý**, đừng đưa đáp án."
2. "Giải thích **khái niệm** X và vì sao nó liên quan."
3. "Chỉ ra **dòng/chỗ** sai, mình tự sửa."
4. "Viết đoạn code mẫu, **giải thích từng dòng**." (chỉ khi đã kẹt lâu)

## 4. Code review

Trước khi merge mỗi PR:
```
Review PR #12 (hoặc: review diff branch hiện tại so với develop).
Vai trò: senior reviewer. Dùng tiền tố blocker/suggestion/nit/question/praise.
Ưu tiên: bảo mật, đúng AC, test thiếu case, ranh giới module.
Giải thích "vì sao" cho mỗi blocker.
```
- Lệnh có sẵn: `/code-review` (bugs), `/security-review` (bắt buộc cho PR về auth, checkout).
- Sau review: **tự sửa**, rồi yêu cầu review lại. Đừng để Claude tự sửa toàn bộ — bạn sẽ không học được gì từ lỗi của mình.

## 5. Context: giúp Claude hiểu dự án

- `CLAUDE.md` ở root: mô tả dự án, lệnh hay dùng, quy ước. Cập nhật khi có quy ước mới.
- Mỗi phiên làm việc nên **1 ticket**. Ticket mới → `/clear` để context sạch.
- Dán **AC của ticket** vào đầu phiên. Claude không đọc được Jira của bạn (trừ khi kết nối MCP Atlassian).
- Tham chiếu file cụ thể bằng `@path/to/file` thay vì mô tả chung chung.
- Quyết định quan trọng trong lúc chat → ghi vào ADR/Jira. Lịch sử chat không phải tài liệu.

## 6. An toàn

- **Không dán secret** (DATABASE_URL production, JWT secret, API key) vào chat. Dùng giá trị giả.
- **Đọc hiểu mọi dòng** trước khi commit. Không hiểu thì hỏi — "Claude viết" không phải lý do trong review.
- Lệnh có tác động (push, migrate production, xóa dữ liệu): luôn tự chạy hoặc xác nhận rõ ràng.
- Claude có thể sai, đặc biệt về API thư viện mới → kiểm tra docs chính thức, chạy thử.

## 7. Prompt mẫu thường dùng

| Tình huống | Prompt |
|---|---|
| Bắt đầu sprint | "Đây là Sprint Goal và danh sách ticket. Đánh giá rủi ro, gợi ý thứ tự làm." |
| Tách ticket | "Ticket này 8 điểm, tách giúp thành các ticket ≤ 3 điểm, mỗi cái có AC." |
| Thiết kế | "Mình định làm X theo cách Y. Phản biện: ưu/nhược, phương án khác?" |
| Test | "Đây là danh sách test case mình nghĩ ra cho endpoint Z. Còn thiếu case nào?" |
| Học | "Giải thích refresh token reuse detection bằng ví dụ có kẻ tấn công." |
| ADR | "Viết nháp ADR cho quyết định X theo template, mình sẽ chỉnh." |
| Retro | "Đây là ghi chú sprint của mình. Gợi ý 2 hành động cải thiện cụ thể." |
