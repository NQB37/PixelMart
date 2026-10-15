# Troubleshooting (chung)

Các sự cố lặp lại qua nhiều phiên bản, kèm **nguyên nhân gốc** chứ không chỉ cách sửa. Sự cố riêng của từng phiên bản nằm trong `versions/vN/TROUBLESHOOTING.md` và được đưa lên đây khi chúng xuất hiện lần thứ hai.

## Cách debug mọi thứ (vòng lặp chúng ta luôn dùng)

1. **Đọc toàn bộ thông báo lỗi.** Dòng đầu tiên thường chỉ là triệu chứng. Nguyên nhân thường nằm phía dưới ("Caused by…", stack trace, exit code).
2. **Xác định tầng gây lỗi.** Browser → Next.js → NestJS → Prisma → PostgreSQL → Docker → hệ điều hành. Tầng nào đã sinh ra thông báo này?
3. **Tái hiện bằng lệnh nhỏ nhất có thể.** Ví dụ, dùng `curl` gọi thẳng API thay vì bấm qua giao diện.
4. **Đặt một giả thuyết, thay đổi một thứ, rồi test lại.**
5. **Ghi lại ở đây** nếu mất hơn 15 phút.

## Mục lục

| Triệu chứng | Nguyên nhân gốc | Ở đâu |
|---|---|---|
| _(điền vào khi sự cố xảy ra)_ | | |
