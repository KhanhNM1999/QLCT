import SwiftUI
import UIKit

struct BankLogoView: View {
    let bank: BankDefinition?
    var size: CGFloat = 44

    var body: some View {
        Group {
            if let bank, let image = UIImage(named: "BankLogo_\(bank.id)") {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .padding(size * 0.14)
                    .background(Color(uiColor: .systemBackground))
            } else {
                Text(initials)
                    .font(Theme.Fonts.logo)
                    .lineLimit(1)
                    .minimumScaleFactor(0.62)
                    .foregroundColor(.white)
                    .padding(4)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.accentColor)
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: size * 0.32, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: size * 0.32, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.07), radius: 8, x: 0, y: 4)
        .accessibilityLabel(bank?.displayName ?? "Ngân hàng")
    }

    private var initials: String {
        let value = bank?.shortName ?? "BANK"
        return value.count > 4 ? String(value.prefix(4)) : value
    }
}
