# 🚀 Deploy LMS Pro - Vercel + Render (Hybrid Setup)

Hướng dẫn chi tiết deploy ứng dụng LMS Pro với chiến lược hybrid:
- **Frontend**: Vercel (miễn phí, không giới hạn, không sleep)
- **Backend + Database**: Render (miễn phí, PostgreSQL included)

---

## 📋 Tổng Quan

### Kiến Trúc Deployment
```
User Browser
    ↓
Vercel (Frontend - React/Vite)
    ↓ API Calls
Render (Backend - Express.js)
    ↓
Render (PostgreSQL Database)
```

### Ưu Điểm
✅ **Frontend luôn sẵn sàng** - Vercel không sleep, load cực nhanh  
✅ **Hoàn toàn miễn phí** - Cả Vercel và Render đều free tier  
✅ **Auto-deploy** - Push code lên GitHub → tự động deploy  
✅ **PostgreSQL miễn phí** - 90 ngày, đủ cho development  

### Lưu Ý
⚠️ **Backend sleep sau 15 phút** không hoạt động (cold start ~30s)  
⚠️ **Database 90 ngày** - Sau đó cần tạo mới hoặc upgrade  

---

## 🎯 Phần 1: Deploy Backend + Database (Render)

### Bước 1: Tạo Tài Khoản Render

1. Truy cập: https://render.com
2. Click **"Get Started"** → Sign up with GitHub
3. Authorize Render truy cập GitHub repositories

### Bước 2: Deploy Backend Service

#### 2.1. Tạo Web Service

1. Từ Render Dashboard, click **"New +"** → **"Blueprint"**
2. Chọn repository: `lmspro2025`
3. Render sẽ tự động phát hiện file `render.yaml`
4. Click **"Apply"**

> [!NOTE]
> Render sẽ tự động tạo:
> - PostgreSQL database (`lmspro-database`)
> - Backend web service (`lmspro-backend`)

#### 2.2. Cấu Hình Environment Variables

Render sẽ tự động set các biến từ `render.yaml`, nhưng bạn cần **update** một số giá trị:

1. Vào **Dashboard** → **lmspro-backend** → **Environment**
2. Update các biến sau:

| Variable | Value | Ghi Chú |
|----------|-------|---------|
| `FRONTEND_URL` | `https://lmspro.vercel.app` | ⚠️ Sẽ update sau khi deploy Vercel |
| `JWT_SECRET` | (auto-generated) | ✅ Render tự tạo |
| `DATABASE_URL` | (auto-linked) | ✅ Tự động link từ database |

3. Click **"Save Changes"**

#### 2.3. Verify Backend Deployment

1. Đợi build hoàn tất (~3-5 phút)
2. Render sẽ cung cấp URL: `https://lmspro-backend.onrender.com`
3. Test health check:
   ```bash
   curl https://lmspro-backend.onrender.com/health
   ```
   
   **Expected response:**
   ```json
   {"status": "OK", "timestamp": "2025-12-23T..."}
   ```

> [!TIP]
> **Lưu lại Backend URL** - Bạn sẽ cần nó cho Vercel deployment!

---

## 🎨 Phần 2: Deploy Frontend (Vercel)

### Bước 1: Tạo Tài Khoản Vercel

1. Truy cập: https://vercel.com
2. Click **"Sign Up"** → Sign up with GitHub
3. Authorize Vercel truy cập GitHub repositories

### Bước 2: Import Project

1. Từ Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Chọn repository: `lmspro2025`
3. Vercel sẽ tự động phát hiện:
   - Framework: **Vite**
   - Root Directory: **`frontend`** ⚠️ **QUAN TRỌNG: Chọn folder `frontend`**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Bước 3: Configure Build Settings

1. **Root Directory**: Chọn `frontend` (không phải root)
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build` (mặc định)
4. **Output Directory**: `dist` (mặc định)
5. **Install Command**: `npm install` (mặc định)

### Bước 4: Set Environment Variables

Click **"Environment Variables"** và thêm:

| Name | Value | Ghi Chú |
|------|-------|---------|
| `VITE_API_URL` | `https://lmspro-backend.onrender.com` | ⚠️ Dùng Backend URL từ Render |

> [!IMPORTANT]
> **Không có dấu `/` ở cuối URL!**  
> ✅ Đúng: `https://lmspro-backend.onrender.com`  
> ❌ Sai: `https://lmspro-backend.onrender.com/`

### Bước 5: Deploy

1. Click **"Deploy"**
2. Đợi build hoàn tất (~2-3 phút)
3. Vercel sẽ cung cấp URL: `https://lmspro.vercel.app`

### Bước 6: Update CORS trên Backend

1. Quay lại **Render Dashboard** → **lmspro-backend** → **Environment**
2. Update biến `FRONTEND_URL`:
   ```
   https://lmspro.vercel.app
   ```
3. Click **"Save Changes"** → Backend sẽ tự động redeploy

---

## ✅ Phần 3: Verification & Testing

### Test 1: Frontend Accessibility

1. Mở browser: `https://lmspro.vercel.app`
2. ✅ Trang login hiển thị
3. ✅ Không có errors trong Console (F12)

### Test 2: Backend Connection

1. Mở Developer Tools (F12) → **Network** tab
2. Thử login với credentials:
   - Username: `admin` (hoặc teacher account)
   - Password: (password của bạn)
3. ✅ Kiểm tra request đến `https://lmspro-backend.onrender.com/api/auth/login`
4. ✅ Response status: `200 OK`

> [!WARNING]
> **Cold Start Delay**  
> Nếu backend đã sleep (15 phút không dùng), request đầu tiên sẽ mất ~30 giây.  
> Đây là hành vi bình thường của Render free tier.

### Test 3: Full User Flow

1. ✅ Login thành công
2. ✅ Dashboard hiển thị
3. ✅ Tạo course mới
4. ✅ Upload image (test file upload)
5. ✅ Tạo quiz/exam
6. ✅ Logout và login lại → data vẫn còn

### Test 4: Database Persistence

1. Tạo một course với tên unique
2. Logout
3. Đợi 1-2 phút
4. Login lại
5. ✅ Course vẫn hiển thị → Database hoạt động tốt

---

## 🔧 Troubleshooting

### ❌ Problem: CORS Error

**Triệu chứng:**
```
Access to fetch at 'https://lmspro-backend.onrender.com/api/...' 
from origin 'https://lmspro.vercel.app' has been blocked by CORS policy
```

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trong Render environment variables
2. Đảm bảo URL **chính xác** (không có `/` cuối)
3. Redeploy backend sau khi update

---

### ❌ Problem: Backend Cold Start Quá Lâu

**Triệu chứng:**
- Request đầu tiên sau 15 phút mất >1 phút

**Giải pháp:**
1. **Tạm thời**: Chấp nhận delay (free tier limitation)
2. **Tối ưu**: Thêm cron job ping backend mỗi 10 phút (cần service khác)
3. **Upgrade**: Render paid plan ($7/tháng) không sleep

---

### ❌ Problem: Environment Variables Không Load

**Triệu chứng:**
- Frontend không kết nối được backend
- Console log: `undefined` cho `VITE_API_URL`

**Giải pháp:**
1. Vercel: Vào **Settings** → **Environment Variables**
2. Đảm bảo `VITE_API_URL` có prefix `VITE_`
3. **Redeploy** sau khi thêm env vars (Vercel không auto-redeploy)

---

### ❌ Problem: Database Connection Error

**Triệu chứng:**
```
Failed to connect to database
```

**Giải pháp:**
1. Render Dashboard → **lmspro-database** → Check status
2. Verify `DATABASE_URL` đã được link đúng
3. Check database logs trong Render dashboard

---

### ❌ Problem: File Upload Không Hoạt Động

**Triệu chứng:**
- Upload image thất bại
- 500 error khi upload

**Giải pháp:**
1. Render free tier **không persistent storage**
2. Files sẽ **mất khi redeploy**
3. **Khuyến nghị**: Dùng Cloudinary hoặc AWS S3 cho production

---

## 📊 Monitoring & Maintenance

### Check Backend Status
- Render Dashboard: https://dashboard.render.com
- View logs: **lmspro-backend** → **Logs** tab
- Monitor usage: **lmspro-backend** → **Metrics**

### Check Frontend Status
- Vercel Dashboard: https://vercel.com/dashboard
- View deployments: **lmspro** → **Deployments**
- Analytics: **lmspro** → **Analytics** (free tier có giới hạn)

### Database Management
- Render Dashboard → **lmspro-database**
- Connection info: **Info** tab
- Connect via psql:
  ```bash
  psql <DATABASE_URL>
  ```

---

## 🎓 Next Steps

### Sau Khi Deploy Thành Công

1. **Custom Domain** (Optional)
   - Vercel: Settings → Domains → Add custom domain
   - Update `FRONTEND_URL` trong Render

2. **Monitoring**
   - Setup UptimeRobot để ping backend mỗi 5 phút (giảm cold start)
   - Monitor error logs trong Render

3. **Backup Database**
   - Export data định kỳ (trước khi hết 90 ngày)
   - Render Dashboard → Database → Export

4. **Performance Optimization**
   - Enable Vercel Analytics
   - Optimize images với Vercel Image Optimization

---

## 📞 Support

### Nếu Gặp Vấn Đề

1. **Check Logs**:
   - Render: Dashboard → Service → Logs
   - Vercel: Dashboard → Deployment → Build Logs
   - Browser: F12 → Console

2. **Common Issues**: Xem phần Troubleshooting ở trên

3. **Documentation**:
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs

---

## 🎉 Hoàn Thành!

Bạn đã deploy thành công LMS Pro với:
- ✅ Frontend trên Vercel (luôn sẵn sàng)
- ✅ Backend trên Render (auto-scale)
- ✅ PostgreSQL database (90 ngày miễn phí)
- ✅ Auto-deploy từ GitHub

**URLs của bạn:**
- Frontend: `https://lmspro.vercel.app`
- Backend API: `https://lmspro-backend.onrender.com`

Enjoy your LMS! 🚀
