# Cai rieng len iPhone

App nay la native SwiftUI iOS app, co Share Extension va App Groups. Cach gon nhat de cai len dung iPhone cua ban la dung Xcode tren macOS.

## Cach khuyen dung: Xcode tren Mac

1. Cai Xcode tu App Store tren may Mac.
2. Cai XcodeGen:

   ```bash
   brew install xcodegen
   ```

3. Copy repo nay sang Mac, mo Terminal tai thu muc `QLCTApp`, roi chay:

   ```bash
   xcodegen generate
   open QLCTApp.xcodeproj
   ```

4. Trong Xcode, chon target `QLCTApp`:
   - Signing & Capabilities > Team: chon Apple ID cua ban.
   - Bundle Identifier: doi `com.khanhnm.qlct` thanh id rieng neu Xcode bao trung, vi du `com.tenban.qlct`.
   - App Groups: dam bao co `group.com.khanhnm.qlct` hoac doi sang group khop voi bundle id cua ban, vi du `group.com.tenban.qlct`.

5. Lam tuong tu voi target `QLCTShare`:
   - Bundle Identifier: vi du `com.tenban.qlct.share`.
   - App Groups: phai giong target chinh.

6. Neu doi App Group trong Xcode, sua them trong code:

   ```swift
   // SharedConstants.swift
   static let appGroup = "group.com.tenban.qlct"
   ```

7. Cam iPhone vao Mac, chon thiet bi trong Xcode, bam Run.

## Neu chi dung Apple ID mien phi

Ban co the Run truc tiep tu Xcode len iPhone, nhung provisioning profile het han sau 7 ngay. Khi het han, app can build/install lai tu Xcode.

## Neu muon dung lau dai

Dung Apple Developer Program, sau do chon mot trong hai cach:

- TestFlight: khong public App Store, moi chinh ban vao test.
- Ad Hoc: dang ky UDID cua iPhone, export file `.ipa`, cai bang Apple Configurator.

Voi app nay, vi co Share Extension va App Groups, cach on dinh nhat la Apple Developer Program + Xcode automatic signing.
