import UIKit
import Social

// Mẫu code cho Share Extension. Sau khi tạo Share Extension target,
// thêm file này vào target extension và set App Group trong entitlements.

class ShareViewController: SLComposeServiceViewController {

    override func isContentValid() -> Bool {
        return true
    }

    override func didSelectPost() {
        // Lấy text được share
        if let item = extensionContext?.inputItems.first as? NSExtensionItem {
            if let attachments = item.attachments {
                for provider in attachments {
                    if provider.hasItemConformingToTypeIdentifier("public.plain-text") {
                        provider.loadItem(forTypeIdentifier: "public.plain-text", options: nil) { (data, error) in
                            if let text = data as? String {
                                self.saveSharedTextToAppGroup(text: text)
                            }
                            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
                        }
                        return
                    }
                }
            }
        }
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    override func configurationItems() -> [Any]! {
        return []
    }

    func saveSharedTextToAppGroup(text: String) {
        let suiteName = SharedConstants.appGroup
        if let ud = UserDefaults(suiteName: suiteName) {
            var arr = ud.stringArray(forKey: "shared_notifications") ?? []
            arr.insert(text, at: 0)
            // keep recent 50
            if arr.count > 50 { arr = Array(arr.prefix(50)) }
            ud.setValue(arr, forKey: "shared_notifications")
            ud.synchronize()
        }
    }
}
