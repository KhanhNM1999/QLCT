import SwiftUI

enum Theme {
    static let primary = Color(red: 0.06, green: 0.48, blue: 0.73)
    static let accent = Color(red: 0.99, green: 0.76, blue: 0.22)
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
