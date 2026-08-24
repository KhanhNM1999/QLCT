QLCTApp
======

Hướng dẫn nhanh để mở và chạy dự án mẫu trên macOS/Xcode:

- Mở Xcode và tạo một iOS app project mới (SwiftUI). Gọi project là `QLCTApp`.
- Thêm các file trong thư mục `QLCTApp` vào target chính.
- Tạo một App Group (ví dụ: `group.com.yourcompany.qlct`) và cấu hình cho app và Share Extension.
- Thêm một Share Extension target (Type: Share Extension) và gán bundle group giống app để chia sẻ dữ liệu.
- Trong Share Extension, thêm file `ShareViewController.swift` từ thư mục `ShareExtension`.

Để cài lên iPhone (không jailbreak):

- Dùng TestFlight (upload build từ Xcode) hoặc cấu hình Ad-hoc provisioning profile để cài trực tiếp.
- Đảm bảo Signing & Capabilities đã bật App Groups và entitlements đúng.

Luồng chức năng mẫu:

- Người dùng chia sẻ nội dung thông báo từ app ngân hàng vào Share Extension.
- Extension đẩy text vào App Group UserDefaults hoặc file để app chính đọc và parse.
- App parse số lương, lưu Transaction, trừ các khoản đã cấu hình và tính ra số tiết kiệm, lịch trả nợ, checklist.

Tiếp theo tôi sẽ implement parser và các view chính trong project.

Chi tiết cài đặt lên iPhone (TestFlight / Ad-hoc):

1. Chuẩn bị:
	- Máy macOS với Xcode (phiên bản tương thích iOS target).
	- Apple Developer account (có thể upload TestFlight hoặc tạo Ad-hoc provisioning).

2. App Group:
	- Vào Xcode > Signing & Capabilities > +Capability > App Groups.
	- Tạo một App Group, ví dụ `group.com.yourcompany.qlct`.
	- Thêm App Group này vào cả target chính và Share Extension.

3. Share Extension:
	- Thêm target mới: File > New > Target > Share Extension.
	- Copy `ShareViewController.swift` vào target extension.
	- Trong extension, đảm bảo `App Groups` capability có cùng group.

4. Cài thử trên thiết bị:
	- Kết nối iPhone vào máy Mac.
	- Chọn device trong Xcode và build/run.
	- Hoặc archive và upload lên App Store Connect để dùng TestFlight.

	Hoàn tất: dự án mẫu đã sẵn sàng để build trong Xcode.

	Gợi ý build nhanh từ Terminal (sử dụng xcodebuild):

	```bash
	# Build và archive
	xcodebuild -scheme QLCTApp -configuration Release -archivePath ./build/QLCTApp.xcarchive archive

	# Export IPA (supply exportOptionsPlist phù hợp với Team/Provisioning)
	xcodebuild -exportArchive -archivePath ./build/QLCTApp.xcarchive -exportPath ./build/QLCTApp -exportOptionsPlist exportOptions.plist
	```

	Sau khi export, bạn có thể upload IPA lên App Store Connect hoặc cài bằng Apple Configurator.

5. Ad-hoc (nếu muốn cài trực tiếp không qua App Store):
	- Tạo Ad-hoc provisioning profile trên Apple Developer, thêm UDID thiết bị.
	- Sign build với profile Ad-hoc và export IPA.
	- Cài IPA lên thiết bị (AltStore, Apple Configurator, hoặc device manager).

6. Quy trình dùng app để thu thông báo:
	- Mở app ngân hàng hoặc Notification center, chọn nội dung thông báo lương, chọn Share > QLCT (extension).
	- Extension sẽ lưu text vào App Group; app chính khi mở sẽ đọc, parse và tạo Transaction tự động.

Lưu ý bảo mật & quyền riêng tư:
 - Ứng dụng không đọc notifications của app khác tự động (iOS hạn chế). Người dùng phải share thủ công nội dung.
 - Không lưu thông tin nhạy cảm ngoài thiết bị trừ khi được người dùng cho phép.

Hoàn thiện và kiểm thử nhanh (local):

1. Mở Xcode và chọn scheme `QLCTApp` (iOS target).
2. Cấu hình Signing: chọn Team, bật App Groups và thêm `group.com.yourcompany.qlct`.
3. Chạy app trên Simulator hoặc thiết bị thật.
4. Để thử Share Extension: trên iPhone, copy nội dung thông báo mẫu vào Notes -> Share -> chọn QLCT extension.
5. Mở app chính, app sẽ đọc shared text và tạo Transaction/ghi vào Core Data.

Ghi chú để hoàn thiện:

---
GitHub Actions + Appetize (build & chạy trên trình duyệt)
----------------------------------------------------
Bạn có thể build và upload IPA tự động lên Appetize bằng workflow có sẵn `.github/workflows/build-and-upload.yml`.

Yêu cầu để workflow ký và export IPA thành công:
- `APPETIZE_API_TOKEN` (GitHub Secret): token Appetize để upload.
- `APPLE_CERT_BASE64` (GitHub Secret, optional): nội dung file `.p12` mã hóa base64.
- `APPLE_CERT_PASSWORD` (GitHub Secret, optional): mật khẩu của file `.p12`.
- `MOBILEPROVISION_BASE64` (GitHub Secret, optional): nội dung file `.mobileprovision` mã hóa base64.
- `TEAM_ID` (GitHub Secret): Apple Team ID.

Tạo base64 trên máy (macOS/Linux) như sau:

```bash
# mã hóa certificate

# mã hóa provisioning profile

```

Copy nội dung các file `.b64` và thêm vào GitHub repository secrets tương ứng.

Sau khi thêm secrets, chạy workflow trong tab Actions. Nếu build và upload thành công, Appetize sẽ trả URL để chạy app trong trình duyệt (mở trên iPhone để test).

Lưu ý: provisioning profile phải khớp với Bundle ID của project và certificate phải tương thích.


