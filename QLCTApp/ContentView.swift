import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebPreviewView(url: URL(string: "https://khanhnm1999.github.io/QLCT/?v=5")!)
            .ignoresSafeArea()
    }
}

private struct WebPreviewView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.websiteDataStore = .default()

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard webView.url == nil else { return }
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(homeURL: url)
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        let homeURL: URL

        init(homeURL: URL) {
            self.homeURL = homeURL
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let host = navigationAction.request.url?.host else {
                decisionHandler(.cancel)
                return
            }

            decisionHandler(host == homeURL.host ? .allow : .cancel)
        }
    }
}

#Preview {
    ContentView()
}
