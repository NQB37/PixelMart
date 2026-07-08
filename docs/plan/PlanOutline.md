# **🗺️ CHI TIẾT LỘ TRÌNH 12 TUẦN: TỪ FRESHER ĐẾN MICROSERVICES ENGINEER**

## **CHẶNG 1: XÂY DỰNG NỀN TẢNG CỐT LÕI (MONOLITH)**

### **📅 TUẦN 1: Thiết Kế Database & Khởi Tạo Dự Án**

**MVP CỦA TUẦN:** Một server Node.js chạy local kết nối thành công với database PostgreSQL, có thể dùng câu lệnh Migration để tự động tạo/cập nhật cấu trúc bảng.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Setup cấu trúc thư mục Workspace cục bộ (website/, mobile/) tách biệt với backend (server/), cài đặt TypeScript, pnpm Workspace, và Linter (ESLint, Prettier).**
  - _Tại sao?:_ Code sạch và chuẩn hóa ngay từ ngày đầu tiên giúp em không mất thời gian refactor (sửa code) sau này khi dự án phình to.
- **Task 2: Thiết kế mô hình ERD (Entity Relationship Diagram) cho 5 bảng cơ bản trên giấy hoặc công cụ vẽ (dbdiagram.io).**
  - _Tại sao?:_ Tư duy trước khi code. Em cần nhìn rõ mối quan hệ 1-nhiều (Category - Product) và nhiều-nhiều (Order - Product thông qua OrderItem) trước khi gõ lệnh tạo bảng.
- **Task 3: Cấu hình ORM (Prisma/TypeORM) và viết file Migration đầu tiên để tạo bảng trong PostgreSQL.**
  - _Tại sao?:_ Tuyệt đối không tạo bảng bằng tay bằng các công cụ giao diện (như pgAdmin). Dùng Migration giúp đồng bộ cấu trúc DB với các thành viên khác trong team sau này.

#### **🧠 Kiến Thức Sẽ Học Được**

- Cách thiết kế DB chuẩn hóa (Normalize) cho ngành E-commerce để không bị trùng lặp dữ liệu.
- Hiểu bản chất của DB Migration và cách quản lý phiên bản database.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Lưu giá tiền bằng kiểu dữ liệu Float/Double:** Đây là lỗi chí mạng. Phép toán số thập phân trong máy tính có sai số (ví dụ: 0.1 + 0.2 = 0.30000000000000004). Với giá tiền, bắt buộc phải dùng kiểu Decimal/Numeric hoặc lưu dưới dạng số nguyên nhỏ nhất (Cents/Đồng).
- **Thiếu trường slug cho Product:** Fresher thường dùng id (ví dụ: /product/1). Về sau làm SEO sẽ không tối ưu, URL chuẩn phải là /product/iphone-15-pro-max.

### **📅 TUẦN 2: Authentication (JWT) & Phân Quyền Hệ Thống**

**MVP CỦA TUẦN:** User có thể đăng ký, đăng nhập. Token được lưu an toàn. Admin vào được trang Admin, User thường bấm vào trang Admin sẽ bị báo lỗi 403.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Viết API Đăng ký/Đăng nhập, băm mật khẩu (Hashing) bằng bcrypt ở Backend.**
  - _Tại sao?:_ Đây là logic nghiệp vụ cơ bản, mật khẩu tuyệt đối không được lưu dưới dạng chữ thuần (plain text) trong DB.
- **Task 3: Triển khai cơ chế Access Token và Refresh Token sử dụng HttpOnly Cookie.**
  - _Tại sao?:_ Chia nhỏ việc quản lý token. Lưu token ở LocalStorage rất dễ bị tấn công XSS (đánh cắp token qua mã độc Javascript). Dùng HttpOnly Cookie là chuẩn bảo mật bắt buộc.
- **Task 3: Viết Middleware isAuthenticated và isAdmin ở Backend; cấu hình Middleware bảo vệ Route ở Next.js.**
  - _Tại sao?:_ Tách biệt tầng kiểm tra quyền truy cập để có thể tái sử dụng cho bất kỳ API nào sau này.

#### **🧠 Kiến Thức Sẽ Học Được**

- Cơ chế hoạt động của JWT (Header, Payload, Signature) và vòng đời của Refresh Token.
- Sự khác biệt về bảo mật giữa LocalStorage và HttpOnly Cookie.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Lưu thông tin nhạy cảm vào Payload của JWT:** Nhiều bạn lưu luôn mật khẩu hoặc dữ liệu nội bộ vào JWT. Nên nhớ JWT chỉ mã hóa dạng Base64, ai cũng có thể giải mã để xem được. Chỉ lưu thông tin cơ bản như userId và role.
- **Chỉ bảo vệ Route ở Frontend:** Chặn người dùng ở giao diện Next.js là chưa đủ, vì họ có thể dùng Postman để gọi thẳng API Backend. Luôn luôn phải check quyền ở cả hai nơi.

### **📅 TUẦN 3: Luồng Sản Phẩm, Bộ Lọc & Tối Ưu SEO (Next.js SSR)**

**MVP CỦA TUẦN:** Một trang chủ hiển thị danh sách sản phẩm tải siêu nhanh (chuẩn SEO), có thanh tìm kiếm không bị giật lag và bộ lọc theo khoảng giá hoạt động mượt mà.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Viết API lấy danh sách sản phẩm có hỗ trợ phân trang (Pagination) và bộ lọc (Filter) theo Category/Price ở Backend.**
  - _Tại sao?:_ Không bao giờ trả về toàn bộ 1000 sản phẩm cùng lúc làm sập mạng. Phải chia nhỏ dữ liệu ngay từ tầng DB.
- **Task 2: Dùng Server-Side Rendering (SSR) trong Next.js để fetch dữ liệu sản phẩm và render trang Chi tiết sản phẩm.**
  - _Tại sao?:_ Các bot tìm kiếm của Google cần đọc được HTML có sẵn nội dung sản phẩm để lập chỉ mục (SEO). Nếu dùng Client-Side Fetching, bot sẽ chỉ thấy một trang trắng tinh.
- **Task 3: Tích hợp kỹ thuật Debounce vào thanh tìm kiếm ở Frontend.**
  - _Tại sao?:_ Tránh việc người dùng gõ chữ "Iphone" thì hệ thống gửi liên tiếp 6 request lên server, chỉ gửi 1 request khi người dùng đã dừng gõ 300ms.

#### **🧠 Kiến Thức Sẽ Học Được**

- Tư duy tối ưu SEO với Server Component trong Next.js.
- Cách tối ưu câu lệnh SQL LIMIT và OFFSET để phân trang.
- Kỹ thuật tối ưu UI/UX bằng Debounce.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Gửi request thừa khi gõ tìm kiếm:** Không dùng debounce dẫn đến server bị quá tải (DDoS tự động từ chính người dùng của mình).
- **Không xử lý lỗi 404 cho trang chi tiết:** Khi user vào một link sản phẩm không tồn tại (/product/khong-co-doc), hệ thống bị crash hoặc hiện trang lỗi màu trắng thay vì hiện trang 404 đẹp đẽ của Next.js.

### **📅 TUẦN 4: Quản Lý Giỏ Hàng & Đồng Bộ Trạng Thái (State Management)**

**MVP CỦA TUẦN:** Khách chưa đăng nhập vẫn thêm được đồ vào giỏ. Khi họ đăng nhập, giỏ hàng đó tự động bay vào tài khoản trên Database mà không bị mất.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Setup Zustand ở Frontend để lưu trữ trạng thái giỏ hàng global (số lượng item trên badge ở Header phải nhảy số lập tức).**
  - _Tại sao?:_ Tránh việc truyền dữ liệu (props) lòng vòng qua quá nhiều tầng component (Prop Drilling).
- **Task 2: Viết logic lưu giỏ hàng tạm thời vào LocalStorage cho Guest User.**
  - _Tại sao?:_ Giữ chân khách hàng. Khách chưa cần đăng ký vẫn mua sắm được bình thường.
- **Task 3: Viết API Merge Cart ở Backend và gọi nó ngay sau khi User đăng nhập thành công.**
  - _Tại sao?:_ Đây là trải nghiệm bắt buộc của E-commerce. Nếu đăng nhập xong mà giỏ hàng họ vừa chọn bị biến mất, họ sẽ bỏ đi ngay.

#### **🧠 Kiến Thức Sẽ Học Được**

- Cách sử dụng Global State Management hiệu quả, phân biệt khi nào dùng State nội bộ, khi nào dùng Global State.
- Tư duy đồng bộ dữ liệu giữa Client (Offline) và Server (Online).

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Tin tưởng giá tiền từ Client gửi lên:** Khi user bấm "Thêm vào giỏ", Frontend gửi lên { productId: 1, price: 100 }. User có thể dùng F12 sửa giá thành { price: 1 }. _Quy tắc vàng:_ Client chỉ được gửi productId và quantity, Backend phải tự vào DB tìm giá chuẩn để tính tiền.
- **Lỗi Hydration trong Next.js:** Khi đọc dữ liệu từ LocalStorage (chỉ có ở Client) để render trong Next.js (chạy ở Server trước), sẽ bị lệch cấu trúc HTML. Cần biết cách handle useEffect để tránh lỗi này.

### **📅 TUẦN 5: Xử Lý Đơn Hàng & Tích Hợp Thanh Toán (VNPAY/Stripe)**

**MVP CỦA TUẦN:** Người dùng chọn mua hàng, hệ thống nhảy sang trang quét mã QR của ngân hàng. Sau khi quét xong, trạng thái đơn đổi thành "Đã thanh toán", số lượng hàng trong kho tự động trừ đi.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Viết API tạo đơn hàng (Order) với trạng thái Pending, thực hiện kiểm tra số lượng kho (stock) trước khi cho đặt.**
  - _Tại sao?:_ Tránh tình trạng "Bán quá số lượng" (Over-selling) khi sản phẩm trong kho đã hết nhưng nút mua vẫn bấm được.
- **Task 2: Tích hợp thư viện tạo URL thanh toán (ví dụ: VNPAY Sandbox).**
  - _Tại sao?:_ Học cách làm việc với bên thứ 3 (Third-party API) bằng cách ký mã bảo mật (Checksum/Hash SHA512) để bảo mật giao dịch.
- **Task 3: Viết API Webhook (IPN URL) để nhận kết quả trả về từ phía Ngân hàng một cách tự động.**
  - _Tại sao?:_ Khách hàng quét mã xong có thể họ tắt trình duyệt luôn, hệ thống không thể dựa vào Frontend để cập nhật trạng thái đơn. Phải dùng Webhook để Server-to-Server tự nói chuyện với nhau.

#### **🧠 Kiến Thức Sẽ Học Được**

- Hiểu sâu về quy trình giao dịch tài chính online và cơ chế bảo mật Webhook.
- Tư duy xử lý Transaction trong Database (Nếu tạo đơn thành công nhưng trừ kho lỗi thì phải Rollback - hủy toàn bộ lệnh trước đó).

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Không validate Webhook:** Ai đó biết URL webhook của em (ví dụ /api/payment/webhook) họ có thể dùng Postman tự chế một request "Thanh toán thành công" gửi lên để lừa hệ thống. Luôn phải kiểm tra chữ ký bảo mật (Signature/Checksum) do VNPAY/Stripe cung cấp trong request.
- **Trừ kho trước khi thanh toán:** Khách mới bấm "Đặt hàng" (chưa trả tiền) đã trừ kho, dẫn đến việc người khác muốn mua thật lại không mua được vì hết hàng (Kho ảo). Phải giữ chỗ tạm thời hoặc chỉ trừ khi có Webhook báo tiền đã về.

### **📅 TUẦN 6: Tạo Trang Quản Trị (Admin Dashboard) & Upload Ảnh**

**MVP CỦA TUẦN:** Admin có thể đăng nhập, xem biểu đồ doanh thu theo tháng, bấm nút thêm sản phẩm mới, upload ảnh trực tiếp và quản lý đổi trạng thái đơn hàng của khách.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Thiết kế giao diện Dashboard tách biệt hoàn toàn, tích hợp thư viện vẽ biểu đồ (Recharts).**
  - _Tại sao?:_ Trực quan hóa dữ liệu giúp Admin có cái nhìn tổng quan về tình hình kinh doanh (Tổng doanh thu, số đơn hàng).
- **Task 2: Tích hợp API Upload ảnh lên Cloudinary (hoặc AWS S3).**
  - _Tại sao?:_ Không bao giờ lưu ảnh trực tiếp trên ổ đĩa của server Node.js vì sẽ làm đầy bộ nhớ và không thể mở rộng server sau này. Phải đưa lên các Cloud Storage chuyên dụng.
- **Task 3: Viết các API CRUD (Thêm, Sửa, Xóa) sản phẩm và cập nhật trạng thái đơn hàng.**
  - _Tại sao?:_ Hoàn thiện vòng lặp vận hành của một website thương mại điện tử.

#### **🧠 Kiến Thức Sẽ Học Được**

- Cách xử lý file dữ liệu (Multipart/form-data) trong Node.js.
- Tư duy quản lý tài nguyên (Media) trên Cloud.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Không giới hạn kích thước ảnh:** User upload một cái ảnh gốc nặng 20MB lên làm hệ thống xử lý chậm và tốn tiền lưu trữ Cloud. Phải validate dung lượng (< 2MB) và định dạng file ngay tại client/backend.
- **Xóa sản phẩm vật lý khỏi DB:** Khi bấm "Xóa sản phẩm", Fresher thường dùng lệnh DELETE. Lỗi ngay! Nếu xóa hẳn, các đơn hàng cũ đã mua sản phẩm đó trong quá khứ sẽ bị lỗi vì không tìm thấy productId. Phải dùng **Soft Delete** (Thêm cột isDeleted: boolean hoặc deletedAt).

## **CHẶNG 2: CONTAINER HÓA & TỐI ƯU HIỆU NĂNG**

### **📅 TUẦN 7: Dockerize Ứng Dụng & Setup CI/CD Sơ Khai**

**MVP CỦA TUẦN:** Một lập trình viên mới chỉ cần tải code về, gõ đúng một câu lệnh duy nhất là toàn bộ hệ thống (Web, API, DB) tự động bật lên và chạy mượt mà, không cần cài đặt node hay postgres thủ công trên máy.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Viết file Dockerfile cho Frontend và Backend.**
  - _Tại sao?:_ Đóng gói mã nguồn cùng môi trường chạy thành một khối độc lập, giải quyết triệt để câu nói kinh điển: "Code chạy ngon trên máy em nhưng lên máy deploy lại lỗi".
- **Task 2: Viết file docker-compose.yml để liên kết Frontend, Backend và Postgres Database chạy chung một mạng nội bộ.**
  - _Tại sao?:_ Quản lý đa container một cách dễ dàng, cấu hình các biến môi trường tập trung tại một chỗ.
- **Task 3: Viết file script GitHub Actions để tự chạy pnpm lint và pnpm build mỗi khi tạo Pull Request.**
  - _Tại sao?:_ Tự động hóa khâu kiểm tra chất lượng code, ngăn chặn việc đẩy code lỗi lên nhánh chính.

#### **🧠 Kiến Thức Sẽ Học Được**

- Khái niệm về Containerization, phân biệt giữa Image và Container.
- Tư duy Automation với CI/CD (Continuous Integration).

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Đóng gói cả thư mục node_modules vào Docker Image:** Làm dung lượng Image nặng lên hàng GB một cách vô ích. Phải dùng file .dockerignore.
- **Lưu dữ liệu DB bên trong Container:** Khi container Postgres bị tắt hoặc khởi động lại, toàn bộ dữ liệu đơn hàng bay màu. Phải sử dụng **Docker Volumes** để ánh xạ dữ liệu ra ổ đĩa máy thật.

### **📅 TUẦN 8: Tối Ưu Với Caching (Redis) & Đánh Index DB**

**MVP CỦA TUẦN:** Tốc độ tải trang chủ tăng gấp 5-10 lần. Hệ thống chịu được lượng request lớn mà không làm CPU của PostgreSQL nhảy lên 100%.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Phân tích các câu lệnh truy vấn hay dùng và thực hiện đánh INDEX cho các cột thích hợp trong Postgres (slug, price).**
  - _Tại sao?:_ Giúp Database tìm kiếm dữ liệu theo cơ chế cây thư mục thay vì phải quét qua từng dòng một từ đầu đến cuối bảng (Full Table Scan).
- **Task 2: Setup Redis Server và viết helper hàm Cache trong Backend theo chiến lược Cache-Aside.**
  - _Tại sao?:_ Khi user gọi lấy danh mục sản phẩm, check xem Redis có không. Có thì trả về luôn (mất 2ms). Không có mới vào Postgres lấy (mất 50ms), rồi tiện tay lưu lại vào Redis cho người dùng sau.
- **Task 3: Viết logic xóa Cache (Cache Invalidation) khi Admin cập nhật hoặc thêm sản phẩm mới.**
  - _Tại sao?:_ Đảm bảo tính chính xác của dữ liệu. Nếu admin đổi giá sản phẩm mà không xóa cache cũ, khách hàng vẫn sẽ nhìn thấy giá cũ.

#### **🧠 Kiến Thức Sẽ Học Được**

- Cơ chế lưu trữ In-memory của Redis.
- Tư duy tối ưu hóa câu lệnh SQL và chiến lược quản lý bộ nhớ đệm (Cache).

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Đánh Index vô tội vạ:** Cột nào cũng đánh Index. Index giúp Đọc nhanh nhưng lại làm Ghi (Insert/Update) chậm đi vì DB phải cập nhật lại cây Index. Chỉ đánh index cho các cột nằm trong điều kiện WHERE, JOIN hoặc ORDER BY.
- **Không set TTL (Time-To-Live) cho Cache:** Lưu dữ liệu vào Redis vĩnh viễn dẫn đến việc RAM bị đầy theo thời gian và gây sập server Redis. Luôn set thời gian hết hạn (ví dụ: danh mục sản phẩm lưu trong 1 tiếng).

## **CHẶNG 3: DI CƯ SANG KIẾN TRÚC MICROSERVICES**

### **📅 TUẦN 9: Tách Dịch Vụ (Decoupling) & Xây Dựng API Gateway**

**MVP CỦA TUẦN:** Hệ thống được chia làm 3 server chạy ở 3 cổng khác nhau. Frontend Next.js chỉ gọi duy nhất về cổng của API Gateway, Gateway tự biết điều hướng request đi các nơi.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Tách tính năng Auth ra thành Auth Service, dùng một database riêng (hoặc chia schema độc lập).**
  - _Tại sao?:_ Bước đầu tiên bẻ gãy khối Monolith. Tách service có lượng truy cập nhiều nhất để có thể scale độc lập.
- **Task 2: Giữ lại phần sản phẩm thành Product Service. Xóa bỏ các code thừa không liên quan ở mỗi bên.**
  - _Tại sao?:_ Đảm bảo tính đóng gói độc lập. Service nào chỉ làm đúng nhiệm vụ của service đó (Single Responsibility).
- **Task 3: Viết một server API Gateway bằng Express hoặc NestJS đứng ở cổng 8000 để làm đầu mối nhận mọi request.**
  - _Tại sao?:_ Frontend không cần quan tâm Backend có bao nhiêu service và chạy ở cổng nào. Gateway sẽ lo việc phân tuyến (Routing) và check token tập trung tại một nơi.

#### **🧠 Kiến Thức Sẽ Học Được**

- Hiểu rõ kiến trúc Microservices, tư duy chia tách dịch vụ theo Domain (Domain-Driven Design sơ khai).
- Cách hoạt động và vai trò của mô hình Reverse Proxy / API Gateway.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Các Service dùng chung một Database:** Đây là lỗi "Microservices nửa mùa". Nếu các service vẫn chung một DB thì khi DB sập, cả hệ thống sập theo, và việc chỉnh sửa bảng ở service này sẽ làm hỏng service kia. Mỗi service phải làm chủ dữ liệu của chính nó.
- **Gateway bị thắt nút cổ chai (Bottleneck):** Viết quá nhiều logic nặng (như tính toán, đọc ghi file) ở Gateway làm nó bị chậm, kéo theo toàn bộ các service phía sau bị chậm theo. Gateway chỉ nên làm nhiệm vụ nhẹ nhàng: Kiểm tra bảo mật cơ bản, định tuyến và giới hạn lượt gọi (Rate Limiting).

### **📅 TUẦN 10: Giao Tiếp Bất Đồng Bộ Với Message Queue (RabbitMQ)**

**MVP CỦA TUẦN:** Khách bấm mua hàng thành công, màn hình Frontend hiện thông báo "Xong" ngay lập tức. Khoảng 2 giây sau, hòm thư email của khách nhận được thư cảm ơn do một service hoàn toàn độc lập gửi đi.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Xây dựng một service hoàn toàn mới mang tên Notification Service chỉ làm đúng 1 việc: Gửi Email bằng thư viện Nodemailer.**
  - _Tại sao?:_ Tách các tác vụ tốn thời gian (I/O nặng như kết nối SMTP server gửi mail) ra khỏi luồng xử lý chính của đơn hàng.
- **Task 2: Cài đặt RabbitMQ và viết code ở Product/Order Service để đẩy một "Tin nhắn" (Message) vào hàng đợi (Queue) khi có đơn hàng mới.**
  - _Tại sao?:_ Đóng vai trò là nhà sản xuất tin nhắn (Publisher). Tạo đơn xong thì ném việc gửi mail vào queue rồi đi làm việc khác, không đứng đợi gửi mail nữa.
- **Task 3: Viết code ở Notification Service để liên tục lắng nghe (Consume) các tin nhắn từ Queue đó về để xử lý.**
  - _Tại sao?:_ Đóng vai trò là nhà tiêu thụ (Consumer). Tự động lấy tin nhắn ra và gửi email một cách âm thầm dưới nền.

#### **🧠 Kiến Thức Sẽ Học Được**

- Tư duy lập trình bất đồng bộ ở kiến trúc cấp hệ thống (Asynchronous Message-Driven Architecture).
- Cách hoạt động của Message Broker (Exchange, Queue, Binding Key).

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Mất tin nhắn khi RabbitMQ bị sập:** Nếu cấu hình mặc định, khi server RabbitMQ bị mất điện, toàn bộ tin nhắn chưa kịp xử lý trong hàng đợi sẽ biến mất (Khách không nhận được mail). Cần học cách cấu hình durable: true cho Queue và persistent: true cho Message.
- **Xử lý trùng lặp tin nhắn (Idempotency):** Do lỗi mạng, một tin nhắn có thể bị gửi 2 lần vào Queue. Nếu không kiểm tra, khách hàng sẽ nhận được 2 email trùng hệt nhau cho cùng 1 đơn hàng. Service nhận tin nhắn phải luôn check xem tin nhắn này đã được xử lý chưa trước khi làm.

### **📅 TUẦN 11: Giám Sát Hệ Thống Tập Trung (Monitoring & Centralized Logging)**

**MVP CỦA TUẦN:** Một giao diện đồ họa Grafana hiển thị trực quan các đường biểu đồ nhảy múa thể hiện lượng CPU/RAM của từng service theo thời gian thực, kèm theo một ô tìm kiếm giúp tra cứu lỗi của tất cả các service tại một nơi duy nhất.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Tích hợp thư viện ghi log (như Winston hoặc Bunyan) xuất log dưới dạng định dạng chuẩn JSON cho các service.**
  - _Tại sao?:_ Hệ thống phân tán không thể dùng console.log thuần vì khi có lỗi sẽ không biết nó xảy ra ở dòng nào, thời gian nào và bối cảnh ra sao. Định dạng JSON giúp các công cụ máy tính đọc hiểu log dễ dàng.
- **Task 2: Setup hệ thống thu thập log tập trung (Promtail + Loki hoặc ELK đơn giản) bằng Docker.**
  - _Tại sao?:_ Khi hệ thống có 5 service, em không thể bật 5 cái cửa sổ terminal lên để ngồi soi lỗi. Phải gom toàn bộ log bắn về một hồ chứa duy nhất.
- **Task 3: Setup Prometheus để cào chỉ số (Metrics) hệ thống và dùng Grafana để vẽ biểu đồ giám sát.**
  - _Tại sao?:_ Giúp quản trị viên đưa ra quyết định nâng cấp server trước khi nó bị quá tải và sập hẳn.

#### **🧠 Kiến Thức Sẽ Học Được**

- Tư duy về Observability (Tính khả sát) của hệ thống: Logs, Metrics, và Traces.
- Cách cấu hình và sử dụng bộ đôi công cụ tiêu chuẩn ngành: Prometheus và Grafana.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Ghi log thông tin nhạy cảm:** Vô tình in toàn bộ request body chứa mật khẩu của user hoặc số thẻ tín dụng ra file Log. Bất kỳ ai có quyền xem log hệ thống đều có thể đọc được thông tin này, vi phạm nghiêm trọng luật bảo mật. Luôn phải lọc (Masking) dữ liệu nhạy cảm trước khi log.
- **Log quá nhiều hoặc quá ít:** Log quá nhiều thông tin rác (như "Đã vào hàm A", "Đã ra hàm B") làm đầy ổ cứng cực nhanh. Log quá ít thì khi hệ thống sập lại không có manh mối để sửa lỗi. Cần phân định rõ các cấp độ log: INFO, WARN, ERROR, DEBUG.

### **📅 TUẦN 12: Triển Khai Lên Kubernetes (K8s) & Đóng Gói Hồ Sơ**

**MVP CỦA TUẦN:** Toàn bộ hệ thống Microservices vận hành mượt mà trên cụm K8s Local (Minikube). Thử lấy tay tắt ngang một service, hệ thống tự động phát hiện và bật lại một container mới thay thế trong vài giây mà trang web không hề bị gián đoạn.

#### **📝 Các Task Nhỏ & Lý Do Chia Task**

- **Task 1: Cài đặt Minikube (hoặc Kind) để tạo môi trường Kubernetes giả lập ngay trên máy cá nhân.**
  - _Tại sao?:_ Học cách làm việc với K8s một cách an toàn và miễn phí trước khi động vào các dịch vụ mất tiền trên Cloud (AWS EKS, Google GKE).
- **Task 2: Viết các file cấu hình Deployment, Service và Ingress cho từng Microservice.**
  - _Tại sao?:_ Chuyển dịch tư duy quản lý container bằng tay (Docker-compose) sang tư duy điều phối tự động (Orchestration) bằng khai báo cấu hình file mã nguồn (Declarative Configuration).
- **Task 3: Test tính năng Tự chữa lành (Self-healing) và Viết tài liệu hướng dẫn (README.md) cực chất cho dự án.**
  - _Tại sao?:_ File README là bộ mặt của dự án, quyết định 80% việc nhà tuyển dụng có ấn tượng và bấm vào xem code của em hay không.

#### **🧠 Kiến Thức Sẽ Học Được**

- Kiến trúc cơ bản của Kubernetes: Pods, Deployments, Services, Ingress Controller.
- Tư duy thiết kế hệ thống có tính sẵn sàng cao (High Availability) và khả năng tự phục hồi.

#### **⚠️ Lỗi Thường Gặp (Bẫy Fresher)**

- **Đặt bừa bãi cấu hình tài nguyên (Resources Request/Limit):** Không giới hạn lượng RAM tối đa mà một Pod được dùng, dẫn đến một service bị rò rỉ bộ nhớ (Memory Leak) ăn hết sạch tài nguyên của toàn bộ cụm máy chủ, kéo các service khác sập theo.
- **Hardcode các thông tin bí mật trong file yaml:** Lưu thẳng chuỗi kết nối Database chứa mật khẩu vào file cấu hình K8s rồi push lên GitHub công khai. Phải học cách sử dụng **K8s Secrets** để mã hóa thông tin nhạy cảm.
