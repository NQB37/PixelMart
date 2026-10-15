# Docker cơ bản (vừa đủ cho V1)

> V1 dùng Docker **chỉ để chạy PostgreSQL**. Tự build image của mình là việc của V4. Ghi chú này chỉ gồm những gì bạn cần ngay bây giờ.

## 1. Nó là gì
Docker chạy phần mềm trong **container**: các process được cô lập, mang theo filesystem riêng (thư viện hệ điều hành, file thực thi, cấu hình) nhưng dùng chung kernel của máy host. **Docker Compose** mô tả một nhóm container, cùng port, volume và môi trường của chúng, trong một file YAML.

## 2. Tại sao nó tồn tại
Để xử lý các vấn đề kiểu "máy tôi chạy được mà": khác hệ điều hành, khác phiên bản PostgreSQL, thiếu một thư viện. Cài database trực tiếp trên Windows cũng để lại service, port và cấu hình rải rác khắp hệ thống.

## 3. Vấn đề nó giải quyết
- Có đúng phiên bản PostgreSQL (18) chỉ với một lệnh, giống hệt nhau trên mọi máy và trong CI.
- Reset dễ dàng: xóa container và volume, bắt đầu lại từ đầu.
- Không phải vật lộn với bản cài trực tiếp hay gỡ cài đặt về sau.

## 4. Ví dụ đời thực
**Image** là công thức/bản thiết kế (chỉ đọc). **Container** là món ăn nấu từ công thức đó: bạn nấu được nhiều món, và bỏ một món đi không làm mất công thức. **Volume** là một hộp lưu trữ có dán nhãn, cất bên ngoài bếp. Bỏ món ăn đi, đồ trong hộp vẫn còn.

## 5. Cách hoạt động (mức cơ bản)
- `postgres:18-alpine` là tên image kèm **tag**: PostgreSQL 18 chạy trên nền Alpine Linux nhỏ gọn. Được pull từ Docker Hub ở lần dùng đầu tiên.
- Filesystem riêng của container là **tạm thời**. Xóa container thì mọi thứ đã ghi vào đó mất theo. Vì vậy thư mục dữ liệu của database được mount từ một **named volume** do Docker quản lý riêng.
- **Port mapping** `"5432:5432"` nghĩa là `host:container`. Port 5432 trên máy bạn được chuyển tiếp tới port 5432 của container.
- **Environment variable** cấu hình image (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`). Chúng **chỉ được đọc ở lần khởi tạo đầu tiên** khi thư mục dữ liệu còn trống.
- **Init script:** các file trong `/docker-entrypoint-initdb.d/` chạy một lần, ở lần khởi tạo đầu tiên.
- **Health check:** một lệnh Docker chạy định kỳ (`pg_isready`). `running` nghĩa là process đang tồn tại. `healthy` nghĩa là nó thực sự nhận kết nối.
- Trên Windows, Docker Desktop chạy một máy ảo Linux nhỏ (WSL 2), và container chạy bên trong đó.

| Lệnh | Ảnh hưởng tới dữ liệu |
|---|---|
| `docker compose stop` / `start` | Giữ container và volume |
| `docker compose down` | Xóa container + network, **giữ volume** |
| `docker compose down -v` | Xóa container **và volume**. Mất dữ liệu. |

## 6. Khi nào nên dùng
Hạ tầng local (database, cache, message broker), môi trường dev tái lập được, và đóng gói app để deploy (V4+).

## 7. Khi nào không nên dùng
- Khi lớp bổ sung chỉ gây thêm phiền mà không mang lại gì. Ví dụ, chạy Next.js dev trong Docker trên Windows có thể khiến việc theo dõi thay đổi file chậm. Ở V1 ta chạy app trực tiếp trên máy, chỉ DB nằm trong Docker.
- Đối xử với container như thú cưng, vào bên trong vá tay. Thay vào đó hãy build lại từ định nghĩa.

## 8. Vị trí trong PixelMart
V1: `docker-compose.yml` với một service `postgres`, named volume `pgdata`, một health check, và một init script tạo `pixelmart_test`. V4 thêm image cho web và api. Từ V9 trở đi thêm Redis, RabbitMQ, v.v. dưới dạng các service bổ sung.

## 9. Bài tập thực hành
Thí nghiệm về tính bền vững dữ liệu ở Sprint V1.1 §6: tạo một bảng, `down`, `up`, kiểm tra dữ liệu; rồi `down -v`, `up`, kiểm tra lại. Giải thích từng kết quả bằng mô hình image/container/volume.

## 10. Lỗi thường gặp và cách debug
- Quên rằng Docker Desktop phải đang chạy. `docker version` không có phần Server là dấu hiệu.
- Nghĩ rằng đổi `POSTGRES_PASSWORD` sẽ áp dụng cho volume đã có (xem V1 TROUBLESHOOTING).
- Dùng tag không ghim như `postgres:latest`: một lần pull sau này âm thầm đổi major, và thư mục dữ liệu hiện có không còn tương thích.
- Công cụ debug: `docker compose ps` (trạng thái/health), `docker compose logs -f postgres`, `docker inspect <container>` (lịch sử health check), `docker volume ls`.

## 11. Câu hỏi phỏng vấn
- **Image khác container thế nào?** Image là template bất biến. Container là một instance đang chạy (hoặc đã dừng) có thêm một lớp ghi được.
- **Làm sao giữ dữ liệu của container?** Dùng volume (hoặc bind mount). Lớp ghi được của container mất khi container bị xóa.
- **Container khác VM thế nào?** Container dùng chung kernel của host: nhẹ, khởi động nhanh, cô lập ở mức process. VM ảo hóa phần cứng và chạy một kernel đầy đủ: cô lập mạnh hơn, nặng hơn.
- **Tại sao cần health check?** "Process đã khởi động" không có nghĩa là "sẵn sàng phục vụ". Orchestrator và các service phụ thuộc cần tín hiệu sẵn sàng thật.

## 12. Tài liệu tham khảo
- Tổng quan Docker: https://docs.docker.com/get-started/docker-overview/
- Tham chiếu file Compose: https://docs.docker.com/reference/compose-file/
- Volumes: https://docs.docker.com/engine/storage/volumes/
- Image postgres chính thức (env var, init script, PGDATA): https://hub.docker.com/_/postgres
