# Sprint 3 — Auth API · v0.3.0 · 10 pts

**Sprint Goal:** API đăng ký/đăng nhập hoàn chỉnh với JWT + refresh rotation, có phân quyền `ADMIN`, được bao phủ bởi integration test.

**Học được:** password hashing, JWT, refresh token rotation & reuse detection, cookie security, Guards/Decorators trong NestJS, CORS với credentials, rate limiting.

> 🔒 Mọi PR trong sprint này chạy `/security-review` trước khi merge.

---

### PXM-21 · Đăng ký tài khoản (API)
`Story` · Identity & Auth · **2 pts** · `api`

> Là khách, tôi muốn tạo tài khoản bằng email/mật khẩu để có thể đặt hàng.

- Model `User` (email unique, passwordHash, name, role `CUSTOMER|ADMIN`)
- `POST /v1/auth/register`, hash bằng argon2id; `registerSchema` trong contracts (email lowercase/trim, password ≥ 8)

**AC**
- [ ] Given email đã tồn tại, When đăng ký, Then 409
- [ ] Response không bao giờ chứa `passwordHash`
- [ ] User mới có role `CUSTOMER`

### PXM-22 · Đăng nhập & phát cookie (API)
`Story` · Identity & Auth · **2 pts** · `api`

> Là khách, tôi muốn đăng nhập để hệ thống nhận ra tôi.

- `POST /v1/auth/login`: access JWT 15 phút; refresh token ngẫu nhiên 256-bit, **chỉ lưu hash** trong `RefreshToken`
- Cookie `HttpOnly; Secure; SameSite=Lax; Domain=<env>`; refresh cookie `Path=/v1/auth`
- `@nestjs/throttler`: 5 lần/phút/IP cho login

**AC**
- [ ] Sai email **hoặc** mật khẩu → 401 cùng một thông báo (không lộ email tồn tại)
- [ ] Cookie có đủ thuộc tính trên (test kiểm tra header `Set-Cookie`)
- [ ] Lần thứ 6 trong 1 phút → 429

### PXM-23 · Refresh rotation, reuse detection & logout
`Story` · Identity & Auth · **3 pts** · `api` `security`

> Là người dùng, tôi muốn ở trạng thái đăng nhập lâu dài mà vẫn an toàn nếu token bị lộ.

- `POST /v1/auth/refresh`: thu hồi token cũ, cấp token mới cùng `familyId`
- Token đã bị thu hồi được dùng lại → thu hồi **toàn bộ family** → 401
- `POST /v1/auth/logout`: thu hồi token hiện tại, xóa cookie

**AC**
- [ ] Refresh hợp lệ → cặp token mới, token cũ không dùng được nữa
- [ ] Kịch bản tấn công: dùng lại refresh token cũ → cả family bị thu hồi, token "hợp lệ" mới nhất cũng bị từ chối
- [ ] Sau logout, refresh → 401

### PXM-24 · Guards, `/me`, admin seed, Bearer fallback
`Task` · Identity & Auth · **2 pts** · `api`

- `JwtAuthGuard` đọc token từ cookie **hoặc** `Authorization: Bearer` (cho mobile v1.1)
- `RolesGuard` + decorator `@Roles('ADMIN')`; `GET /v1/me`
- Seed admin từ env `ADMIN_EMAIL` / `ADMIN_PASSWORD`

**AC**
- [ ] Không token → 401; CUSTOMER gọi route admin → 403
- [ ] Bearer token hoạt động tương đương cookie
- [ ] Seed admin chạy lại không tạo trùng

### PXM-25 · CORS & cookie config production + ADR auth
`Task` · Identity & Auth · **1 pt** · `api` `security`

- CORS allowlist `shop.` & `admin.` + `credentials: true`
- Mutation bắt buộc `Content-Type: application/json`
- ADR-0006: JWT + refresh rotation

**AC**
- [ ] Request từ origin lạ không đọc được response
- [ ] POST với `Content-Type: text/plain` → 415
