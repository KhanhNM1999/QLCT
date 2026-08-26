import Foundation

enum BankCategory: String, Codable {
    case domesticCommercial
    case transformedBank
    case jointVenture
    case foreignOwned
    case policyBank
    case cooperativeBank
    case custom
}

struct BankDefinition: Identifiable, Codable, Hashable {
    let id: String
    let displayName: String
    let shortName: String
    let legalName: String
    let category: BankCategory
    let aliases: [String]
    let legacyAliases: [String]
    let appHints: [String]
    let supportsGenericParser: Bool
    let isActive: Bool
}

enum BankMatchType: String, Codable {
    case exact
    case alias
    case legacyAlias
    case appHint
    case fuzzy
    case manual
}

struct BankMatchResult {
    let bank: BankDefinition
    let confidence: Double
    let matchedAlias: String
    let matchType: BankMatchType
}

enum BankTextNormalizer {
    static func normalize(_ text: String) -> String {
        text
            .folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "vi_VN"))
            .uppercased()
            .replacingOccurrences(of: #"[-_:/().,;]"#, with: " ", options: .regularExpression)
            .replacingOccurrences(of: #"\s+"#, with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

enum BankMatcher {
    static func match(_ text: String, banks: [BankDefinition] = VietnamBankDirectory.banks) -> BankMatchResult? {
        let normalizedText = BankTextNormalizer.normalize(text)
        var results: [(BankMatchResult, Int)] = []

        for bank in banks where bank.isActive {
            let candidates: [(String, BankMatchType, Double)] =
                [(bank.displayName, .exact, 1.0), (bank.shortName, .exact, 1.0)]
                + bank.aliases.map { ($0, .alias, 0.95) }
                + bank.legacyAliases.map { ($0, .legacyAlias, 0.90) }
                + bank.appHints.map { ($0, .appHint, 0.85) }

            for candidate in candidates {
                let alias = BankTextNormalizer.normalize(candidate.0)
                guard !alias.isEmpty, containsToken(alias, in: normalizedText) else { continue }
                results.append((
                    BankMatchResult(bank: bank, confidence: candidate.2, matchedAlias: candidate.0, matchType: candidate.1),
                    alias.count
                ))
            }
        }

        return results
            .sorted { left, right in
                if left.1 != right.1 { return left.1 > right.1 }
                return left.0.confidence > right.0.confidence
            }
            .first?.0
    }

    private static func containsToken(_ alias: String, in text: String) -> Bool {
        let escaped = NSRegularExpression.escapedPattern(for: alias)
        let pattern = "(^|\\s)\(escaped)(?=\\s|$)"
        return text.range(of: pattern, options: .regularExpression) != nil
    }
}

enum VietnamBankDirectory {
    static let banks: [BankDefinition] = [
        bank("agribank", "Agribank", "Agribank", "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam", .domesticCommercial, ["Agribank", "VBARD", "NHNo", "Ngân hàng Nông nghiệp"], [], ["Agribank Plus"]),
        bank("acb", "ACB", "ACB", "Ngân hàng TMCP Á Châu", .domesticCommercial, ["ACB", "ACB Bank", "Asia Commercial Bank", "Ngân hàng Á Châu"], [], ["ACB ONE"]),
        bank("abbank", "ABBANK", "ABBANK", "Ngân hàng TMCP An Bình", .domesticCommercial, ["ABBANK", "AB Bank", "An Binh Bank"], [], ["ABBANK"]),
        bank("bac_a_bank", "Bac A Bank", "BAB", "Ngân hàng TMCP Bắc Á", .domesticCommercial, ["BAC A BANK", "BacABank", "BACA BANK", "Ngân hàng Bắc Á"], [], ["Bac A Bank"]),
        bank("bvbank", "BVBank", "BVB", "Ngân hàng TMCP Bản Việt", .domesticCommercial, ["BVBANK", "BV Bank", "Ngân hàng Bản Việt"], ["Viet Capital Bank", "VietCapital Bank"], ["digimi", "DigiMi"]),
        bank("baoviet_bank", "BAOVIET Bank", "BAOVIETBANK", "Ngân hàng TMCP Bảo Việt", .domesticCommercial, ["BAOVIET BANK", "Bao Viet Bank", "BAOVIETBANK"], [], ["BAOVIET Bank"]),
        bank("vietinbank", "VietinBank", "VietinBank", "Ngân hàng TMCP Công Thương Việt Nam", .domesticCommercial, ["VIETINBANK", "Vietin Bank", "Ngân hàng Công Thương"], ["Incombank", "ICBV"], ["VietinBank iPay"]),
        bank("pvcombank", "PVcomBank", "PVcomBank", "Ngân hàng TMCP Đại Chúng Việt Nam", .domesticCommercial, ["PVCOMBANK", "PV COM BANK", "PVcom Bank"], ["Western Bank", "PVFC"], ["PVcomBank"]),
        bank("bidv", "BIDV", "BIDV", "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", .domesticCommercial, ["BIDV", "Bank for Investment and Development of Vietnam"], [], ["BIDV SmartBanking"]),
        bank("seabank", "SeABank", "SeABank", "Ngân hàng TMCP Đông Nam Á", .domesticCommercial, ["SEABANK", "SEA BANK", "Ngân hàng Đông Nam Á"], [], ["SeAMobile"]),
        bank("msb", "MSB", "MSB", "Ngân hàng TMCP Hàng Hải Việt Nam", .domesticCommercial, ["MSB", "MSB Bank"], ["Maritime Bank", "MaritimeBank", "Vietnam Maritime Bank"], ["MSB mBank"]),
        bank("kienlongbank", "KienlongBank", "KLB", "Ngân hàng TMCP Kiên Long", .domesticCommercial, ["KIENLONGBANK", "Kien Long Bank", "KLB"], [], ["KienlongBank"]),
        bank("techcombank", "Techcombank", "TCB", "Ngân hàng TMCP Kỹ Thương Việt Nam", .domesticCommercial, ["TECHCOMBANK", "Techcom Bank", "TCB"], [], ["Techcombank Mobile"]),
        bank("lpbank", "LPBank", "LPBank", "Ngân hàng TMCP Lộc Phát Việt Nam", .domesticCommercial, ["LPBANK", "LP BANK"], ["LienVietPostBank", "Lien Viet Post Bank", "LienVietBank", "LVPB"], ["LPBank"]),
        bank("nam_a_bank", "Nam A Bank", "NAB", "Ngân hàng TMCP Nam Á", .domesticCommercial, ["NAM A BANK", "NamABank", "NAB"], [], ["Nam A Bank"]),
        bank("vietcombank", "Vietcombank", "VCB", "Ngân hàng TMCP Ngoại thương Việt Nam", .domesticCommercial, ["VIETCOMBANK", "Vietcom Bank", "VCB", "VCB Digibank"], [], ["Vietcombank Digibank"]),
        bank("hdbank", "HDBank", "HDBank", "Ngân hàng TMCP Phát triển TP.HCM", .domesticCommercial, ["HDBANK", "HD BANK"], ["Housing Development Bank"], ["HDBank"]),
        bank("ocb", "OCB", "OCB", "Ngân hàng TMCP Phương Đông", .domesticCommercial, ["OCB", "OCB Bank", "Orient Commercial Bank"], ["Orient Bank"], ["OCB OMNI"]),
        bank("mbbank", "MB", "MB", "Ngân hàng TMCP Quân Đội", .domesticCommercial, ["MBBANK", "MB Bank", "Military Bank", "Ngân hàng Quân Đội"], [], ["MBBank"]),
        bank("ncb", "NCB", "NCB", "Ngân hàng TMCP Quốc Dân", .domesticCommercial, ["NCB", "NCB Bank", "National Citizen Bank"], ["Navibank", "NaviBank"], ["NCB"]),
        bank("vib", "VIB", "VIB", "Ngân hàng TMCP Quốc tế Việt Nam", .domesticCommercial, ["VIB", "VIB Bank", "Vietnam International Bank"], [], ["MyVIB"]),
        bank("scb_vietnam", "SCB", "SCB", "Ngân hàng TMCP Sài Gòn", .domesticCommercial, ["SCB", "SCB Vietnam", "Saigon Commercial Bank"], [], ["SCB"]),
        bank("shb", "SHB", "SHB", "Ngân hàng TMCP Sài Gòn - Hà Nội", .domesticCommercial, ["SHB", "SHB Bank", "Saigon Hanoi Bank"], [], ["SHB Mobile"]),
        bank("saigonbank", "SAIGONBANK", "SGB", "Ngân hàng TMCP Sài Gòn Công Thương", .domesticCommercial, ["SAIGONBANK", "Saigon Bank", "SGB"], [], ["SAIGONBANK"]),
        bank("sacombank", "Sacombank", "Sacombank", "Ngân hàng TMCP Sài Gòn Tài Lộc", .domesticCommercial, ["SACOMBANK", "Sacom Bank", "Ngân hàng Sài Gòn Tài Lộc"], ["STB", "Saigon Thuong Tin", "Sài Gòn Thương Tín"], ["Sacombank Pay"]),
        bank("pgbank", "PGBank", "PGBank", "Ngân hàng TMCP Thịnh Vượng và Phát triển", .domesticCommercial, ["PGBANK", "PG Bank"], ["Petrolimex Bank"], ["PGBank"]),
        bank("tpbank", "TPBank", "TPBank", "Ngân hàng TMCP Tiên Phong", .domesticCommercial, ["TPBANK", "TP Bank", "Tien Phong Bank", "Tiên Phong"], [], ["TPBank"]),
        bank("vietabank", "VietABank", "VAB", "Ngân hàng TMCP Việt Á", .domesticCommercial, ["VIETABANK", "Viet A Bank", "VAB"], [], ["VietABank"]),
        bank("vpbank", "VPBank", "VPBank", "Ngân hàng TMCP Việt Nam Thịnh Vượng", .domesticCommercial, ["VPBANK", "VP Bank", "VPB"], [], ["VPBank NEO"]),
        bank("vietbank", "Vietbank", "Vietbank", "Ngân hàng TMCP Việt Nam Thương Tín", .domesticCommercial, ["VIETBANK", "Viet Bank"], [], ["Vietbank"]),
        bank("eximbank", "Eximbank", "EIB", "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam", .domesticCommercial, ["EXIMBANK", "Exim Bank", "EIB"], [], ["Eximbank"]),
        bank("gpbank", "GPBank", "GPBank", "Ngân hàng Thương mại TNHH MTV Kỷ Nguyên Thịnh Vượng", .transformedBank, ["GPBANK", "GP Bank"], [], ["GPBank"]),
        bank("vcbneo", "VCBNeo", "VCBNeo", "Ngân hàng Thương mại TNHH MTV Ngoại thương Công nghệ số", .transformedBank, ["VCBNEO", "VCB Neo", "CBBank", "CB Bank"], [], ["VCBNeo"]),
        bank("vikki_bank", "Vikki Bank", "Vikki", "Ngân hàng TNHH MTV Số Vikki", .transformedBank, ["VIKKI BANK", "Vikki", "Vikki DAB"], ["DongA Bank", "Dong A Bank", "DAB"], ["Vikki Bank"]),
        bank("mbv", "MBV", "MBV", "Ngân hàng TNHH MTV Việt Nam Hiện Đại", .transformedBank, ["MBV"], ["OceanBank", "Ocean Bank"], ["MBV"]),
        bank("ivb", "Indovina Bank", "IVB", "Ngân hàng TNHH Indovina", .jointVenture, ["Indovina Bank", "IVB"], [], ["IVB"]),
        bank("vrb", "VRB", "VRB", "Ngân hàng Liên doanh Việt - Nga", .jointVenture, ["VRB", "Vietnam Russia Bank"], [], ["VRB"]),
        bank("anz_vietnam", "ANZ Vietnam", "ANZ", "ANZ Vietnam", .foreignOwned, ["ANZ", "ANZ Vietnam"], [], ["ANZ"]),
        bank("cimb_vietnam", "CIMB Vietnam", "CIMB", "CIMB Bank Vietnam Limited", .foreignOwned, ["CIMB", "CIMB Bank", "CIMB Vietnam"], [], ["CIMB"]),
        bank("hong_leong_vietnam", "Hong Leong Bank Vietnam", "HLB", "Hong Leong Bank Vietnam Limited", .foreignOwned, ["Hong Leong Bank", "Hong Leong Vietnam", "HLB"], [], ["Hong Leong Bank"]),
        bank("hsbc_vietnam", "HSBC Vietnam", "HSBC", "HSBC Bank Vietnam Limited", .foreignOwned, ["HSBC", "HSBC Bank", "HSBC Vietnam"], [], ["HSBC"]),
        bank("public_bank_vietnam", "Public Bank Vietnam", "PBVN", "Public Bank Vietnam Limited", .foreignOwned, ["Public Bank", "Public Bank Vietnam", "PBVN"], ["VID Public Bank"], ["Public Bank"]),
        bank("shinhan_vietnam", "Shinhan Bank Vietnam", "Shinhan", "Shinhan Bank Vietnam Limited", .foreignOwned, ["Shinhan", "Shinhan Bank", "Shinhan Vietnam"], [], ["Shinhan SOL"]),
        bank("standard_chartered_vietnam", "Standard Chartered Vietnam", "Standard Chartered", "Standard Chartered Bank Vietnam Limited", .foreignOwned, ["Standard Chartered", "Standard Chartered Bank"], [], ["Standard Chartered"]),
        bank("uob_vietnam", "UOB Vietnam", "UOB", "United Overseas Bank Vietnam Limited", .foreignOwned, ["UOB", "UOB Bank", "UOB Vietnam"], [], ["UOB TMRW"]),
        bank("woori_vietnam", "Woori Bank Vietnam", "Woori", "Woori Bank Vietnam Limited", .foreignOwned, ["Woori", "Woori Bank", "Woori Vietnam"], [], ["Woori WON"]),
        bank("vbsp", "Ngân hàng Chính sách Xã hội", "VBSP", "Ngân hàng Chính sách Xã hội Việt Nam", .policyBank, ["VBSP", "NHCSXH", "Vietnam Bank for Social Policies"], [], ["VBSP"]),
        bank("vdb", "Ngân hàng Phát triển Việt Nam", "VDB", "Ngân hàng Phát triển Việt Nam", .policyBank, ["VDB", "Vietnam Development Bank"], [], ["VDB"]),
        bank("coopbank", "Co-opBank", "Co-opBank", "Ngân hàng Hợp tác xã Việt Nam", .cooperativeBank, ["COOPBANK", "CO-OPBANK", "Coop Bank", "Cooperative Bank of Vietnam"], [], ["Co-opBank"])
    ]

    private static func bank(
        _ id: String,
        _ displayName: String,
        _ shortName: String,
        _ legalName: String,
        _ category: BankCategory,
        _ aliases: [String],
        _ legacyAliases: [String],
        _ appHints: [String]
    ) -> BankDefinition {
        BankDefinition(
            id: id,
            displayName: displayName,
            shortName: shortName,
            legalName: legalName,
            category: category,
            aliases: aliases,
            legacyAliases: legacyAliases,
            appHints: appHints,
            supportsGenericParser: true,
            isActive: true
        )
    }
}
