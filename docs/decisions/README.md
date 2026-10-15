# Architecture Decision Records

Mỗi ADR ghi lại **một** quyết định quan trọng: bối cảnh, các phương án đã cân nhắc, lựa chọn cuối cùng và hệ quả. Sau khi được chấp nhận, ADR không bao giờ bị sửa nội dung, chỉ được đổi trạng thái. Nếu đảo ngược một quyết định, ta viết ADR mới có dòng `Supersedes: ADR-XXXX`.

| # | Tiêu đề | Trạng thái |
|---|---|---|
| [0001](0001-modular-monolith-pnpm-monorepo.md) | Modular monolith trong một pnpm monorepo | Accepted (Đã chấp nhận) |
| [0002](0002-tool-and-dependency-versions.md) | Phiên bản công cụ và dependency cho V1 | Accepted (Đã chấp nhận) |
| [0003](0003-money-representation.md) | Cách biểu diễn tiền | Accepted (Đã chấp nhận) |
| [0004](0004-web-calls-api-server-side.md) | Next.js chỉ gọi API từ phía server (V1) | Accepted (Đã chấp nhận) |
| [0005](0005-online-payments-stripe.md) | Thanh toán online với Stripe (test mode) ở V3 | Proposed (Đề xuất). Vị trí trong roadmap đã được chấp nhận |

Sắp tới (chỉ viết khi quyết định thực sự được đưa ra):
- 0006: Kiểu dữ liệu API dùng chung, viết tay hay sinh từ OpenAPI (Sprint V1.5)
- 0007: Cơ chế xác thực admin cho V1 (Sprint V1.8)
- Cách xác thực cho khách hàng (V2)
- Lưu trữ ảnh: Cloudflare R2 hay Cloudinary (V8)

## Mẫu

```markdown
# ADR-NNNN: Tiêu đề
- Trạng thái: Proposed (Đề xuất) | Accepted (Đã chấp nhận) | Superseded by ADR-XXXX
- Ngày: YYYY-MM-DD
## Bối cảnh
## Các phương án đã cân nhắc
## Quyết định
## Hệ quả (tích cực, tiêu cực, việc cần làm tiếp)
```
