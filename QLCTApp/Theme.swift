import SwiftUI

enum Theme {
    static let primary = Color(red: 0.06, green: 0.48, blue: 0.73)
    static let accent = Color(red: 0.99, green: 0.76, blue: 0.22)
    static let background = Color(UIColor.systemBackground)
    static func titleFont() -> Font { Font.system(size: 20, weight: .semibold) }
}
