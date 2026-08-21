# Deploy: FE lên Vercel, BE lên Render

4 service: 1 Postgres + 1 web service (Render) + 3 project Vercel (`client`, `admin`, `vendor`).

Thứ tự bắt buộc: **DB → BE → FE → quay lại BE set 3 URL của FE** (CORS + tên cookie theo origin phụ thuộc vào chúng).

---

## 1. Postgres trên Render

New → Postgres. Ghi lại **Internal Database URL** (dùng cho web service cùng region, không cần SSL param) và **External** (dùng khi chạy migrate/seed từ máy local).

## 2. Backend (Render Web Service)

New → Web Service → connect repo.

| Setting | Giá trị |
|---|---|
| Root Directory | `server` |
| Runtime | Node (tự nhận `.node-version` = 22) |
| Build Command | `pnpm install --frozen-lockfile && pnpm prisma generate && pnpm prisma migrate deploy` |
| Start Command | `pnpm start` |
| Health Check Path | `/api/v1/health` |

Nếu Render không tự có pnpm: thêm `corepack enable && ` vào đầu Build Command.

`migrate deploy` nằm trong build vì Pre-Deploy Command là tính năng trả phí. Build fail = deploy không lên → an toàn.

### Env vars (Environment → Add)

```
NODE_ENV=production
DATABASE_URL=<Internal Database URL>
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN_DAYS=7
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# 3 biến dưới điền sau bước 3, rồi redeploy
CLIENT_WEB_URL=
VENDOR_WEB_URL=
ADMIN_WEB_URL=
```

Không set `PORT` — Render tự inject.

Seed dữ liệu (1 lần, từ local, dùng External URL):
`DATABASE_URL=<external-url> pnpm prisma db seed`

## 3. Frontend (Vercel × 3)

Tạo **3 project riêng** từ cùng repo, chỉ khác Root Directory:

| Project | Root Directory | Framework | Env var |
|---|---|---|---|
| pixelmart-client | `website/client` | Next.js | `NEXT_PUBLIC_BASE_API_URL=https://<be>.onrender.com/api/v1` |
| pixelmart-admin | `website/admin` | Vite | `VITE_API_URL=https://<be>.onrender.com/api/v1` |
| pixelmart-vendor | `website/vendor` | Vite | `VITE_API_URL=https://<be>.onrender.com/api/v1` |

Build/Install command để **mặc định** — Vercel tìm ngược lên `website/pnpm-lock.yaml`, nhận ra pnpm workspace và cài cả workspace (`@website/shared` cần điều này).

`admin`/`vendor` đã có `vercel.json` rewrite `/(.*)` → `/index.html` cho SPA routing; không cần cấu hình gì thêm.

## 4. Nối 2 đầu lại

Về Render, điền 3 URL production vừa có (không dấu `/` cuối):

```
CLIENT_WEB_URL=https://pixelmart-client.vercel.app
VENDOR_WEB_URL=https://pixelmart-vendor.vercel.app
ADMIN_WEB_URL=https://pixelmart-admin.vercel.app
```

Save → Render tự redeploy. Test: login trên cả 3 app, F5 xem còn session (đường refresh token) và logout.

---

## Những chỗ dễ vỡ

- **Cookie cross-site.** FE `.vercel.app` và BE `.onrender.com` là hai site khác nhau, nên refresh token cookie phải là `SameSite=None; Secure`. Đã fix ở `server/src/utils/cookies.ts` (`set` và `clear` phải khớp attribute, nếu không logout sẽ không xoá được cookie). Localhost vẫn dùng `lax`.
- **Preview deployment của Vercel sẽ fail CORS.** `server/src/config/cors.ts` chỉ allow đúng 3 origin trong env. Mỗi preview có domain random → bị block. Chấp nhận (preview chỉ để xem UI), hoặc thêm regex `/\.vercel\.app$/` vào allowlist nếu cần preview gọi API thật.
- **Free tier Render sleep sau 15 phút.** Request đầu tiên chờ ~50s. Đừng debug "app hỏng" khi mới mở lần đầu.
- **Prisma client là generated + gitignored** (`server/src/generated`), nên `prisma generate` bắt buộc phải nằm trong build command.
- **`tsx` chạy TypeScript trực tiếp ở runtime** (`pnpm start`), nên nó nằm trong `dependencies` chứ không phải `devDependencies` — đừng move sang dev.
- **Custom domain** (vd `api.pixelmart.com` + `pixelmart.com`) làm cookie thành same-site: khi đó có thể trả `sameSite: "lax"` cho an toàn hơn.
