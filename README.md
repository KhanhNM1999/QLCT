QLCT PC Preview
===============

Đây là bản preview tương tác chạy trên Windows để kiểm tra giao diện và flow theo mockup iPhone. Native iOS source vẫn nằm trong `QLCTApp`.

Chạy preview:

```powershell
cd D:\QLCT\web-preview
node server.js
```

Mở:

```text
http://localhost:5173
```

Preview hỗ trợ:

- 5 tab: Tổng quan, Khoản trả, Checklist, Phân tích, Cài đặt.
- Sample data giống mockup.
- Thêm khoản phải trả.
- Tick/undo checklist.
- Paste notification TPBank/HSBC và nhận diện lương.
- Username login/register with Supabase-backed cloud data per account.

Lưu ý: đây không phải iOS Simulator thật. Windows không chạy được iOS Simulator của Apple. Bản này là PC preview để test UI/flow nhanh trước khi build IPA bằng GitHub Actions macOS.
