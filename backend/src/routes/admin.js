import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Activity } from "../models/Activity.js";
import { Setting } from "../models/Setting.js";

const router = Router();

router.get("/stats", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // 1. Tổng kết con số
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const customersCount = await User.countDocuments({ role: "user" });

    // 2. Thống kê doanh thu theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format lại dữ liệu cho chart
    const chartData = monthlyRevenue.map(item => ({
      label: `T${item._id.month}/${item._id.year}`,
      revenue: item.revenue
    }));

    // 3. Top viewed products
    const topViewedProducts = await Activity.aggregate([
      { $match: { type: "page_view", "metadata.url": { $regex: /\/products\// } } },
      { $group: { _id: "$metadata.url", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    // 4. Google Trends from SerpApi or fallback
    let searchTrends = [];
    const serpapiKey = process.env.SERPAPI_API_KEY;
    if (serpapiKey) {
      try {
        const response = await fetch(
          `https://serpapi.com/search.json?engine=google_trends_trending_now&frequency=realtime&geo=VN&api_key=${serpapiKey}`
        );
        if (response.ok) {
          const serpData = await response.json();
          if (serpData.trending_searches && Array.isArray(serpData.trending_searches)) {
            searchTrends = serpData.trending_searches.slice(0, 6).map((item) => ({
              query: item.query,
              views: item.formatted_value || "10K+ searches",
              link: item.link || `https://www.google.com/search?q=${encodeURIComponent(item.query)}`
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch SerpApi Google Trends:", err);
      }
    }

    // Fallback if SerpApi is not configured or fails
    if (searchTrends.length === 0) {
      searchTrends = [
        { query: "Nike Air Force 1", views: "Trending #1", link: "https://www.google.com/search?q=Nike+Air+Force+1" },
        { query: "Adidas Samba", views: "Trending #2", link: "https://www.google.com/search?q=Adidas+Samba" },
        { query: "New Balance 550", views: "Trending #3", link: "https://www.google.com/search?q=New+Balance+550" },
        { query: "Adidas Gazelle", views: "Trending #4", link: "https://www.google.com/search?q=Adidas+Gazelle" },
        { query: "Nike Air Jordan 1", views: "Trending #5", link: "https://www.google.com/search?q=Nike+Air+Jordan+1" },
        { query: "Puma Palermo", views: "Trending #6", link: "https://www.google.com/search?q=Puma+Palermo" }
      ];
    }

    res.json({
      stats: {
        revenue: totalRevenue[0]?.total || 0,
        orders: ordersCount,
        products: productsCount,
        customers: customersCount,
        pageViews24h: await Activity.countDocuments({ 
          type: "page_view", 
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        })
      },
      chartData,
      topViewedProducts,
      searchTrends
    });
  } catch (error) {
    next(error);
  }
});

// Lấy cấu hình AI
router.get("/settings/ai", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: "ai_tools" });
    if (!settings) {
      settings = await Setting.create({ 
        key: "ai_tools", 
        value: { search_products: true, get_order_status: true } 
      });
    }
    res.json(settings.value);
  } catch (error) {
    next(error);
  }
});

// Cập nhật cấu hình AI
router.post("/settings/ai", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { value } = req.body;
    const settings = await Setting.findOneAndUpdate(
      { key: "ai_tools" },
      { value },
      { upsert: true, new: true }
    );
    res.json(settings.value);
  } catch (error) {
    next(error);
  }
});

export default router;
