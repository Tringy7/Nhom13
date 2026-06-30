# Website Bán Laptop XYZ (Ví dụ)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

Một dự án website thương mại điện tử chuyên bán các sản phẩm laptop, được xây dựng với mục đích học tập và hoàn thiện đồ án môn học. Hệ thống bao gồm đầy đủ các chức năng cho cả phía khách hàng và trang quản trị cho admin.

---

## 📖 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Demo](#-demo)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Chức năng](#-chức-năng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Database](#-database)
- [API Endpoints](#-api-endpoints)
- [Luồng hoạt động](#-luồng-hoạt-động)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Biến môi trường (.env)](#-biến-môi-trường-env)
- [Tài khoản test](#-tài-khoản-test)
- [Screenshots](#-screenshots)
- [Hướng phát triển](#-hướng-phát-triển)
- [Thành viên](#-thành-viên)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

## 🌟 Giới thiệu

Dự án **Website Bán Laptop XYZ** là một hệ thống thương mại điện tử hoàn chỉnh, mô phỏng theo các trang web lớn như CellphoneS, FPT Shop.

- **Mục đích:** Xây dựng một sản phẩm thực tế để áp dụng các kiến thức đã học về phát triển web full-stack, quản lý dự án phần mềm và thiết kế hệ thống.
- **Đối tượng sử dụng:**
  - Khách hàng có nhu cầu tìm kiếm và mua sắm laptop.
  - Quản trị viên (Admin, Manager, Staff) vận hành và quản lý website.
- **Bài toán giải quyết:** Cung cấp một nền tảng mua sắm trực tuyến tiện lợi, an toàn và dễ sử dụng, đồng thời cung cấp công cụ quản lý mạnh mẽ cho chủ cửa hàng.
- **Các điểm nổi bật:**
  - Giao diện hiện đại, thân thiện với người dùng.
  - Tương tác thời gian thực với chức năng Chat.
  - Tích hợp thanh toán trực tuyến an toàn qua VNPay.
  - Hệ thống quản trị đầy đủ chức năng, dễ dàng vận hành.

## 🚀 Demo

- **Website:** [https://your-demo-link.com](https://your-demo-link.com)
- **API Documentation:** [https://your-api-doc-link.com](https://your-api-doc-link.com) (Ví dụ: Swagger/Postman)
- **Video Demo:**
  [![Watch the video](https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## 🛠️ Công nghệ sử dụng

| Category | Technology |
| :--- | :--- |
| **Frontend** | `ReactJS` `Vite` `Redux Toolkit` `TailwindCSS` |
| **Backend** | `Node.js` `Express.js` |
| **Database** | `MySQL` |
| **ORM** | `TypeORM` |
| **Authentication** | `JSON Web Token (JWT)` |
| **Realtime** | `Socket.IO` |
| **Payment** | `VNPay` |
| **Storage** | `Cloudinary` |
| **Deployment** | `Vercel (Frontend)` `Render (Backend)` |
| **Tools** | `ESLint` `Prettier` `Git` |

## 🏗️ Kiến trúc hệ thống

Hệ thống được xây dựng theo kiến trúc Client-Server, với Frontend và Backend tách biệt hoàn toàn.

```
+-----------------+      +----------------+      +-----------------+      +----------------+
|    Frontend     |      |    REST API    |      |     Backend     |      |    Database    |
| (ReactJS)       |----->| (HTTP/HTTPS)   |----->| (Node.js)       |----->| (MySQL)        |
+-----------------+      +----------------+      +-----------------+      +----------------+
```

- **Frontend (Client):** Được xây dựng bằng ReactJS, chịu trách nhiệm hiển thị giao diện người dùng và tương tác. Mọi yêu cầu dữ liệu đều được gửi đến Backend thông qua REST API.
- **Backend (Server):** Được xây dựng bằng Node.js và Express, cung cấp các REST API để Frontend có thể truy xuất và xử lý dữ liệu. Backend sẽ tương tác trực tiếp với Database.
- **Database:** Sử dụng MySQL để lưu trữ toàn bộ dữ liệu của hệ thống như người dùng, sản phẩm, đơn hàng, v.v.

## ✨ Chức năng

### Dành cho Khách hàng (Client)

| Chức năng | Mô tả |
| :--- | :--- |
| **Đăng ký/Đăng nhập** | Cho phép người dùng tạo tài khoản mới và đăng nhập vào hệ thống bằng email và mật khẩu. |
| **Quản lý tài khoản** | Người dùng có thể cập nhật thông tin cá nhân, đổi mật khẩu và xem lịch sử đơn hàng. |
| **Xem sản phẩm** | Hiển thị danh sách sản phẩm với phân trang, tìm kiếm, lọc theo nhiều tiêu chí (giá, thương hiệu, thông số) và sắp xếp. |
| **Chi tiết sản phẩm** | Xem thông tin chi tiết, hình ảnh, mô tả, thông số kỹ thuật và các đánh giá của một sản phẩm. |
| **So sánh sản phẩm** | Cho phép chọn nhiều sản phẩm để đặt cạnh nhau và so sánh thông số kỹ thuật. |
| **Giỏ hàng** | Thêm, xóa, cập nhật số lượng sản phẩm trong giỏ hàng. |
| **Thanh toán** | Thực hiện quy trình đặt hàng với 2 phương thức: Thanh toán khi nhận hàng (COD) và thanh toán trực tuyến qua VNPay. |
| **Voucher** | Áp dụng mã giảm giá vào đơn hàng để được hưởng khuyến mãi. |
| **Đánh giá** | Viết đánh giá, bình luận và xếp hạng cho các sản phẩm đã mua. |
| **Sản phẩm yêu thích** | Lưu lại các sản phẩm quan tâm vào một danh sách riêng. |
| **Chat trực tuyến** | Trò chuyện thời gian thực với nhân viên hỗ trợ để được giải đáp thắc mắc. |

### Dành cho Quản trị viên (Admin)

| Chức năng | Mô tả |
| :--- | :--- |
| **Dashboard** | Cung cấp cái nhìn tổng quan về tình hình kinh doanh với các biểu đồ và số liệu thống kê (doanh thu, đơn hàng, người dùng mới). |
| **Quản lý Người dùng** | Xem danh sách, tìm kiếm, khóa/mở khóa tài khoản người dùng. |
| **Quản lý Sản phẩm** | Thêm, sửa, xóa sản phẩm với đầy đủ thông tin, hình ảnh và thuộc tính. |
| **Quản lý Danh mục/Thương hiệu** | Tạo và quản lý các danh mục, thương hiệu cho sản phẩm. |
| **Quản lý Đơn hàng** | Xem danh sách, chi tiết và cập nhật trạng thái các đơn hàng của khách. |
| **Quản lý Voucher** | Tạo và quản lý các mã giảm giá với nhiều điều kiện áp dụng. |
| **Quản lý Đánh giá** | Duyệt, trả lời hoặc xóa các đánh giá của khách hàng. |
| **Quản lý Chat** | Giao diện để nhân viên hỗ trợ có thể trả lời tin nhắn từ khách hàng. |

## 📂 Cấu trúc thư mục

Dự án được tổ chức thành hai thư mục chính là `frontend` và `backend`.

```
.
├── backend/
│   ├── src/
│   │   ├── configs/      # Cấu hình (database, .env)
│   │   ├── controllers/  # Xử lý request và response
│   │   ├── middlewares/  # Các middleware (xác thực, log)
│   │   ├── models/       # Định nghĩa schema/entity cho ORM
│   │   ├── routes/       # Định tuyến các API
│   │   ├── services/     # Xử lý logic nghiệp vụ
│   │   └── utils/        # Các hàm tiện ích
│   ├── .env              # Biến môi trường
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Các hàm gọi API
│   │   ├── assets/       # Hình ảnh, font chữ, css
│   │   ├── components/   # Các component tái sử dụng
│   │   ├── hooks/        # Các custom hook
│   │   ├── pages/        # Các trang chính của ứng dụng
│   │   ├── redux/        # Cấu hình Redux store, slice
│   │   └── routes/       # Định tuyến phía client
│   ├── .env              # Biến môi trường
│   └── package.json
│
└── docs/                   # Tài liệu dự án
```

## 🗄️ Database

Mô hình cơ sở dữ liệu quan hệ bao gồm các bảng chính sau:

| Bảng | Mô tả |
| :--- | :--- |
| **Users** | Lưu trữ thông tin người dùng và vai trò (Customer, Admin, Staff). |
| **Products** | Lưu trữ thông tin chi tiết của các sản phẩm laptop. |
| **Categories** | Lưu trữ các danh mục sản phẩm. |
| **Brands** | Lưu trữ các thương hiệu sản phẩm. |
| **Orders** | Lưu trữ thông tin các đơn hàng do khách hàng đặt. |
| **OrderItems** | Lưu trữ các sản phẩm có trong một đơn hàng. |
| **Reviews** | Lưu trữ các đánh giá và xếp hạng của khách hàng cho sản phẩm. |
| **Vouchers** | Lưu trữ thông tin các mã giảm giá. |
| **Wishlists** | Lưu trữ danh sách sản phẩm yêu thích của người dùng. |
| **ChatMessages** | Lưu trữ lịch sử các tin nhắn chat. |

## 🔗 API Endpoints

Hệ thống cung cấp các REST API được nhóm theo tài nguyên:

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/auth/login` | Đăng nhập |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (có phân trang, lọc, sắp xếp) |
| `GET` | `/api/products/:id` | Lấy chi tiết một sản phẩm |
| `POST` | `/api/orders` | Tạo đơn hàng mới |
| `GET` | `/api/orders/me` | Lấy lịch sử đơn hàng của người dùng đã đăng nhập |
| `POST` | `/api/reviews` | Gửi một đánh giá mới |
| `GET` | `/api/admin/users` | (Admin) Lấy danh sách người dùng |
| `POST` | `/api/admin/products` | (Admin) Tạo sản phẩm mới |
| `PUT` | `/api/admin/orders/:id` | (Admin) Cập nhật trạng thái đơn hàng |

... và nhiều API khác.

## 🔄 Luồng hoạt động

Một luồng xử lý yêu cầu đăng nhập điển hình sẽ diễn ra như sau:

```
User Action      Frontend         Backend (API)          Database
(Login)
   |------------>| Form Submit    |                      |
   |             | (POST /login)  |                      |
   |             |--------------->| Middleware (Validate)|
   |             |                |--------------------->| Controller (login) |
   |             |                |                      |------------------->| Service (checkUser)|
   |             |                |                      |                    |------------------>| Find User
   |             |                |                      |                    |<------------------| User Data
   |             |                |                      |<-------------------| (Compare Password) |
   |             |                |<---------------------| (Generate JWT)     |
   |             |<------------| (Save Token,   |                      |
   |             |  Redirect)     |                      |
   |<-----------------------------| (Response with JWT)  |
```

1.  **Người dùng** nhập email, mật khẩu và nhấn "Đăng nhập".
2.  **Frontend** gửi yêu cầu `POST` đến API `/api/auth/login` kèm theo thông tin đăng nhập.
3.  **Backend** nhận yêu cầu, **Middleware** kiểm tra tính hợp lệ của dữ liệu.
4.  **Controller** gọi **Service** để xử lý logic.
5.  **Service** truy vấn **Database** để tìm người dùng và so sánh mật khẩu.
6.  Nếu hợp lệ, Service tạo một **JSON Web Token (JWT)**.
7.  **Backend** trả về JWT cho Frontend.
8.  **Frontend** lưu JWT (vào Local Storage/Cookie) và chuyển hướng người dùng đến trang chủ.

## ⚙️ Hướng dẫn cài đặt

Để chạy dự án này trên máy local, hãy làm theo các bước sau:

**1. Clone repository:**
```bash
git clone https://github.com/[your-username]/[your-repo-name].git
cd [your-repo-name]
```

**2. Cài đặt Backend:**
```bash
cd backend
npm install
```

**3. Cài đặt Frontend:**
```bash
cd ../frontend
npm install
```

**4. Cấu hình Database:**
- Mở MySQL và tạo một database mới, ví dụ: `laptop_shop_db`.
- Import file database mẫu (nếu có) hoặc để ORM tự tạo bảng.

**5. Tạo file `.env`:**
- Trong thư mục `backend`, tạo file `.env` và sao chép nội dung từ file `.env.example` (hoặc từ phần Biến môi trường bên dưới).
- Tương tự, tạo file `.env` trong thư mục `frontend`.
- Điền các giá trị cần thiết.

**6. Chạy Migration (nếu dùng TypeORM/Prisma):**
```bash
cd backend
npm run migration:run
```

**7. Seed Data (tùy chọn):**
```bash
cd backend
npm run seed
```

**8. Chạy dự án:**
- Chạy Backend:
  ```bash
  cd backend
  npm run dev
  ```
- Chạy Frontend:
  ```bash
  cd frontend
  npm run dev
  ```
- **Backend** sẽ chạy tại `http://localhost:8000` (ví dụ).
- **Frontend** sẽ chạy tại `http://localhost:5173` (ví dụ).

## 🔑 Biến môi trường (.env)

Đây là các biến môi trường cần thiết cho dự án.

**File `.env` trong thư mục `backend`:**
```env
# Server
PORT=8000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=laptop_shop_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**File `.env` trong thư mục `frontend`:**
```env
VITE_API_URL=http://localhost:8000
```

## 🧑‍💻 Tài khoản test

Bạn có thể sử dụng các tài khoản sau để trải nghiệm các vai trò khác nhau:

- **Admin:**
  - **Email:** `admin@example.com`
  - **Password:** `123456`
- **User:**
  - **Email:** `user@example.com`
  - **Password:** `123456`

Hoặc bạn có thể tự đăng ký một tài khoản mới.

## 📸 Screenshots

*(Chèn hình ảnh của bạn vào đây)*

**Trang chủ**
![Homepage](https://via.placeholder.com/800x400.png?text=Homepage+Screenshot)

**Trang chi tiết sản phẩm**
![Product Detail](https://via.placeholder.com/800x400.png?text=Product+Detail+Screenshot)

**Trang giỏ hàng**
![Cart](https://via.placeholder.com/800x400.png?text=Cart+Screenshot)

**Trang Dashboard Admin**
![Dashboard](https://via.placeholder.com/800x400.png?text=Admin+Dashboard+Screenshot)

## 🚀 Hướng phát triển

Trong tương lai, dự án có thể được mở rộng với các tính năng sau:

- [ ] **AI Recommendation:** Gợi ý sản phẩm thông minh dựa trên hành vi người dùng.
- [ ] **Chatbot AI:** Tự động trả lời các câu hỏi thường gặp của khách hàng.
- [ ] **Tối ưu tìm kiếm:** Tích hợp Elasticsearch để cải thiện tốc độ và độ chính xác của chức năng tìm kiếm.
- [ ] **Dockerize:** Đóng gói ứng dụng bằng Docker để dễ dàng triển khai.
- [ ] **CI/CD:** Thiết lập quy trình tích hợp và triển khai liên tục với GitHub Actions.
- [ ] **Mobile App:** Xây dựng ứng dụng di động bằng React Native.
- [ ] **Push Notification:** Gửi thông báo đẩy (push notification) cho người dùng về đơn hàng và khuyến mãi.

## 👥 Thành viên

| Tên | Vai trò | Công việc chính |
| :--- | :--- | :--- |
| **[Tên của bạn]** | Full-stack Developer | Phân tích, thiết kế và phát triển toàn bộ hệ thống. |
| **[Tên thành viên 2]** | (Ví dụ: Frontend Dev) | (Ví dụ: Xây dựng giao diện người dùng) |

## 📄 Giấy phép

Dự án này được cấp phép dưới Giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên hệ

- **Email:** [your-email@example.com]
- **GitHub:** https://github.com/your-username
- **LinkedIn:** https://linkedin.com/in/your-profile

---
_README này được tạo bởi một AI Assistant và được tùy chỉnh cho dự án._
