import Foundation

struct ParsedSalary {
    let amount: Double
    let date: Date
    let raw: String
    let bankID: String?
}

enum Parser {
    private static let currencyPatterns = [
        "PS:\\s*\\+?([0-9]{1,3}(?:[.,][0-9]{3})+)\\s*(?:VND)?",
        "\\+?\\s*(?:VND)\\s*([0-9]{1,3}(?:[.,][0-9]{3})+)",
        "\\+?([0-9]{1,3}(?:[.,][0-9]{3})+)\\s*(?:VND)?",
        "([0-9]{1,3}(?:[.,][0-9]{3})+)"
    ]

    static func parseSalary(from text: String) -> ParsedSalary? {
        let normalized = text
            .folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "vi_VN"))
            .lowercased()

        let salaryKeywords = ["payslip", "luong", "chuyen tien luong", "salary"]
        let hasSalaryKeyword = salaryKeywords.contains { normalized.contains($0) }

        guard let amount = findAmountUsingPatterns(in: text), hasSalaryKeyword || amount > 1_000_000 else {
            return nil
        }

        return ParsedSalary(
            amount: amount,
            date: findDate(in: text) ?? Date(),
            raw: text,
            bankID: BankMatcher.match(text)?.bank.id
        )
    }

    static func findAmountUsingPatterns(in text: String) -> Double? {
        for pattern in currencyPatterns {
            if let value = firstCapture(pattern: pattern, in: text),
               let amount = cleanedNumber(from: value) {
                return amount
            }
        }
        return nil
    }

    static func cleanedNumber(from string: String) -> Double? {
        let cleaned = string
            .replacingOccurrences(of: ".", with: "")
            .replacingOccurrences(of: ",", with: "")
            .replacingOccurrences(of: "+", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        return Double(cleaned)
    }

    static func firstCapture(pattern: String, in text: String) -> String? {
        do {
            let regex = try NSRegularExpression(pattern: pattern, options: [.caseInsensitive])
            let nsText = text as NSString
            let fullRange = NSRange(location: 0, length: nsText.length)

            guard let match = regex.firstMatch(in: text, range: fullRange) else {
                return nil
            }

            for index in stride(from: match.numberOfRanges - 1, through: 1, by: -1) {
                let range = match.range(at: index)
                guard range.location != NSNotFound else { continue }

                let capture = nsText.substring(with: range)
                if capture.rangeOfCharacter(from: .decimalDigits) != nil {
                    return capture
                }
            }
        } catch {
            return nil
        }

        return nil
    }

    static func findDate(in text: String) -> Date? {
        let patterns = [
            "(\\d{2}\\/\\d{2}\\/\\d{2,4};\\d{1,2}:\\d{2})",
            "(\\d{1,2}\\/\\d{1,2}\\/\\d{2,4})",
            "(\\d{1,2}\\-\\d{1,2}\\-\\d{2,4})"
        ]

        for pattern in patterns {
            guard let match = firstCapture(pattern: pattern, in: text) else { continue }

            let dateOnly = match
                .replacingOccurrences(of: "-", with: "/")
                .split(separator: ";")
                .first
                .map(String.init) ?? match

            let parts = dateOnly.split(separator: "/").map(String.init)
            guard parts.count == 3 else { continue }

            let day = parts[0]
            let month = parts[1]
            let year = parts[2].count == 2 ? "20\(parts[2])" : parts[2]

            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "en_US_POSIX")
            formatter.dateFormat = "dd/MM/yyyy"

            if let date = formatter.date(from: "\(day)/\(month)/\(year)") {
                return date
            }
        }

        return nil
    }
}
