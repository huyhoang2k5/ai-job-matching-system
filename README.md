# 🚀 AI Job Matching & Smart Recruitment System
> **Hệ thống Tuyển dụng và Gợi ý việc làm thông minh ứng dụng Trí tuệ nhân tạo (AI)**  
> *Đồ án Chuyên ngành 1 – Khoa Khoa học Máy tính, Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)*

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-green?logo=node.js)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/AI_Service-FastAPI_Python-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Real--time-Socket.IO-white?logo=socket.io)](https://socket.io/)

---

## 📌 Giới thiệu dự án

**AI Job Matching System** là nền tảng tuyển dụng hiện đại giải quyết bài toán sàng lọc hồ sơ tự động cho nhà tuyển dụng và định hướng nghề nghiệp chuẩn xác cho ứng viên. Hệ thống tích hợp mô hình thị giác máy tính và xử lý ngôn ngữ tự nhiên (NLP) để phân tích CV tiếng Việt/tiếng Anh, trích xuất kỹ năng, kinh nghiệm và tính toán độ tương thích (Match Score) giữa hồ sơ ứng viên với Mô tả công việc (Job Description - JD) theo thời gian thực.

---

## 🏛️ Kiến trúc hệ thống (System Architecture)

Hệ thống được thiết kế theo kiến trúc **Microservices / Decoupled Architecture** gồm 3 phân hệ hoạt động độc lập và liên kết thông qua RESTful API và WebSocket:

```mermaid
graph TD
    User["Người dùng (Ứng viên / Nhà tuyển dụng)"] -->|HTTPS| Frontend["job-frontend (Next.js 14) :3000"]
    Frontend -->|RESTful API & JWT| Backend["job-backend (Node.js/Express) :3001"]
    Frontend <-->|WebSocket Real-time Chat| Backend
    Backend -->|Database Query| DB[("MongoDB Database")]
    Backend -->|Upload File CV & Avatar| Cloudinary[("Cloudinary Cloud Storage")]
    Backend -->|Send Mail Notification| Mailer["Nodemailer (Gmail SMTP)"]
    Backend -->|Gửi File CV & Yêu cầu Match| AIService["cv-ai-service (FastAPI Python) :8000"]
    AIService -->|OCR (EasyOCR, Tesseract)| TextExtract["Trích xuất Text từ PDF/Ảnh"]
    AIService -->|NLP (Spacy, Underthesea)| EntityExtract["Bóc tách Thực thể & Kỹ năng"]
    AIService -->|Cosine Similarity / Matcher| MatchScore["Tính điểm % phù hợp JD"]
    AIService -->|Trả kết quả JSON| Backend
```

---

## 📂 Cấu trúc Repository (Monorepo)

```text
├── job-backend/                # [Backend API] Node.js, Express, MongoDB, Socket.IO
│   ├── src/                    # Controllers, Models, Routes, Middlewares, Socket handlers
│   ├── .env.example            # Biến môi trường mẫu Backend
│   └── package.json
│
├── job-frontend/               # [Client App] Next.js 14 (App Router), Tailwind, TypeScript
│   ├── src/                    # Components, App pages, Hooks, Services
│   ├── tests/                  # Playwright Integration Tests
│   ├── .env.local.example      # Biến môi trường mẫu Frontend
│   └── package.json
│
├── cv-ai-service/              # [AI Microservice] Python FastAPI, EasyOCR, NLP
│   ├── app/                    # API Routers, Parsers, Matchers, Schemas
│   ├── requirements.txt        # Thư viện Python AI/ML
│   └── .env.example            # Biến môi trường mẫu AI Service
│
├── CV mẫu test AI/             # Bộ CV thực tế (PDF, Word) dùng để kiểm thử Pipeline AI
├── Báo cáo & Đề cương ĐACN1/   # Báo cáo đồ án chính thức & Đề cương chi tiết
├── Lệnh chạy Backend.txt       # Hướng dẫn dòng lệnh kiểm thử nhanh
└── README.md                   # Tài liệu tổng quan dự án
```

---

## ✨ Tính năng cốt lõi

### 1. Phân tích CV & Gợi ý việc làm bằng AI (AI Matching Engine)
- Tiếp nhận file CV đa định dạng: PDF, DOCX, Hình ảnh (PNG, JPG).
- **Pipeline OCR & NLP**: Kết hợp **EasyOCR**, **Tesseract**, **PyMuPDF**, **Spacy** và **Underthesea** (xử lý ngôn ngữ tự nhiên tiếng Việt).
- Tự động nhận diện cấu trúc CV: Thông tin liên hệ, Học vấn, Số năm kinh nghiệm, Danh mục kỹ năng (Hard skills, Soft skills, Công nghệ).
- **Tính toán Match Score**: So khớp ngữ nghĩa giữa CV và yêu cầu tuyển dụng của JD, đưa ra tỷ lệ phù hợp (%) kèm phân tích điểm mạnh và kỹ năng còn thiếu.

### 2. Kênh trò chuyện thời gian thực (Real-time Messaging)
- Tích hợp **Socket.IO** phân luồng chat theo phòng (`roomId`) giữa ứng viên và nhà tuyển dụng.
- Lưu trữ lịch sử tin nhắn, thông báo tin nhắn mới và trạng thái online/offline tức thì.

### 3. Quy trình tuyển dụng khép kín (End-to-End Workflow)
- **Dành cho ứng viên**: Tìm kiếm & lọc việc làm, nộp CV một chạm, theo dõi tiến độ ứng tuyển, nhận phản hồi trực tiếp.
- **Dành cho nhà tuyển dụng**: Đăng tin tuyển dụng, xem danh sách ứng viên được AI xếp hạng theo độ phù hợp, lọc CV theo kỹ năng, gửi email mời phỏng vấn tự động qua **Nodemailer**.
- **Lưu trữ đám mây**: Quản lý file hồ sơ an toàn trên **Cloudinary**.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Phân hệ | Công nghệ chủ đạo | Thư viện & Công cụ chính |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, TypeScript | Tailwind CSS, TanStack React Query, Framer Motion, Lucide Icons, Headless UI, React Hook Form, Zod |
| **Backend** | Node.js, Express.js | MongoDB / Mongoose, Socket.IO, JWT, Bcryptjs, Cloudinary SDK, Nodemailer, Axios, Helmet, Rate-Limit, Winston |
| **AI / NLP** | Python 3.10+, FastAPI, Uvicorn | EasyOCR, Tesseract, PyMuPDF, pdfplumber, Spacy, Underthesea, Scikit-learn, TensorFlow, NumPy, Pandas |
| **DevOps & QA** | Git, Playwright, Jest, Postman | Docker, Vercel, Railway, Postman Collection |

---

## 👥 Đội ngũ phát triển & Phân công vai trò

* **Lê Nguyên Huy Hoàng** – **Backend Developer & System Architect**
  * Quản lý & phát triển toàn bộ hệ thống `job-backend` (RESTful API, Socket.IO, MongoDB Schema, JWT Auth).
  * Lập trình cầu nối tích hợp với `cv-ai-service`, xử lý luồng upload CV lên Cloudinary và lưu dữ liệu bóc tách.
  * Xây dựng hệ thống chat thời gian thực và tự động hóa email thông báo qua Nodemailer.
* **Đặng Quốc Huy** – **Frontend Developer**
  * Thiết kế và xây dựng giao diện người dùng `job-frontend` bằng Next.js 14 & Tailwind CSS.
  * Tích hợp TanStack Query quản lý state API, giao diện kéo thả nộp CV và màn hình chat Socket.IO Client.
* **Đoàn Nguyên Bảo** – **AI/ML Engineer**
  * Phát triển dịch vụ `cv-ai-service` bằng FastAPI.
  * Xây dựng Pipeline trích xuất văn bản từ CV (OCR) và mô hình trích xuất thực thể, tính điểm tương thích.

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### Bước 1: Khởi động AI Microservice (Port 8000)
```bash
cd cv-ai-service
python -m venv .venv
# Kích hoạt môi trường ảo:
# Windows: .venv\Scripts\activate | Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Bước 2: Khởi động Backend API (Port 3001)
```bash
cd job-backend
npm install
# Cấu hình file .env dựa trên .env.example
npm run dev
```

### Bước 3: Khởi động Frontend Client (Port 3000)
```bash
cd job-frontend
npm install
# Cấu hình file .env.local dựa trên .env.local.example
npm run dev
```

Truy cập ứng dụng tại: **`http://localhost:3000`** | Tài liệu API Swagger tại: **`http://localhost:8000/docs`**

---
*Bản quyền © 2026 - Nhóm sinh viên VKU (Lê Nguyên Huy Hoàng, Đặng Quốc Huy, Đoàn Nguyên Bảo).*
