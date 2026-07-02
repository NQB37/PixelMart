# 👑 PHASE 11: Admin Dashboard & Revenue Reports

> **Prerequisite:** Phase 10 hoàn thành.

---

## 🎯 MVP Của Phase Này

- API Admin Stats: overview stats (tổng users, shops, orders, revenue)
- API thống kê doanh thu theo ngày/tháng/năm
- API quản lý users (list, ban/unban)
- API quản lý shops (approve/suspend, xem chi tiết)
- API quản lý categories
- API Seller Stats: revenue, order stats, top products

## 🗄️ Database Changes (MVP)

Phase này **không có bảng mới** nào được tạo. Toàn bộ các chức năng thống kê báo cáo sẽ được truy vấn trực tiếp từ các bảng hiện tại (`User`, `Shop`, `Product`, `Order`) bằng cách sử dụng các hàm aggregate (`_sum`, `count`, `groupBy`) và raw query (`DATE_TRUNC` trong PostgreSQL) để nhóm dữ liệu doanh thu theo ngày, tuần, tháng hoặc năm.

---

## 📋 Task Breakdown

### Task 11.1: Admin Stats API (3-4h)

#### `src/modules/admin/admin.service.ts`:

```typescript
import { prisma } from "@/lib/prisma";

class AdminService {
  async getDashboardStats() {
    const [
      userCount,
      shopCount,
      orderCount,
      revenue,
      pendingShops,
      todayOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.shop.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.shop.count({ where: { approvalStatus: "PENDING" } }),
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

  async getRevenueChart(period: "week" | "month" | "year") {
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case "week":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "month":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "year":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupBy = "month";
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
        id: true,
        name: true,
        slug: true,
        price: true,
        soldCount: true,
        images: { where: { isPrimary: true }, take: 1 },
        shop: { select: { shopName: true } },
      },
      orderBy: { soldCount: "desc" },
      take: limit,
    });
  }

  async getTopShops(limit = 10) {
    return prisma.shop.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        shopName: true,
        logoUrl: true,
        rating: true,
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { rating: "desc" },
      take: limit,
    });
  }

  // User management
  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          profile: { select: { fullName: true, avatarUrl: true } },
          roles: { select: { role: { select: { name: true } } } },
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async toggleUserActive(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new Error("User not found");
    if (user.roles.some((r) => r.role.name === "ADMIN"))
      throw new Error("Cannot ban admin");

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

## 🏁 Checklist Cuối Phase 11

- [ ] API Admin dashboard: 6 stat cards hiển thị đúng
- [ ] API thống kê doanh thu (Revenue) theo tuần/tháng/năm hoạt động đúng
- [ ] User management APIs: search, ban/unban hoạt động
- [ ] Shop management APIs: approve/suspend hoạt động
- [ ] Top products + top shops APIs hoạt động
- [ ] API Seller stats: revenue, order stats, top products hoạt động
- [ ] Commit: "feat: admin and seller stats APIs with revenue analytics"
