import SwiftUI

enum Theme {
    static let primary = Color(red: 0.06, green: 0.48, blue: 0.73)
    static let accent = Color(red: 0.99, green: 0.76, blue: 0.22)
    static let ink = Color(red: 0.03, green: 0.11, blue: 0.20)
    static let muted = Color(red: 0.39, green: 0.45, blue: 0.54)
    static let line = Color(red: 0.87, green: 0.91, blue: 0.95)
    static let blue = Color(red: 0.07, green: 0.42, blue: 0.83)
    static let green = Color(red: 0.09, green: 0.64, blue: 0.29)
    static let orange = Color(red: 0.95, green: 0.52, blue: 0.00)
    static let red = Color(red: 1.00, green: 0.19, blue: 0.31)
    static let purple = Color(red: 0.49, green: 0.24, blue: 0.88)
    static let background = Color(UIColor.systemBackground)
    static func titleFont() -> Font { Font.system(size: 20, weight: .semibold) }

    enum Fonts {
        static let screenTitle = Font.system(.title3, design: .default).weight(.semibold)
        static let sectionTitle = Font.system(.headline, design: .default).weight(.semibold)
        static let body = Font.system(.body, design: .default)
        static let bodyEmphasis = Font.system(.body, design: .default).weight(.medium)
        static let amount = Font.system(.title2, design: .default).weight(.bold)
        static let amountSmall = Font.system(.subheadline, design: .default).weight(.semibold)
        static let caption = Font.system(.caption, design: .default)
        static let captionEmphasis = Font.system(.caption, design: .default).weight(.medium)
        static let iconLarge = Font.system(.title, design: .default).weight(.semibold)
        static let logo = Font.system(.caption2, design: .default).weight(.semibold)
    }
}
