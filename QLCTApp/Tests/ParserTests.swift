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
}
