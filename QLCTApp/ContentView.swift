import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WebPreviewView(url: URL(string: "https://khanhnm1999.github.io/QLCT/?v=17")!)
            .ignoresSafeArea()
    }
}

private struct WebPreviewView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.websiteDataStore = .default()
        configuration.userContentController.addUserScript(Self.disableZoomScript)

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.scrollView.minimumZoomScale = 1
        webView.scrollView.maximumZoomScale = 1
        webView.scrollView.delegate = context.coordinator
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

    private static let disableZoomScript = WKUserScript(
        source: """
        const viewport = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
        document.head.appendChild(viewport);
        document.documentElement.style.touchAction = 'manipulation';
        """,
        injectionTime: .atDocumentEnd,
        forMainFrameOnly: true
    )

    final class Coordinator: NSObject, WKNavigationDelegate, UIScrollViewDelegate {
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

        func viewForZooming(in scrollView: UIScrollView) -> UIView? {
            nil
        }
    }
}

#Preview {
    ContentView()
}
