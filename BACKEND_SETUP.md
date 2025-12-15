# Backend Setup Guide

## 🔧 Cấu hình Backend URL

Backend URL sẽ thay đổi tùy theo mạng bạn đang sử dụng. Làm theo các bước sau:

### **Bước 1: Tìm IP của máy chạy backend**

#### Windows

```bash
ipconfig
```

Tìm dòng **"IPv4 Address"** trong phần **"Wireless LAN adapter Wi-Fi"** hoặc **"Ethernet adapter"**

Ví dụ: `192.168.1.221`

#### Mac/Linux

```bash
ifconfig
```

Hoặc:

```bash
ip addr show
```

### **Bước 2: Cập nhật file `.env`**

Mở file `.env` ở thư mục root của project và thay đổi:

```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3000
```

Ví dụ:

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.221:3000
```

### **Bước 3: Restart Expo**

Sau khi thay đổi `.env`, **PHẢI restart** Expo dev server:

```bash
# Stop server (Ctrl+C) và chạy lại:
npx expo start --clear
```

---

## 🚀 Chạy Backend

### **Bước 1: Cài đặt dependencies**

```bash
cd backend
npm install
```

### **Bước 2: Cấu hình environment variables**

Backend cũng cần file `.env` riêng:

```bash
cd backend
# Copy từ .env gốc hoặc tạo mới
```

File `backend/.env` cần có:

```env
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=southeastasia
OPENAI_API_KEY=your_key
PORT=3000
```

### **Bước 3: Start backend server**

```bash
cd backend
npm start
```

Server sẽ chạy tại: `http://0.0.0.0:3000` (lắng nghe trên tất cả network interfaces)

---

## 📱 Test Connection

### **Từ mobile app:**

1. Đảm bảo điện thoại và máy tính **cùng mạng WiFi**
2. Mở app và thử tính năng IELTS Speaking Part 1
3. Kiểm tra console log để thấy: `🔗 Backend URL: http://...`

### **Test trực tiếp:**

```bash
# Từ máy tính khác trên cùng mạng:
curl http://192.168.1.221:3000/api/health

# Hoặc mở browser:
http://192.168.1.221:3000/api/health
```

---

## ❗ Troubleshooting

### **Problem: App không kết nối được backend**

**Giải pháp:**

1. ✅ Kiểm tra backend đã chạy chưa (`npm start` trong folder backend)
2. ✅ Kiểm tra IP trong `.env` có đúng không
3. ✅ Kiểm tra điện thoại và máy tính **cùng WiFi**
4. ✅ Tắt firewall/antivirus tạm thời để test
5. ✅ Restart Expo với `--clear` flag

### **Problem: Backend báo lỗi khi upload audio**

**Giải pháp:**

1. ✅ Kiểm tra Azure Speech Key hợp lệ
2. ✅ Kiểm tra OpenAI API Key hợp lệ
3. ✅ Xem log backend để biết lỗi cụ thể

### **Problem: IP thay đổi mỗi khi khởi động lại máy**

**Giải pháp:**

- Cấu hình **Static IP** cho máy tính trong router settings
- Hoặc update file `.env` mỗi khi IP thay đổi

---

## 🌐 Network Modes

### **Development (LAN mode):**

```bash
npx expo start --lan
```

- App và backend phải cùng mạng WiFi
- Sử dụng IP local (192.168.x.x)

### **Tunnel mode (nếu không cùng mạng):**

```bash
npx expo start --tunnel
```

- Backend vẫn phải accessible từ internet
- Có thể dùng ngrok để expose backend

---

## 💡 Tips

1. **Không commit API keys**: File `.env` đã có trong `.gitignore`
2. **Backend URL format**: Luôn là `http://IP:PORT` (không có trailing slash)
3. **Port 3000**: Đảm bảo port 3000 không bị process khác sử dụng
4. **Console logs**: Luôn mở console để debug connection issues
