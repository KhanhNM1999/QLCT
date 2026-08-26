# Cài Lương & Tiết Kiệm lên iPhone từ Windows

Hướng dẫn này dùng GitHub Actions macOS để build file IPA unsigned, sau đó dùng Sideloadly trên Windows để ký bằng Apple ID cá nhân và cài vào iPhone.

Không cần App Store, TestFlight, jailbreak hoặc Mac cá nhân.

## 1. Chuẩn bị

1. Cài Git trên Windows.
2. Tạo một repository GitHub mới.
3. Push toàn bộ source trong thư mục này lên repository đó.
4. Cài Sideloadly từ trang chính thức.
5. Cài iTunes/Apple Devices nếu Windows chưa nhận iPhone qua USB.

## 2. Build IPA trên GitHub

1. Mở repository trên GitHub.
2. Vào tab `Actions`.
3. Chọn workflow `Build iOS unsigned IPA`.
4. Bấm `Run workflow`.
5. Đợi workflow chạy xong.
6. Mở run vừa hoàn thành.
7. Tải artifact `LuongTietKiem-unsigned-ipa`.
8. Giải nén artifact để lấy file `LuongTietKiem-unsigned.ipa`.

Workflow này build bằng macOS runner của GitHub và không cần certificate Apple ở bước build.

## 3. Cài bằng Sideloadly

1. Kết nối iPhone với PC bằng USB.
2. Trên iPhone, bấm `Trust This Computer` nếu được hỏi.
3. Mở Sideloadly trên Windows.
4. Kéo file `LuongTietKiem-unsigned.ipa` vào Sideloadly.
5. Chọn đúng iPhone.
6. Nhập Apple ID để Sideloadly ký app.
7. Bấm Start.
8. Nếu iOS yêu cầu Developer Mode, bật trong Settings rồi khởi động lại iPhone.
9. Nếu iOS yêu cầu trust developer profile, vào:

   `Settings -> General -> VPN & Device Management`

   rồi trust Apple ID/developer profile của bạn.
10. Mở app `QLCTApp` trên iPhone.

## 4. Gia hạn app

Với Apple ID miễn phí, app sideload thường cần ký lại khoảng 7 ngày một lần. Sideloadly có cơ chế refresh nếu PC và iPhone được cấu hình phù hợp.

Nếu sau này muốn app tồn tại lâu hơn và ít phải refresh, Apple Developer Program trả phí là lựa chọn khác, nhưng không bắt buộc cho workflow hiện tại.

## 5. Giới hạn iOS

iOS không cho app này đọc trực tiếp notification của app ngân hàng khác. Import giao dịch hợp lệ sẽ đi qua:

- Paste nội dung notification.
- Nhập thủ công.
- OCR screenshot on-device trong app native.

Không dùng private API, không jailbreak, không đọc lén dữ liệu ngân hàng.
