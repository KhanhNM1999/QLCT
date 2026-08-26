import Social
import UIKit
import UniformTypeIdentifiers

final class ShareViewController: SLComposeServiceViewController {
    override func isContentValid() -> Bool {
        true
    }

    override func didSelectPost() {
        guard let item = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = item.attachments else {
            complete()
            return
        }

        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                loadText(from: provider, typeIdentifier: UTType.plainText.identifier)
                return
            }

            if provider.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
                loadText(from: provider, typeIdentifier: UTType.text.identifier)
                return
            }
        }

        complete()
    }

    override func configurationItems() -> [Any]! {
        []
    }

    private func loadText(from provider: NSItemProvider, typeIdentifier: String) {
        provider.loadItem(forTypeIdentifier: typeIdentifier, options: nil) { [weak self] item, _ in
            if let text = item as? String {
                self?.saveSharedTextToAppGroup(text)
            } else if let url = item as? URL, let text = try? String(contentsOf: url) {
                self?.saveSharedTextToAppGroup(text)
            }

            DispatchQueue.main.async {
                self?.complete()
            }
        }
    }

    private func saveSharedTextToAppGroup(_ text: String) {
        guard let userDefaults = UserDefaults(suiteName: SharedConstants.appGroup) else {
            return
        }

        var notifications = userDefaults.stringArray(forKey: "shared_notifications") ?? []
        notifications.insert(text, at: 0)
        userDefaults.set(Array(notifications.prefix(50)), forKey: "shared_notifications")
    }

    private func complete() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
