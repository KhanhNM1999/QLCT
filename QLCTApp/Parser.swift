import Foundation

struct ParsedSalary {
    let amount: Double
    let date: Date
    let raw: String
}

enum Parser {
    static let currencyPatternDot = "([+]?)([0-9]{1,3}(?:\\.[0-9]{3})+)\\s*(VND|vnd)?"
    static let currencyPatternComma = "(VND|vnd)?\\s*([+]?)([0-9]{1,3}(?:,[0-9]{3})+)"

    static func parseSalary(from text: String) -> ParsedSalary? {
        let lower = text.lowercased()

        // Heuristics: if text contains payslip/luong/chuyen tien luong keywords, prioritize it
        let salaryKeywords = ["payslip", "luong", "lương", "chuyen tien luong", "chuyển tiền lương", "salary"]
        let hasSalaryKeyword = salaryKeywords.contains { lower.contains($0) }

        if hasSalaryKeyword {
            if let amt = findAmountUsingPatterns(in: text) {
                let date = findDate(in: text) ?? Date()
                return ParsedSalary(amount: amt, date: date, raw: text)
            }
        }

        // If no explicit keyword, still try to find large incoming amounts (heuristic)
        if let amt = findAmountUsingPatterns(in: text), amt > 1_000_000 {
            let date = findDate(in: text) ?? Date()
            return ParsedSalary(amount: amt, date: date, raw: text)
        }

        return nil
    }

    static func findAmountUsingPatterns(in text: String) -> Double? {
        if let v = firstCapture(pattern: currencyPatternDot, in: text) {
            return cleanedNumber(from: v)
        }
        if let v = firstCapture(pattern: currencyPatternComma, in: text) {
            return cleanedNumber(from: v)
        }
        // Bank-specific patterns
        // TPBank style: PS:+22.165.337VND or contains 'PS:' token
        if let v = firstCapture(pattern: "PS:([+0-9.,]+)\\s*(VND|vnd)?", in: text) {
            return cleanedNumber(from: v)
        }
        // HSBC style: +VND21,313,871;
        if let v = firstCapture(pattern: "\\+?VND\s*([0-9,\\.]+)", in: text) {
            return cleanedNumber(from: v)
        }

        // fallback: find any number with separators
        if let v = firstCapture(pattern: "([0-9]{1,3}(?:[.,][0-9]{3})+)", in: text) {
            return cleanedNumber(from: v)
        }
        return nil
    }

    static func cleanedNumber(from s: String) -> Double? {
        let cleaned = s.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: ",", with: "").replacingOccurrences(of: "+", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        return Double(cleaned)
    }

    static func firstCapture(pattern: String, in text: String) -> String? {
        do {
            let regex = try NSRegularExpression(pattern: pattern, options: [])
            let ns = text as NSString
            if let r = regex.firstMatch(in: text, options: [], range: NSRange(location: 0, length: ns.length)) {
                // return last capture group that is non-empty
                for i in stride(from: r.numberOfRanges - 1, through: 1, by: -1) {
                    let range = r.range(at: i)
                    if range.location != NSNotFound {
                        let g = ns.substring(with: range)
                        if !g.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                            return g
                        }
                    }
                }
            }
        } catch {}
        return nil
    }

    static func findDate(in text: String) -> Date? {
        // Try dd/MM/yy or dd/MM/yyyy or dd/MM/yy;HH:mm patterns
        let patterns = ["(\\d{1,2}\\/\\d{1,2}\\/\\d{2,4})", "(\\d{2}\\/\\d{2}\\/\\d{2,4};\\d{1,2}:\\d{2})", "(\\d{1,2}\\-\\d{1,2}\\-\\d{2,4})"]
        for p in patterns {
            if let m = firstCapture(pattern: p, in: text) {
                let cleaned = m.replacingOccurrences(of: ";", with: "/")
                let parts = cleaned.split(separator: "/").map { String($0) }
                if parts.count >= 3 {
                    var day = parts[0]; var month = parts[1]; var year = parts[2]
                    if year.count == 2 { year = "20\(year)" }
                    let fmt = DateFormatter(); fmt.locale = Locale(identifier: "en_US_POSIX"); fmt.dateFormat = "dd/MM/yyyy"
                    if let date = fmt.date(from: "\(day)/\(month)/\(year)") { return date }
                }
            }
        }
        return nil
    }
}
