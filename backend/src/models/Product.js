
import mongoose from "mongoose";
// Import thư viện Mongoose để định nghĩa cấu trúc dữ liệu
// và thao tác với cơ sở dữ liệu MongoDB.

// Khai báo Schema mô tả cấu trúc của một sản phẩm giày.
const productSchema = new mongoose.Schema(
  {
    // ==================== THÔNG TIN CƠ BẢN ====================

    // Tên sản phẩm, ví dụ: Nike Air Max 270.
    // required: true: bắt buộc phải có tên sản phẩm.
    // trim: true: loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Slug là định danh thân thiện với URL.
    // Ví dụ: nike-air-max-270.
    // required: true: bắt buộc phải có slug.
    // unique: true: yêu cầu slug không trùng lặp trong collection.
    // lowercase: true: chuyển chuỗi thành chữ thường.
    // trim: true: loại bỏ khoảng trắng ở đầu và cuối chuỗi.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Mã SKU dùng để nhận diện và quản lý sản phẩm trong kho.
    // unique: true: các giá trị SKU phải duy nhất khi chỉ mục
    // duy nhất đã được tạo thành công trong MongoDB.
    // sparse: true: không áp dụng chỉ mục cho các tài liệu
    // không có trường SKU trong chỉ mục.
    sku: {
      type: String,
      unique: true,
      sparse: true
    },

    // Mô tả chi tiết sản phẩm.
    // required: true: bắt buộc phải có phần mô tả.
    description: {
      type: String,
      required: true
    },

    // ==================== GIÁ CẢ ====================

    // Giá bán hiện tại của sản phẩm.
    // required: true: bắt buộc phải có giá bán.
    // min: 0: giá không được nhỏ hơn 0.
    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Giá gốc hoặc giá niêm yết dùng để so sánh với giá bán.
    // Không bắt buộc phải có giá trị.
    // min: 0: giá trị không được nhỏ hơn 0.
    originalPrice: {
      type: Number,
      min: 0
    },

    // ==================== PHÂN LOẠI SẢN PHẨM ====================

    // ID danh mục mà sản phẩm thuộc về.
    // ref: "Category" khai báo Model được tham chiếu.
    // required: true: sản phẩm bắt buộc phải có categoryId.
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    // ID thương hiệu của sản phẩm.
    // ref: "Brand" khai báo Model thương hiệu được tham chiếu.
    // required: true: sản phẩm bắt buộc phải có brandId.
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true
    },

    // Lưu tên thương hiệu để thuận tiện cho việc tìm kiếm.
    // Đây là dữ liệu bổ sung, có thể được đồng bộ từ Model Brand.
    // Nếu tên thương hiệu thay đổi, cần cân nhắc cập nhật trường này.
    brandName: {
      type: String
    },

    // ==================== ĐẶC TÍNH GIÀY ====================

    // Đối tượng khách hàng mà sản phẩm hướng đến.
    // enum giới hạn vào bốn giá trị:
    // men: nam; women: nữ; unisex: dùng chung; kids: trẻ em.
    // Nếu không cung cấp, mặc định là unisex.
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "kids"],
      default: "unisex"
    },

    // Kiểu dáng cổ giày.
    // low: cổ thấp; mid: cổ trung; high: cổ cao.
    // Nếu không cung cấp, mặc định là low.
    style: {
      type: String,
      enum: ["low", "mid", "high"],
      default: "low"
    },

    // Danh sách chất liệu cấu thành sản phẩm.
    // Ví dụ: leather, mesh, synthetic.
    // Mỗi phần tử trong mảng có kiểu String.
    materials: [
      { type: String }
    ],

    // Danh sách màu sắc của sản phẩm.
    // Ví dụ: Black, White, Red.
    colors: [
      { type: String }
    ],

    // ==================== QUẢN LÝ TỒN KHO ====================

    // Danh sách các biến thể theo kích cỡ giày.
    // Mỗi biến thể gồm kích cỡ và số lượng tồn kho tương ứng.
    variants: [
      {
        // Kích cỡ của biến thể giày, ví dụ: 38, 39, 40.
        // Bắt buộc phải có kích cỡ.
        size: {
          type: Number,
          required: true
        },

        // Số lượng sản phẩm còn trong kho của kích cỡ đó.
        // Bắt buộc phải có giá trị.
        // min: 0: không cho phép số lượng tồn kho âm.
        // default: 0: mặc định chưa có hàng trong kho.
        stock: {
          type: Number,
          required: true,
          min: 0,
          default: 0
        }
      }
    ],

    // Tổng số lượng tồn kho của tất cả các biến thể.
    // Giá trị này được tính lại trong middleware pre("save") bên dưới.
    totalStock: {
      type: Number,
      default: 0
    },

    // ==================== HÌNH ẢNH ====================

    // Danh sách URL hình ảnh sản phẩm.
    // Mỗi phần tử trong mảng là một chuỗi đường dẫn ảnh.
    // Ví dụ: URL ảnh được lưu trên Cloudinary.
    images: [
      { type: String, required: true }
    ],

    // ==================== TRẠNG THÁI VÀ MARKETING ====================

    // Trạng thái hiển thị và quản lý sản phẩm.
    // active: sản phẩm đang hoạt động.
    // draft: sản phẩm ở trạng thái nháp.
    // archived: sản phẩm được lưu trữ.
    // Mặc định là active.
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active"
    },

    // Xác định sản phẩm có được đánh dấu nổi bật hay không.
    // Dùng Boolean với giá trị true hoặc false.
    // Mặc định sản phẩm không nổi bật.
    isFeatured: {
      type: Boolean,
      default: false
    },

    // Đánh dấu sản phẩm bán chạy hay không.
    // Trường này phục vụ việc phân loại hoặc hiển thị sản phẩm.
    // Mặc định là false; việc xác định bán chạy cần được xử lý
    // bởi logic nghiệp vụ hoặc chức năng quản trị.
    isBestSeller: {
      type: Boolean,
      default: false
    },

    // Các từ khóa hoặc nhãn dùng để phân loại sản phẩm.
    // Ví dụ: running, lifestyle, sport.
    tags: [
      { type: String }
    ],

    // ==================== DỮ LIỆU HỖ TRỢ AI ====================

    // Chuỗi tổng hợp thông tin sản phẩm phục vụ tìm kiếm.
    // Có thể kết hợp tên, thương hiệu, màu sắc, chất liệu,
    // mô tả và nhãn để hỗ trợ tìm kiếm theo từ khóa.
    // Đây không phải mô hình AI tự học hay embedding vector.
    aiSearchString: {
      type: String
    }
  },

  // Tự động tạo hai trường thời gian:
  // createdAt: thời điểm tạo sản phẩm.
  // updatedAt: thời điểm cập nhật sản phẩm gần nhất.
  { timestamps: true }
);

// ==================== MIDDLEWARE TRƯỚC KHI LƯU ====================

// Đăng ký middleware pre("save").
// Middleware này chạy trước thao tác save() của tài liệu Product.
productSchema.pre("save", function(next) {

  // Tính tổng tồn kho bằng cách cộng stock của tất cả biến thể.
  // reduce() duyệt mảng variants và cộng số lượng từng kích cỡ.
  // Kết quả được gán vào totalStock.
  this.totalStock = this.variants.reduce(
    (total, v) => total + v.stock,
    0
  );

  // ==================== TẠO CHUỖI TÌM KIẾM ====================

  // Thu thập các trường thông tin có thể dùng để tìm kiếm sản phẩm.
  const parts = [
    this.name,                         // Tên sản phẩm.
    this.brandName,                    // Tên thương hiệu.
    this.gender,                       // Đối tượng sử dụng.
    this.style,                        // Kiểu dáng cổ giày.
    (this.materials || []).join(" "),  // Danh sách chất liệu.
    (this.colors || []).join(" "),     // Danh sách màu sắc.
    (this.tags || []).join(" "),       // Danh sách từ khóa.
    this.description                   // Mô tả sản phẩm.
  ];

  // Loại bỏ các giá trị rỗng hoặc không có giá trị,
  // ghép các phần còn lại thành một chuỗi duy nhất,
  // sau đó chuyển toàn bộ chuỗi thành chữ thường.
  // Kết quả được lưu vào aiSearchString.
  this.aiSearchString = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Chuyển sang bước tiếp theo của quá trình lưu.
  next();
});

// ==================== CHỈ MỤC TÌM KIẾM ====================

// Tạo chỉ mục tìm kiếm văn bản trên ba trường:
// name: tên sản phẩm.
// description: mô tả sản phẩm.
// aiSearchString: chuỗi thông tin tổng hợp phục vụ tìm kiếm.
// Chỉ mục này hỗ trợ các truy vấn text search của MongoDB.
productSchema.index({
  name: "text",
  description: "text",
  aiSearchString: "text"
});

// Tạo và xuất Model Product từ productSchema.
// Model được dùng để thêm, truy vấn, cập nhật
// và xóa dữ liệu sản phẩm trong MongoDB.
export const Product = mongoose.model("Product", productSchema);
