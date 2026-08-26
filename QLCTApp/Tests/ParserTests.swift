import XCTest
@testable import QLCTApp

final class ParserTests: XCTestCase {
    func testParseTPBankSample() {
        let text = "(TPBank): 19/08/26;15:41 TK: xxxx2668886 PS:+22.165.337VND SD KHA DUNG: 22.198.783VND ND: Payslip FSOFT HO CHUYEN TIEN LUONG THANG 8"
        let parsed = Parser.parseSalary(from: text)
        XCTAssertNotNil(parsed)
        if let p = parsed {
            XCTAssertEqual(Int(p.amount), 22165337)
        }
    }

    func testParseHSBCSample() {
        let text = "Tai khoan/Account: 202****82001; +VND21,313,871; 19/06/2026. So du kha dung/Available Balance: VND21,313,871"
        let parsed = Parser.parseSalary(from: text)
        XCTAssertNotNil(parsed)
        if let p = parsed {
            XCTAssertEqual(Int(p.amount), 21313871)
        }
    }

    func testParseVietnameseSalaryKeyword() {
        let text = "Chuyển tiền lương tháng 8 +18.500.000VND ngày 25/08/2026"
        let parsed = Parser.parseSalary(from: text)
        XCTAssertNotNil(parsed)
        if let p = parsed {
            XCTAssertEqual(Int(p.amount), 18500000)
        }
    }

    func testBankMatcherAvoidsCommonFalsePositives() {
        XCTAssertEqual(BankMatcher.match("(TPBank): PS:+22.165.337VND")?.bank.id, "tpbank")
        XCTAssertEqual(BankMatcher.match("MBBank thong bao bien dong so du")?.bank.id, "mbbank")
        XCTAssertEqual(BankMatcher.match("MBV thong bao bien dong so du")?.bank.id, "mbv")
        XCTAssertEqual(BankMatcher.match("VCBNeo TK nhan tien")?.bank.id, "vcbneo")
        XCTAssertEqual(BankMatcher.match("VCB Digibank thong bao")?.bank.id, "vietcombank")
        XCTAssertEqual(BankMatcher.match("Vietbank thong bao")?.bank.id, "vietbank")
        XCTAssertEqual(BankMatcher.match("VietinBank iPay thong bao")?.bank.id, "vietinbank")
        XCTAssertEqual(BankMatcher.match("GPBank thong bao")?.bank.id, "gpbank")
        XCTAssertEqual(BankMatcher.match("PGBank thong bao")?.bank.id, "pgbank")
    }

    func testBankMatcherRequiredVietnamBankCases() {
        let cases: [(String, String)] = [
            ("TPBank", "tpbank"),
            ("(TPBank):", "tpbank"),
            ("MBBank", "mbbank"),
            ("MB Bank", "mbbank"),
            ("MBV", "mbv"),
            ("VCBNeo", "vcbneo"),
            ("VCB Digibank", "vietcombank"),
            ("CBBank", "vcbneo"),
            ("DongA Bank", "vikki_bank"),
            ("Vikki DAB", "vikki_bank"),
            ("OceanBank", "mbv"),
            ("GPBank", "gpbank"),
            ("PGBank", "pgbank"),
            ("VPBank", "vpbank"),
            ("Vietbank", "vietbank"),
            ("VietinBank", "vietinbank"),
            ("Vietcombank", "vietcombank"),
            ("VietABank", "vietabank"),
            ("LienVietPostBank", "lpbank"),
            ("Maritime Bank", "msb"),
            ("Navibank", "ncb"),
            ("Saigon Thuong Tin", "sacombank"),
            ("Ngân hàng Sài Gòn Tài Lộc", "sacombank")
        ]

        for (input, expectedID) in cases {
            XCTAssertEqual(BankMatcher.match(input)?.bank.id, expectedID, "Failed to match \(input)")
        }
    }
}
