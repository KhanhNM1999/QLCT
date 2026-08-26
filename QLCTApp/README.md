# QLCTApp

QLCTApp là app iOS SwiftUI để ghi nhận lương từ nội dung được share thủ công, lưu giao dịch bằng Core Data, và tính các khoản cần trả trong tháng.

## Cấu trúc

- `QLCTApp.swift`: entry point của app chính.
- `ContentView.swift`, `PlanView.swift`, `NewPaymentView.swift`: giao diện chính.
- `Parser.swift`: parse nội dung thông báo ngân hàng để tìm số tiền/ngày.
- `Persistence.swift`, `Models.swift`: Core Data model tạo bằng code.
- `ShareExtension/`: Share Extension nhận text từ Share Sheet.
- `project.yml`: cấu hình XcodeGen để tạo `QLCTApp.xcodeproj`.
- `INSTALL_IPHONE.md`: hướng dẫn cài riêng lên iPhone.

## Build trên macOS

Yêu cầu:

- macOS có Xcode.
- XcodeGen (`brew install xcodegen`).

Chạy:

```bash
cd QLCTApp
xcodegen generate
open QLCTApp.xcodeproj
```

Trong Xcode:

1. Chọn target `QLCTApp`, vào Signing & Capabilities, chọn Team.
2. Chọn target `QLCTShare`, chọn cùng Team.
3. Đảm bảo cả hai target dùng cùng App Group: `group.com.khanhnm.qlct`.
4. Nếu đổi bundle id/App Group cho Apple ID của bạn, sửa cùng giá trị trong `SharedConstants.swift`, `QLCTApp.entitlements`, và `ShareExtension/QLCTShare.entitlements`.
5. Cắm iPhone, chọn device, bấm Run.

## Cài riêng lên iPhone

Không cần public App Store.

- Apple ID miễn phí: cài được qua Xcode, nhưng profile hết hạn sau 7 ngày và cần build lại.
- Apple Developer Program: dùng ổn định hơn qua TestFlight riêng tư hoặc Ad Hoc.

Xem chi tiết trong `INSTALL_IPHONE.md`.

## Test

Sau khi generate project trên Mac:

```bash
xcodebuild test -scheme QLCTApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Tên simulator có thể cần đổi theo máy Mac của bạn.

## Local Notifications

App dùng `UNUserNotificationCenter` để nhắc khoản phải trả đến hạn ngay trên iPhone, không cần server.

- Khi tạo khoản có `dueDate`, app đặt reminder vào 09:00 ngày đến hạn.
- Nếu tạo khoản đến hạn trong hôm nay sau 09:00, app đặt reminder sau khoảng 60 giây để vẫn test được.
- Khi khoản được đánh dấu đã trả hoặc bị xóa, reminder liên quan sẽ bị hủy.
- Khi mở app, các reminder cho khoản chưa trả sẽ được đồng bộ lại.
