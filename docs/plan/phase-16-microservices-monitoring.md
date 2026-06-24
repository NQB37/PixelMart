# 🔀 PHASE 16: Microservices Migration, Message Queue & Monitoring

> **Prerequisite:** Phase 15 hoàn thành.

---

## Tổng Quan

Phase này là **graduation project** — tổng hợp tất cả kiến thức đã học. Chia thành 3 sub-phases:
- **16A:** Tách services + API Gateway
- **16B:** Message Queue (RabbitMQ) + Notification Service
- **16C:** Monitoring & Logging (Prometheus + Grafana + Loki)

---

## 🗄️ Database Changes (MVP)

Trong phase này, thay vì thêm bảng mới, chúng ta thực hiện kiến trúc **Database-per-service** (Mỗi service một cơ sở dữ liệu riêng) để đảm bảo tính độc lập hoàn toàn của các microservices:

1. **Phân rã Database Monolith:** Chia database PostgreSQL duy nhất hiện tại thành các database vật lý/logical độc lập:
   - `pixelmart_auth`: Chỉ chứa các bảng `users`, `refresh_tokens`.
   - `pixelmart_product`: Chỉ chứa các bảng `products`, `product_images`, `categories`, `variant_attributes`, `variant_attribute_values`, `product_variants`, `product_variant_options`.
   - `pixelmart_order`: Chỉ chứa các bảng `orders`, `order_items`. (Lưu ý: do không join trực tiếp sang bảng User/Product nữa, các liên kết ForeignKey cứng sẽ được loại bỏ, giao tiếp thông tin sẽ qua API Gateway hoặc Event Message Queue).
   - `pixelmart_shop`: Chỉ chứa các bảng `shops`, `coupons`.
2. **Cập nhật Connection String:** Thiết lập các file cấu hình và biến môi trường cho từng service trỏ đến đúng database tương ứng của nó.
3. **Migration độc lập:** Mỗi thư mục service (`services/auth-service`, `services/product-service`,...) bây giờ sẽ quản lý schema.prisma riêng và tự chạy các file migration độc lập của chính mình.

---

## 🔀 PHASE 16A: Microservices Split & API Gateway (10-12h)

### Mục tiêu:
- Tách monolith thành 4 services ban đầu: Auth, Product, Order, Shop
- API Gateway đứng trước, routing + auth check
- Mỗi service có DB riêng
- Frontend KHÔNG thay đổi (chỉ đổi API URL → Gateway)

### Task 16A.1: Tách Auth Service (3-4h)

1. Copy `server/src/modules/auth/` → `services/auth-service/`
2. Tạo Prisma schema riêng (chỉ `User` + `RefreshToken`)
3. Tạo DB riêng: `pixelmart_auth`
4. Migrate data users từ DB gốc sang DB mới
5. Test: login, register, refresh token hoạt động độc lập

### Task 16A.2: Tách Product Service (3-4h)

1. Copy `modules/product/` + `modules/category/` → `services/product-service/`
2. Prisma schema: `Product`, `ProductImage`, `Category`, `ProductVariant`...
3. DB riêng: `pixelmart_product`
4. Product Service cần user info → gọi HTTP sang Auth Service (hoặc decode JWT trực tiếp)

### Task 16A.3: API Gateway (3-4h)

```bash
mkdir services/api-gateway
cd services/api-gateway
npm init -y
npm install express http-proxy-middleware cors helmet jsonwebtoken
```

#### `services/api-gateway/src/routes.config.ts`:
```typescript
export const serviceRoutes = [
  {
    prefix: '/api/v1/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    auth: false, // Public routes
  },
  {
    prefix: '/api/v1/products',
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:8002',
    auth: false, // Public reads, auth for writes (handled by service)
  },
  {
    prefix: '/api/v1/orders',
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:8003',
    auth: true, // All order routes need auth
  },
  {
    prefix: '/api/v1/shops',
    target: process.env.SHOP_SERVICE_URL || 'http://localhost:8004',
    auth: false,
  },
];
```

#### Gateway middleware chain:
```
Request → Rate Limit → CORS → JWT Verify (if needed) → Proxy to Service
```

**Gateway chỉ làm:**
- ✅ Rate limiting
- ✅ CORS
- ✅ JWT verification (decode token, attach userId to header)
- ✅ Route proxying
- ✅ Request logging
- ❌ KHÔNG chứa business logic
- ❌ KHÔNG đọc/ghi DB

#### Docker Compose Update:
```yaml
services:
  gateway:
    build: ./services/api-gateway
    ports: ["8000:8000"]
    depends_on: [auth-service, product-service, order-service]

  auth-service:
    build: ./services/auth-service
    ports: ["8001:8001"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@auth-db:5432/pixelmart_auth
    depends_on: [auth-db]

  product-service:
    build: ./services/product-service
    ports: ["8002:8002"]
    depends_on: [product-db]

  # ... more services

  auth-db:
    image: postgres:16-alpine
    volumes: [auth_db_data:/var/lib/postgresql/data]

  product-db:
    image: postgres:16-alpine
    volumes: [product_db_data:/var/lib/postgresql/data]
```

### ⚠️ Lỗi fresher hay mắc:
- **Shared database:** Các services vẫn dùng chung 1 DB → không phải microservices thật sự. Mỗi service PHẢI có DB riêng.
- **Circular dependencies:** Auth Service call Product Service call Auth Service → deadlock. Thiết kế clear dependency graph.
- **Gateway quá "fat":** Business logic rò rỉ vào gateway (validate order, calculate price) → gateway thành bottleneck.

---

## 📨 PHASE 16B: Message Queue & Notification (8-10h)

### Mục tiêu:
- RabbitMQ cho async communication giữa services
- Notification Service gửi email khi: đặt hàng, đổi trạng thái, welcome
- Event-driven: Order Service publish event → Notification Service consume

### Task 16B.1: Setup RabbitMQ (1-2h)

```yaml
# Thêm vào docker-compose.yml
rabbitmq:
  image: rabbitmq:3-management-alpine
  ports:
    - "5672:5672"    # AMQP
    - "15672:15672"  # Management UI
  environment:
    RABBITMQ_DEFAULT_USER: admin
    RABBITMQ_DEFAULT_PASS: admin
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
```

### Task 16B.2: Event Publisher in Order Service (2-3h)

```typescript
// services/order-service/src/events/publisher.ts
import amqplib from 'amqplib';

class EventPublisher {
  private channel: amqplib.Channel | null = null;

  async connect() {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
    this.channel = await connection.createChannel();
    
    // Declare exchange
    await this.channel.assertExchange('pixelmart.events', 'topic', { durable: true });
  }

  async publish(routingKey: string, data: any) {
    if (!this.channel) throw new Error('Not connected');
    
    this.channel.publish(
      'pixelmart.events',
      routingKey,
      Buffer.from(JSON.stringify({
        event: routingKey,
        data,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID(), // Idempotency
      })),
      { persistent: true } // Survive RabbitMQ restart
    );
  }
}

export const publisher = new EventPublisher();

// Usage in Order Service:
// await publisher.publish('order.created', { orderId, userId, items, total });
// await publisher.publish('order.status.changed', { orderId, oldStatus, newStatus });
```

### Task 16B.3: Notification Service (Consumer) (3-4h)

```typescript
// services/notification-service/src/consumers/order.consumer.ts
import amqplib from 'amqplib';
import { emailService } from '../services/email.service';

export async function startOrderConsumer() {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();

  await channel.assertExchange('pixelmart.events', 'topic', { durable: true });
  
  const queue = await channel.assertQueue('notification.order', { durable: true });
  await channel.bindQueue(queue.queue, 'pixelmart.events', 'order.*');

  channel.consume(queue.queue, async (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());
    
    try {
      switch (event.event) {
        case 'order.created':
          await emailService.sendOrderConfirmation(event.data);
          break;
        case 'order.status.changed':
          await emailService.sendStatusUpdate(event.data);
          break;
      }
      
      channel.ack(msg); // Xử lý xong → acknowledge
    } catch (error) {
      console.error('Failed to process event:', error);
      channel.nack(msg, false, true); // Retry
    }
  });
}
```

### ⚠️ Lỗi fresher hay mắc:
- **Mất message khi RabbitMQ restart:** Phải set `durable: true` cho queue và `persistent: true` cho message.
- **Xử lý trùng message:** Network error → message gửi 2 lần → khách nhận 2 email. Check idempotency (event ID đã xử lý chưa).
- **Consumer crash → message mất:** Phải `ack()` SAU KHI xử lý xong. Nếu `ack()` trước rồi crash → message biến mất nhưng chưa xử lý.

---

## 📊 PHASE 16C: Monitoring & Logging (7-10h)

### Mục tiêu:
- Structured logging (JSON format) cho tất cả services
- Centralized log collection (Loki + Promtail)
- Metrics monitoring (Prometheus + Grafana)
- Dashboard hiển thị: CPU, RAM, request rate, error rate, response time

### Task 16C.1: Structured Logging — Winston (2-3h)

```bash
npm install winston
```

```typescript
// packages/shared-utils/src/logger.ts
import winston from 'winston';

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json() // Structured JSON logging
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: process.env.NODE_ENV === 'development'
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          : winston.format.json(),
      }),
    ],
  });
};

// Usage:
// const logger = createLogger('order-service');
// logger.info('Order created', { orderId, userId, total });
// logger.error('Payment failed', { orderId, error: err.message });
// logger.warn('Low stock', { productId, remainingStock: 2 });
```

**Log masking — SECURITY:**
```typescript
// ❌ NGUY HIỂM:
logger.info('User login', { email, password }); // Password in logs!

// ✅ AN TOÀN:
logger.info('User login', { email, password: '***' });
```

### Task 16C.2: Prometheus Metrics (2-3h)

```bash
npm install prom-client
```

```typescript
// Expose /metrics endpoint cho Prometheus scrape
import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client';

// Auto-collect CPU, memory, event loop metrics
collectDefaultMetrics();

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to track metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode }, duration);
    httpRequestTotal.inc({ method: req.method, route, status: res.statusCode });
  });
  next();
};

// GET /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Task 16C.3: Grafana Dashboard (2-3h)

```yaml
# Thêm vào docker-compose.yml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./infra/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  volumes:
    - grafana_data:/var/lib/grafana
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin

loki:
  image: grafana/loki:latest
  ports:
    - "3100:3100"

promtail:
  image: grafana/promtail:latest
  volumes:
    - /var/log:/var/log
    - ./infra/monitoring/loki/promtail.yml:/etc/promtail/promtail.yml
```

Grafana dashboard panels:
- **Request Rate:** HTTP requests per second per service
- **Response Time:** P50, P95, P99 latencies
- **Error Rate:** 4xx vs 5xx errors
- **CPU/Memory:** Per container resource usage
- **RabbitMQ:** Queue depth, consumer lag
- **Database:** Connection pool usage, query duration

---

## 🏁 Checklist Cuối Phase 16 (Graduation!)

### 16A — Microservices:
- [ ] Auth Service chạy độc lập (port 8001)
- [ ] Product Service chạy độc lập (port 8002)
- [ ] Order Service chạy độc lập (port 8003)
- [ ] API Gateway routing đúng (port 8000)
- [ ] Mỗi service có DB riêng
- [ ] Frontend chỉ gọi Gateway

### 16B — Message Queue:
- [ ] RabbitMQ running + management UI accessible
- [ ] Order created → email confirmation sent (async)
- [ ] Order status changed → email notification sent
- [ ] Messages persistent (survive restart)
- [ ] Dead letter queue cho failed messages

### 16C — Monitoring:
- [ ] Winston structured logging (JSON)
- [ ] Log masking cho sensitive data
- [ ] Prometheus metrics exposed `/metrics`
- [ ] Grafana dashboard: request rate, latency, errors
- [ ] Loki centralized log search

### Final:
- [ ] `docker compose up` → TOÀN BỘ hệ thống chạy
- [ ] README.md cực chất (architecture diagram, setup guide, screenshots)
- [ ] **Portfolio-ready** 🎉

---

## 📚 Tài Liệu Nên Đọc

| Chủ đề | Link |
|---|---|
| Microservices Patterns | https://microservices.io/patterns/index.html |
| API Gateway Pattern | https://microservices.io/patterns/apigateway.html |
| RabbitMQ Tutorials | https://www.rabbitmq.com/getstarted.html |
| Prometheus Getting Started | https://prometheus.io/docs/introduction/first_steps/ |
| Grafana Dashboards | https://grafana.com/grafana/dashboards/ |
| The Twelve-Factor App | https://12factor.net/ |

---

## 🎓 Lời Kết Từ Tech Lead

Nếu em hoàn thành đến đây, em đã:

✅ Xây dựng **full-stack multi-vendor marketplace** từ zero
✅ Hiểu **database design** cho hệ thống phức tạp
✅ Implement **JWT auth** với security best practices
✅ Xử lý **concurrent stock management** (race conditions)
✅ Tích hợp **payment**, **caching**, **file upload**
✅ Containerize với **Docker** + CI/CD với **GitHub Actions**
✅ Chuyển từ **Monolith → Microservices** một cách có kế hoạch
✅ Setup **event-driven architecture** với Message Queue
✅ Monitoring hệ thống phân tán với **Prometheus + Grafana**

Đây là kiến thức đủ để apply vị trí **Junior/Mid-level Backend Engineer** ở bất kỳ công ty nào. 🚀

> *"The best way to learn is to build something real."*
