# Job Frontend

Giao diện người dùng hiện đại và thông minh dành cho hệ thống tuyển dụng và so khớp việc làm bằng AI, được xây dựng bằng **Next.js 14**, **TypeScript**, và **Tailwind CSS**.

---

## ✨ Các Tính Năng Nổi Bật

- **Giao Diện Hiện Đại (Modern UI/UX)**: Thiết kế tinh tế, trực quan, tối ưu hóa trải nghiệm người dùng và hoàn toàn tương thích với mọi thiết bị di động (Responsive).
- **Hệ Thống Xác Thực Đầy Đủ**: Đăng ký, đăng nhập tài khoản an toàn sử dụng JWT Token kết hợp bảo vệ các trang bằng Middleware bảo mật.
- **Bảng Điều Khiển Riêng Biệt (Role-based Dashboards)**: Cung cấp giao diện làm việc tối ưu hóa cho từng nhóm đối tượng:
  - **Ứng viên (Candidate)**: Quản lý hồ sơ cá nhân, CV, xem lịch sử ứng tuyển, và các công việc được gợi ý từ AI.
  - **Nhà tuyển dụng (Employer)**: Tạo tin tuyển dụng, quản lý danh sách việc làm đã đăng, xem danh sách ứng viên, duyệt CV, và lên lịch phỏng vấn.
  - **Quản trị viên (Admin)**: Quản lý người dùng, duyệt tin đăng tuyển, xem thống kê hệ thống toàn diện.
- **Trò Chuyện Thời Gian Thực**: Giao diện chat trực quan với Socket.IO để Ứng viên và Nhà tuyển dụng nhắn tin trao đổi trực tiếp với nhau.
- **Tải Lên CV Kéo Thả**: Sử dụng giao diện kéo thả mượt mà với thanh tiến trình tải lên, tích hợp tính năng tự động phân tích CV bằng AI sau khi upload.
- **Quản Lý Trạng Thái Toàn Cục**: Quản lý trạng thái đăng nhập, thông tin người dùng hiệu quả bằng **Zustand**.
- **Kiểm Soát Lỗi Nghiêm Ngặt**: Tận dụng triệt để **TypeScript** cho tính an toàn về kiểu dữ liệu (Type-safety), và **Zod** để xác thực biểu mẫu đăng ký/đăng nhập phía Client.
- **Truy Xuất Dữ Liệu Tối Ưu**: Sử dụng **React Query** (`@tanstack/react-query`) để gọi API, lưu cache, và đồng bộ trạng thái dữ liệu hiệu quả.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Next.js 14** - Thư viện ứng dụng React với App Router thế hệ mới tối ưu SEO và tốc độ tải trang.
- **TypeScript** - Ngôn ngữ cung cấp kiểu dữ liệu nghiêm ngặt tránh lỗi runtime.
- **Tailwind CSS** - Framework CSS thiết kế giao diện nhanh chóng bằng các class tiện ích.
- **React Hook Form** - Quản lý trạng thái biểu mẫu (Form) hiệu năng cao.
- **Zod** - Xác thực cấu trúc dữ liệu và xử lý thông báo lỗi biểu mẫu.
- **Zustand** - Thư viện quản lý trạng thái toàn cục siêu nhẹ và mượt mà.
- **React Query** - Quản lý đồng bộ trạng thái dữ liệu máy chủ và tự động lưu cache.
- **Socket.IO Client** - Kết nối WebSocket thời gian thực tới Backend Chat Server.
- **Axios** - Thư viện HTTP Client tạo các yêu cầu gọi API dễ dàng.
- **React Dropzone** - Tạo khu vực kéo-thả tải lên file CV chuyên nghiệp.
- **Lucide React** - Thư viện icon SVG hiện đại, sắc nét.

---

## 📋 Yêu Cầu Hệ Thống (Prerequisites)

- **Node.js** phiên bản 18 hoặc cao hơn (Bạn đang có sẵn phiên bản mới nhất `v25.6.1`)
- **npm** hoặc **yarn** (Đã có sẵn npm `11.9.0`)

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

### 1. Cài đặt trực tiếp (Local Development)

#### Bước 1.1: Di chuyển vào thư mục frontend và cài đặt thư viện phụ thuộc
```bash
cd job-frontend
npm install
```

#### Bước 1.2: Tạo file cấu hình môi trường `.env.local`
Sao chép file ví dụ có sẵn để bắt đầu cấu hình:
```bash
cp .env.local.example .env.local
```

#### Bước 1.3: Khởi động giao diện Next.js
Chạy máy chủ phát triển cục bộ với tính năng cập nhật giao diện trực tiếp (Hot Reload):
```bash
npm run dev
```

Sau khi khởi chạy thành công, mở trình duyệt của bạn và truy cập: [http://localhost:3000](http://localhost:3000).

---

### 2. Sử dụng Docker (Nếu có)

#### Build Docker Image:
```bash
docker build -t job-frontend .
```

#### Khởi chạy Container:
```bash
docker run -d -p 3000:3000 --env-file .env.local --name job-frontend job-frontend
```

---

## ⚙️ Cấu Hình Môi Trường (Configuration)

Hãy chỉnh sửa các giá trị thực tế của bạn trong file `.env.local` vừa tạo:

```env
# Địa chỉ URL của các API bên ngoài
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# Tên Cloud Đám mây Cloudinary trỏ tới kho lưu trữ CV trực tuyến
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Địa chỉ URL của chính ứng dụng Frontend này
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏃 Các Chế Độ Khởi Chạy (Running)

### Chế độ phát triển (Development Mode)
```bash
npm run dev
```
*Giao diện chạy tại: http://localhost:3000*

### Chế độ vận hành (Production Mode)
Trước khi đưa ứng dụng lên máy chủ chính thức, Next.js yêu cầu biên dịch mã nguồn sang dạng tối ưu hóa hiệu năng:

```bash
# Biên dịch dự án
npm run build

# Khởi chạy server chạy bản đã biên dịch
npm start
```

---

## 📁 Cấu Trúc Thư Mục Chính (Project Structure)

```
job-frontend/
├── src/
│   ├── app/                    # Next.js App Router (Các trang chính)
│   │   ├── (auth)/             # Nhóm trang xác thực (Đăng nhập/Đăng ký)
│   │   ├── dashboard/          # Nhóm trang Bảng điều khiển (Candidate, Employer, Admin)
│   │   ├── globals.css         # CSS toàn cục (Tailwind)
│   │   ├── layout.tsx          # Giao diện khung chính (Root Layout)
│   │   └── page.tsx            # Trang chủ hệ thống (Homepage)
│   ├── components/             # Các React Components tái sử dụng
│   │   ├── ui/                 # UI cơ bản (Button, Input, Badge,...)
│   │   └── ...
│   ├── lib/                    # Các hàm tiện ích và API Client
│   │   ├── utils.ts            # Hàm xử lý class Tailwind linh hoạt
│   │   └── api.ts              # Axios Client tích hợp tự động gửi Token
│   ├── store/                  # Quản lý trạng thái toàn cục (Zustand Stores)
│   │   └── authStore.ts        # Quản lý trạng thái Đăng nhập/Đăng xuất
│   ├── types/                  # Định nghĩa kiểu dữ liệu TypeScript
│   └── middleware.ts           # Middleware Next.js bảo vệ các trang Dashboard
└── tailwind.config.js          # File cấu hình thiết kế giao diện Tailwind
```

---

## 📝 Minh Họa Cách Sử Dụng Quản Lý Trạng Thái Đăng Nhập (Zustand Store)

Bạn có thể dễ dàng truy xuất thông tin người dùng đang đăng nhập hoặc thực hiện đăng xuất từ bất kỳ React component nào:

```typescript
import { useAuthStore } from '@/store/authStore';

export default function UserMenu() {
  const { user, logout, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <a href="/auth/login">Đăng nhập</a>;

  return (
    <div>
      <p>Xin chào, {user?.name}!</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
```

---

## 🛠️ Khắc Phục Lỗi Thường Gặp (Troubleshooting)

### 1. Lỗi biên dịch TypeScript khi chạy `npm run build`
- **Khắc phục**: Chạy lệnh kiểm tra kiểu dữ liệu tĩnh để phát hiện file chứa lỗi:
  ```bash
  npx tsc --noEmit
  ```
  Hãy sửa chính xác kiểu dữ liệu của biến hoặc thêm các giá trị an toàn tránh dùng kiểu `any` không xác định.

### 2. Giao diện bị vỡ hoặc mất Tailwind CSS classes
- **Khắc phục**: Đảm bảo các thư mục mới của bạn nằm đúng trong phạm vi cấu hình của thuộc tính `content` trong file `tailwind.config.js`. Thử xóa thư mục `.next` biên dịch cũ và khởi chạy lại server:
  ```bash
  rm -rf .next
  npm run dev
  ```

### 3. API trả về lỗi không thể gửi yêu cầu (`Failed to fetch`)
- **Khắc phục**: Kiểm tra xem file `.env.local` đã được cấu hình đúng cổng của Backend API chưa (mặc định là `http://localhost:3001`). Hãy đảm bảo dịch vụ Backend của bạn đang chạy song song ở cổng này.
