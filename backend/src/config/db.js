
import mongoose from "mongoose";
// Import thư viện Mongoose để kết nối và thao tác với cơ sở dữ liệu MongoDB.

import { MongoMemoryServer } from "mongodb-memory-server";
// Import công cụ tạo MongoDB phục vụ môi trường phát triển cục bộ.
// Công cụ này có thể khởi chạy một tiến trình MongoDB cục bộ.

import { mkdir } from "node:fs/promises";
// Import hàm mkdir để tạo thư mục lưu trữ dữ liệu.

import { dirname, resolve } from "node:path";
// dirname: lấy đường dẫn thư mục cha.
// resolve: chuẩn hóa và tạo đường dẫn tuyệt đối.

import { fileURLToPath } from "node:url";
// Chuyển đường dẫn URL của module hiện tại thành đường dẫn file hệ thống.

// Xác định thư mục lưu dữ liệu MongoDB cục bộ.
// Đường dẫn được tính dựa trên vị trí file code hiện tại.
const localDbPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.local-mongodb"
);

// Khai báo địa chỉ kết nối tới MongoDB cục bộ.
// MongoDB sử dụng cổng 27018 và cơ sở dữ liệu tt-sneaker-store.
const localMongoUri = "mongodb://127.0.0.1:27018/tt-sneaker-store";

// Biến lưu đối tượng MongoDB cục bộ do MongoMemoryServer khởi chạy.
// Biến này được sử dụng để dừng máy chủ khi ngắt kết nối.
let localMongoServer;

// Hàm kết nối tới cơ sở dữ liệu MongoDB cục bộ.
async function connectLocalMongo() {

  // Tạo thư mục lưu dữ liệu nếu thư mục chưa tồn tại.
  // recursive: true cho phép tạo cả các thư mục cha cần thiết.
  await mkdir(localDbPath, { recursive: true });

  // Khai báo biến lưu máy chủ MongoDB sau khi khởi chạy thành công.
  let server;

  try {
    // Khởi tạo MongoDB cục bộ bằng MongoMemoryServer.
    server = await MongoMemoryServer.create({
      instance: {
        port: 27018, // Cổng chạy MongoDB cục bộ.
        dbName: "tt-sneaker-store", // Tên cơ sở dữ liệu mặc định.
        dbPath: localDbPath // Thư mục lưu dữ liệu trên ổ đĩa.
      }
    });

  } catch (startError) {
    // Nếu không khởi chạy được máy chủ mới,
    // thử kết nối tới MongoDB cục bộ đã chạy sẵn.

    try {
      await mongoose.connect(localMongoUri, {
        serverSelectionTimeoutMS: 2000
        // Giới hạn thời gian chờ tìm máy chủ MongoDB là 2 giây.
      });

      // Thông báo khi kết nối được tới máy chủ có sẵn.
      console.warn(
        "Using the already-running local MongoDB development database."
      );

      // Kết thúc hàm vì kết nối đã thành công.
      return;

    } catch (connectError) {
      // Thông báo lỗi nếu không thể kết nối tới máy chủ có sẵn.
      console.error(
        "Could not connect to an existing local MongoDB development database:",
        connectError
      );

      // Ném lại lỗi khởi chạy ban đầu để bên gọi xử lý.
      throw startError;
    }
  }

  try {
    // Kết nối Mongoose tới máy chủ vừa được khởi chạy.
    // getUri() lấy địa chỉ kết nối do MongoMemoryServer cung cấp.
    await mongoose.connect(server.getUri());

    // Lưu đối tượng máy chủ để có thể dừng nó khi cần.
    localMongoServer = server;

    // In thông báo kết nối thành công và đường dẫn lưu dữ liệu.
    console.log(`Local MongoDB connected (${localDbPath})`);

  } catch (error) {
    // Nếu kết nối Mongoose thất bại,
    // dừng máy chủ vừa tạo để tránh tiến trình bị bỏ lại.
    await server.stop();

    // Chuyển lỗi cho hàm gọi xử lý.
    throw error;
  }
}

// Hàm kết nối cơ sở dữ liệu chính của ứng dụng.
export async function connectDb() {

  // Yêu cầu Mongoose xử lý các truy vấn theo chế độ strictQuery.
  // Những trường không có trong schema sẽ được xử lý theo quy tắc này.
  mongoose.set("strictQuery", true);

  // Lấy chuỗi kết nối MongoDB từ biến môi trường.
  // Ví dụ: MONGODB_URI có thể chứa địa chỉ MongoDB Atlas.
  const uri = process.env.MONGODB_URI;

  // Nếu chưa cấu hình chuỗi kết nối MongoDB.
  if (!uri) {

    // Trong môi trường production, bắt buộc phải có MONGODB_URI.
    // Không tự động chuyển sang cơ sở dữ liệu cục bộ.
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is required in production");
    }

    // Trong môi trường phát triển, cảnh báo và sử dụng MongoDB cục bộ.
    console.warn(
      "MONGODB_URI is not configured; using the persistent local development database."
    );

    // Thực hiện kết nối tới MongoDB cục bộ.
    await connectLocalMongo();

    // Kết thúc hàm sau khi kết nối cục bộ hoàn tất.
    return;
  }

  try {
    // Ưu tiên kết nối tới MongoDB theo chuỗi URI đã cấu hình.
    // Thời gian chờ tìm máy chủ tối đa là 5 giây.
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    // Thông báo kết nối MongoDB thành công.
    console.log("MongoDB connected");

  } catch (error) {

    // Nếu kết nối thất bại trong production,
    // ném lỗi để ứng dụng xử lý thay vì tự chuyển cơ sở dữ liệu.
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    // Trong môi trường phát triển, ghi lại lỗi kết nối.
    console.error(
      "Configured MongoDB is unavailable; falling back to the persistent local development database.",
      error.message
    );

    // Chuyển sang sử dụng MongoDB cục bộ.
    await connectLocalMongo();
  }
}

// Hàm ngắt kết nối cơ sở dữ liệu.
export async function disconnectDb() {
  try {
    // Ngắt kết nối Mongoose khỏi MongoDB hiện tại.
    await mongoose.disconnect();

  } finally {
    // Nếu máy chủ cục bộ do module này khởi chạy tồn tại,
    // dừng máy chủ đó và giải phóng tài nguyên.
    await localMongoServer?.stop();

    // Xóa tham chiếu tới máy chủ cục bộ sau khi dừng.
    localMongoServer = undefined;
  }
}
