# 👑 PHASE 11: Admin Dashboard & Revenue Reports

> **Prerequisite:** Phase 10 hoàn thành.

---

## 🎯 MVP Của Phase Này

- Admin Dashboard: overview stats (tổng users, shops, orders, revenue)
- Biểu đồ doanh thu theo ngày/tháng (Recharts)
- Quản lý users (list, ban/unban)
- Quản lý shops (list, approve/suspend, xem chi tiết)
- Quản lý categories (đã làm ở Phase 5, hoàn thiện UI)
- Seller Dashboard: revenue chart, order stats, top products

---

## 🗄️ Database Changes (MVP)

Phase này **không có bảng mới** nào được tạo. Toàn bộ các chức năng thống kê báo cáo sẽ được truy vấn trực tiếp từ các bảng hiện tại (`User`, `Shop`, `Product`, `Order`) bằng cách sử dụng các hàm aggregate (`_sum`, `count`, `groupBy`) và raw query (`DATE_TRUNC` trong PostgreSQL) để nhóm dữ liệu doanh thu theo ngày, tuần, tháng hoặc năm.

---

## 📋 Task Breakdown

### Task 11.1: Admin Stats API (3-4h)

#### `src/modules/admin/admin.service.ts`:
```typescript
import { prisma } from '@/lib/prisma';

class AdminService {
  async getDashboardStats() {
    const [userCount, shopCount, orderCount, revenue, pendingShops, todayOrders] = 
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.shop.count({ where: { status: 'ACTIVE' } }),
        prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
        prisma.order.aggregate({
          where: { paymentStatus: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.shop.count({ where: { status: 'PENDING' } }),
        prisma.order.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
      ]);

    return {
      totalUsers: userCount,
      totalShops: shopCount,
      totalOrders: orderCount,
      totalRevenue: revenue._sum.totalAmount || 0,
      pendingShops,
      todayOrders,
    };
  }

  async getRevenueChart(period: 'week' | 'month' | 'year') {
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupBy = 'month';
        break;
    }

    // Raw SQL để group by date trunc
    const data = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${groupBy}, "createdAt") as date,
        COUNT(*)::int as "orderCount",
        COALESCE(SUM("totalAmount"), 0) as revenue
      FROM orders
      WHERE "createdAt" >= ${startDate}
        AND "paymentStatus" = 'PAID'
      GROUP BY DATE_TRUNC(${groupBy}, "createdAt")
      ORDER BY date ASC
    `;

    return data;
  }

  async getTopProducts(limit = 10) {
    return prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true, name: true, slug: true, price: true, soldCount: true,
        images: { where: { isPrimary: true }, take: 1 },
        shop: { select: { name: true } },
      },
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }

  async getTopShops(limit = 10) {
    return prisma.shop.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true, name: true, slug: true, logo: true, rating: true,
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });
  }

  // User management
  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, fullName: true, role: true,
          isActive: true, createdAt: true,
          _count: { select: { orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async toggleUserActive(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.role === 'ADMIN') throw new Error('Cannot ban admin');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }
}

export const adminService = new AdminService();
```

### Task 11.2: Seller Dashboard Stats API (2-3h)

```typescript
// Seller-specific stats:
// - Doanh thu shop (tổng, hôm nay, tuần, tháng)
// - Biểu đồ doanh thu theo ngày
// - Số đơn hàng theo trạng thái
// - Top 5 sản phẩm bán chạy nhất
// - Đánh giá trung bình shop
```

### Task 11.3: Admin UI — React + Vite SPA (web/admin-web) (5-8h)

```bash
cd web/admin-web
pnpm add recharts react-router-dom lucide-react
# Cấu hình React Router và tích hợp thư viện vẽ biểu đồ
```

**Các trang (Routes) cần cấu hình trong React Router:**

```
/                       — Dashboard chính (stats cards + biểu đồ doanh thu + đơn hàng mới)
/users                  — Quản lý người dùng (table danh sách, nút kích hoạt/khóa tài khoản)
/shops                  — Quản lý cửa hàng (duyệt/tạm dừng hoạt động cửa hàng, xem chi tiết)
/categories             — Quản lý danh mục sản phẩm (cấu hình cây danh mục)
/orders                 — Quản lý tất cả đơn hàng trên hệ thống
/reports                — Báo cáo doanh thu chi tiết (lọc theo ngày, xuất CSV)
/coupons                — Quản lý mã giảm giá hệ thống
```

**Key components:**
- `AdminDashboardStats.tsx` — Grid hiển thị 6 thẻ thống kê
- `RevenueChart.tsx` — Biểu đồ Recharts AreaChart/LineChart
- `DataTable.tsx` — Component bảng đa năng (có ô tìm kiếm, phân trang)
- `ShopApprovalCard.tsx` — Card duyệt shop với các nút Approve/Reject

### Task 11.4: Seller Dashboard UI — React + Vite SPA (web/seller-web) (3-4h)

```bash
cd web/seller-web
pnpm add recharts react-router-dom lucide-react
```

**Các trang (Routes) cần cấu hình trong React Router:**

```
/                       — Dashboard của Seller (thống kê doanh thu shop + biểu đồ)
/products               — Quản lý sản phẩm (CRUD sản phẩm, đã làm Phase 5)
/orders                 — Quản lý đơn hàng của shop (đổi trạng thái, đã làm Phase 8)
/coupons                — Quản lý coupon của shop (đã làm Phase 10)
/reviews                — Xem đánh giá từ khách hàng
/analytics              — Báo cáo phân tích chi tiết của shop
/shop                   — Cấu hình thông tin Shop (đã làm Phase 4)
```

---

## ⚠️ Lỗi fresher hay mắc:
- **N+1 Query trong stats:** Gọi riêng `count()` cho mỗi metric = N queries. Dùng `Promise.all()` chạy song song.
- **Raw SQL injection:** `WHERE name = '${search}'` → SQL injection! Dùng Prisma tagged template literals: `` prisma.$queryRaw`...${variable}` `` — tự parameterize.
- **Chart render quá nhiều data points:** 365 data points cho biểu đồ year → chậm. Group by month hoặc week.
- **Không phân quyền admin routes ở cả frontend + backend:** Frontend chặn menu admin, nhưng user type URL trực tiếp `/admin` vẫn vào được nếu Next.js middleware thiếu.

---

## 🏁 Checklist Cuối Phase 11

- [ ] Admin dashboard: 6 stat cards hiển thị đúng
- [ ] Revenue chart: week/month/year hoạt động
- [ ] User management: search, ban/unban
- [ ] Shop management: approve/suspend
- [ ] Top products + top shops hiển thị
- [ ] Seller dashboard: revenue, order stats, top products
- [ ] Responsive trên tablet
- [ ] Commit: "feat: admin and seller dashboards with revenue analytics"
