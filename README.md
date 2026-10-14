# Sổ Quản Lý Lớp Chủ Nhiệm & AI Headshot Studio

Ứng dụng quản lý lớp học toàn diện dành cho Giáo viên chủ nhiệm (GVCN) và Phụ huynh - Học sinh, tích hợp AI Headshot Studio và đồng bộ Google Drive & Google Sheets.

> **Đơn vị công tác:** Trung tâm GDNN - GDTX Thị xã Long Mỹ, Tỉnh Hậu Giang  
> **GVCN phụ trách:** Thầy Nguyễn Văn Xuyên  
> **Năm học:** 2026 - 2027

---

## 🌟 Các Tính Năng Nổi Bật

1. **Bảng Điều Khiển Tổng Quan (Admin Dashboard):**
   - Theo dõi số lượng học sinh, tỉ lệ chuyên cần tuần, nề nếp thi đua và nhiệm vụ cần xử lý.
   - Thao tác nhanh: Điểm danh, Quản lý học sinh, Chụp ảnh thẻ AI, Xóa mẫu & Nhập thực tế.

2. **Quản Lý Học Sinh & Phụ Huynh:**
   - Danh sách hồ sơ chi tiết theo lớp, phân loại trạng thái, xếp loại học lực & hạnh kiểm.
   - Hỗ trợ nhập danh sách tự động bằng **File Excel (.xlsx / .csv)** chuẩn tiếng Việt.
   - Tải file mẫu Excel chuẩn để điền và nạp chỉ với 1 cú nhấp.
   - Công cụ dán văn bản phân tích thông minh và thêm nhanh thủ công.

3. **Sổ Điểm Danh Điện Tử (Attendance):**
   - Điểm danh trực tiếp theo ngày: Có mặt (PRESENT), Vắng (ABSENT), Đi trễ (LATE), Có phép (EXCUSED).
   - Xuất dữ liệu Sổ Điểm Danh ra file **Excel (.xlsx)** hoặc lưu trực tiếp lên **Google Sheets**.

4. **Sổ Ghi Nhận Thi Đua & Nề Nếp (Emulation & Behaviors):**
   - Bảng quy chuẩn tiêu chí khen thưởng (+) và nhắc nhở vi phạm (-).
   - Tự động tính điểm tổng kết và xếp loại: Xuất sắc, Tốt, Khá, Trung bình, Cần rèn luyện.
   - Xuất Bảng Xếp Loại Thi Đua định dạng **Excel (.xlsx)** và xuất lên **Google Sheets**.

5. **Trung Tâm Google Workspace (Drive & Sheets):**
   - Kết nối trực tiếp tài khoản Google Drive & Google Sheets qua Google OAuth.
   - Quản lý tệp, thư mục, bảng tính, xem trước dòng và nạp học sinh trực tiếp từ Google Sheets.

6. **Studio Ảnh Thẻ AI (AI Headshot Studio):**
   - Tạo ảnh thẻ học sinh và chân dung nghề nghiệp chuẩn mực phông nền xanh/xám, trang phục sơ mi trắng bằng Google Gemini AI.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### Yêu cầu:
- Node.js version 18 trở lên
- npm hoặc yarn/bun

### Cài đặt:
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000`

### Biên dịch ứng dụng (Build):
```bash
npm run build
```
Thư mục `dist` sẽ được tạo chứa toàn bộ mã nguồn tĩnh sẵn sàng xuất bản.

---

## 🌐 Hướng Dẫn Xuất Bản Lên GitHub & GitHub Pages

### Bước 1: Khởi tạo Git và đẩy mã nguồn lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init
git add .
git commit -m "Initial commit: He thong quan ly lop hoc chu nhiem"

# Đổi tên nhánh chính thành main
git branch -M main

# Thêm địa chỉ kho lưu trữ GitHub của bạn
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repository>.git

# Đẩy mã nguồn lên GitHub
git push -u origin main
```

### Bước 2: Kích hoạt GitHub Pages (Tự động)

Dự án đã tích hợp sẵn GitHub Actions tại `.github/workflows/deploy.yml`. Để kích hoạt:

1. Vào trang GitHub Repository của bạn.
2. Bấm vào tab **Settings** (Cài đặt) -> Chọn mục **Pages** ở thanh bên trái.
3. Ở phần **Build and deployment** -> **Source**: Chọn **GitHub Actions**.
4. GitHub sẽ tự động chạy quy trình build và cung cấp đường link trang web của bạn có dạng:
   `https://<tai-khoan>.github.io/<ten-repository>/`

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend / Database:** Firebase Firestore & Firebase Auth, Google Cloud (asia-southeast1)
- **Tích hợp ngoài:** Google Drive API v3, Google Sheets API v4, Google Gemini API
- **Xử lý tệp:** SheetJS (xlsx)
