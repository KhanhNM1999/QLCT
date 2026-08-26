import SwiftUI
import CoreData

struct ContentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(entity: Payment.entity(), sortDescriptors: []) private var payments: FetchedResults<Payment>
    @FetchRequest(
        entity: Transaction.entity(),
        sortDescriptors: [NSSortDescriptor(keyPath: \Transaction.date, ascending: false)]
    ) private var transactions: FetchedResults<Transaction>

    @State private var activeTab: AppTab = .dashboard
    @State private var showAddPayment = false
    @State private var showImportSalary = false

    var body: some View {
        TabView(selection: $activeTab) {
            DashboardScreen(
                salary: salary,
                payments: displayPayments,
                showImportSalary: { showImportSalary = true },
                showPayments: { activeTab = .payments },
                showAnalytics: { activeTab = .analytics },
                showChecklist: { activeTab = .checklist }
            )
            .tabItem { Label("Tổng quan", systemImage: "house") }
            .tag(AppTab.dashboard)

            PaymentsScreen(payments: displayPayments, showAddPayment: { showAddPayment = true })
                .tabItem { Label("Khoản trả", systemImage: "list.bullet.rectangle") }
                .tag(AppTab.payments)

            ChecklistScreen(payments: displayPayments)
                .tabItem { Label("Checklist", systemImage: "checkmark.square") }
                .tag(AppTab.checklist)

            AnalyticsScreen(salary: salary, payments: displayPayments)
                .tabItem { Label("Phân tích", systemImage: "chart.pie") }
                .tag(AppTab.analytics)

            SettingsScreen(showImportSalary: { showImportSalary = true })
                .tabItem { Label("Cài đặt", systemImage: "gearshape") }
                .tag(AppTab.settings)
        }
        .tint(Theme.primary)
        .sheet(isPresented: $showAddPayment) {
            NewPaymentView()
                .environment(\.managedObjectContext, viewContext)
        }
        .sheet(isPresented: $showImportSalary) {
            ImportSalaryView()
                .environment(\.managedObjectContext, viewContext)
        }
        .onAppear {
            SyncManager.syncSharedNotifications(context: viewContext)
            PaymentNotificationManager.shared.scheduleAll(for: payments.map { $0 })
        }
    }

    private var salary: SalarySnapshot {
        if let transaction = transactions.first, transaction.amount > 0 {
            return SalarySnapshot(
                amount: transaction.amount,
                bank: latestSalaryBank() ?? VietnamBankDirectory.banks.first { $0.id == "tpbank" },
                description: transaction.source == "salary" ? "Lương đã được nhận diện từ thông báo ngân hàng" : transaction.source ?? "Nhập tay",
                confidence: "HIGH"
            )
        }

        return SalarySnapshot.sample
    }

    private var displayPayments: [PaymentSnapshot] {
        if payments.isEmpty { return PaymentSnapshot.samples }
        return payments.map { payment in
            PaymentSnapshot(
                id: payment.id.uuidString,
                name: payment.name,
                amount: payment.amount,
                category: payment.isRecurring ? .laptop : .other,
                recurrence: payment.isRecurring ? "INSTALLMENT" : "ONCE",
                priority: .mustPay,
                dueDate: payment.dueDate ?? Date(),
                status: isPaid(payment) ? .paid : .due,
                installmentText: payment.isRecurring ? "Trả góp" : "Một lần"
            )
        }
    }

    private func latestSalaryBank() -> BankDefinition? {
        guard let source = transactions.first?.source else { return nil }
        if source.hasPrefix("salary:") {
            let bankID = String(source.dropFirst("salary:".count))
            return VietnamBankDirectory.banks.first { $0.id == bankID }
        }
        return BankMatcher.match(source)?.bank
    }

    private func isPaid(_ payment: Payment) -> Bool {
        if let remaining = payment.remaining?.doubleValue { return remaining <= 0 }
        if payment.isRecurring { return false }
        return payment.status == "paid"
    }
}

private enum AppTab {
    case dashboard
    case payments
    case checklist
    case analytics
    case settings
}

private struct SalarySnapshot {
    let amount: Double
    let bank: BankDefinition?
    let description: String
    let confidence: String

    static let sample = SalarySnapshot(
        amount: 22_165_337,
        bank: VietnamBankDirectory.banks.first { $0.id == "tpbank" },
        description: "Payslip FSOFT HO CHUYEN TIEN LUONG THANG 8",
        confidence: "HIGH"
    )
}

private struct PaymentSnapshot: Identifiable {
    enum Category {
        case house
        case laptop
        case card
        case bill
        case wifi
        case other
    }

    enum Priority {
        case mustPay
        case skippable
    }

    enum Status {
        case due
        case paid
        case deferable
    }

    let id: String
    let name: String
    let amount: Double
    let category: Category
    let recurrence: String
    let priority: Priority
    let dueDate: Date
    let status: Status
    let installmentText: String

    var isPaid: Bool { status == .paid }

    static let samples: [PaymentSnapshot] = [
        .sample("home-rent", "Tiền nhà", 4_000_000, .house, "MONTHLY", .mustPay, "2026-08-05", .due, "Tháng 8/2026"),
        .sample("laptop", "Trả góp laptop", 2_450_000, .laptop, "INSTALLMENT", .mustPay, "2026-08-07", .due, "Kỳ 6/12"),
        .sample("friend-loan", "Vay bạn", 1_500_000, .card, "ONCE", .mustPay, "2026-08-10", .paid, "Một lần"),
        .sample("credit-card", "Thẻ tín dụng - VPBank", 1_600_000, .card, "MONTHLY", .mustPay, "2026-08-09", .due, "Tháng 8/2026"),
        .sample("electric", "Điện", 1_150_000, .bill, "MONTHLY", .skippable, "2026-08-12", .deferable, "Tháng 8/2026"),
        .sample("internet", "Internet", 695_000, .wifi, "MONTHLY", .skippable, "2026-08-15", .paid, "Tháng 8/2026")
    ]

    private static func sample(
        _ id: String,
        _ name: String,
        _ amount: Double,
        _ category: Category,
        _ recurrence: String,
        _ priority: Priority,
        _ date: String,
        _ status: Status,
        _ installmentText: String
    ) -> PaymentSnapshot {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return PaymentSnapshot(
            id: id,
            name: name,
            amount: amount,
            category: category,
            recurrence: recurrence,
            priority: priority,
            dueDate: formatter.date(from: date) ?? Date(),
            status: status,
            installmentText: installmentText
        )
    }
}

private struct DashboardScreen: View {
    let salary: SalarySnapshot
    let payments: [PaymentSnapshot]
    let showImportSalary: () -> Void
    let showPayments: () -> Void
    let showAnalytics: () -> Void
    let showChecklist: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ScreenHeader(title: "Lương & Tiết Kiệm", subtitle: "Chào buổi sáng, Minh")
                MetricsHero(salary: salary.amount, payments: payments)
                SalaryCard(salary: salary, showImportSalary: showImportSalary)
                SectionBlock(title: "Việc cần trả sắp đến hạn", actionTitle: "Xem tất cả", action: showPayments) {
                    CardList {
                        ForEach(payments.prefix(4)) { payment in
                            PaymentRow(payment: payment)
                            Divider().padding(.leading, 66)
                        }
                    }
                }
                SectionBlock(title: "Kế hoạch tháng này", actionTitle: "Xem chi tiết", action: showAnalytics) {
                    VStack(spacing: 0) {
                        ProgressRow(icon: "creditcard", title: "Tổng nợ", value: totalDebt, total: 15_000_000, color: Theme.purple)
                        ProgressRow(icon: "checkmark", title: "Đã thanh toán", value: paidAmount, total: totalDue, color: Theme.green)
                        ProgressRow(icon: "piggybank", title: "Mục tiêu tiết kiệm", value: 6_000_000, total: 8_000_000, color: Theme.blue)
                    }
                    .background(CardBackground())
                }
                SectionBlock(title: "Checklist hôm nay", actionTitle: "Xem tất cả", action: showChecklist) {
                    CardList {
                        ForEach(payments.prefix(3)) { payment in
                            ChecklistRow(payment: payment)
                            Divider().padding(.leading, 46)
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 18)
            .padding(.bottom, 28)
        }
        .background(AppBackground())
    }

    private var totalDue: Double { payments.reduce(0) { $0 + $1.amount } }
    private var paidAmount: Double { payments.filter(\.isPaid).reduce(0) { $0 + $1.amount } }
    private var totalDebt: Double { payments.reduce(0) { $0 + ($1.recurrence == "INSTALLMENT" ? 12_250_000 : ($1.isPaid ? 0 : $1.amount)) } }
}

private struct PaymentsScreen: View {
    let payments: [PaymentSnapshot]
    let showAddPayment: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ScreenHeader(title: "Khoản phải trả", subtitle: "")
                FilterChips(items: ["Tất cả", "Đúng hạn", "Có thể skip", "Trả góp"])
                MetricsHero(salary: 22_165_337, payments: payments, columns: 3)
                SectionBlock(title: "\(payments.count) khoản phải trả", actionTitle: "Sắp đến hạn", action: {}) {
                    CardList {
                        ForEach(payments) { payment in
                            PaymentRow(payment: payment)
                            Divider().padding(.leading, 66)
                        }
                    }
                }
                Button(action: showAddPayment) {
                    Image(systemName: "plus")
                        .font(.system(size: 30, weight: .medium))
                        .frame(width: 68, height: 68)
                        .foregroundColor(.white)
                        .background(Theme.primary)
                        .clipShape(Circle())
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
            }
            .padding(16)
            .padding(.bottom, 26)
        }
        .background(AppBackground())
    }
}

private struct ChecklistScreen: View {
    let payments: [PaymentSnapshot]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ScreenHeader(title: "Checklist thanh toán", subtitle: "Quản lý các khoản phải trả đúng hạn, Minh")
                FilterChips(items: ["Hôm nay", "Tuần này", "Tháng này"])
                CardList {
                    ForEach(payments) { payment in
                        ChecklistRow(payment: payment)
                        Divider().padding(.leading, 46)
                    }
                }
                InfoCard(
                    icon: "info.circle",
                    title: "Tự động xử lý tháng sau",
                    text: "Khoản một lần đã hoàn thành sẽ tự ẩn. Khoản trả góp giảm số kỳ và tổng nợ còn lại."
                )
            }
            .padding(16)
            .padding(.bottom, 26)
        }
        .background(AppBackground())
    }
}

private struct AnalyticsScreen: View {
    let salary: SalarySnapshot
    let payments: [PaymentSnapshot]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ScreenHeader(title: "Phân tích & Tiết kiệm", subtitle: "Chào buổi sáng, Minh")
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Có thể tiết kiệm tháng này")
                            .font(Theme.Fonts.body)
                        Text(CurrencyFormatter.vnd(6_000_000))
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(Theme.green)
                        Text("Nếu giữ kỷ luật, bạn có thể tiết kiệm \(CurrencyFormatter.vnd(6_000_000))")
                            .font(Theme.Fonts.caption)
                            .foregroundColor(.secondary)
                            .padding(12)
                            .background(CardBackground())
                    }
                    Spacer()
                    ZStack {
                        Circle()
                            .stroke(Theme.blue.opacity(0.15), lineWidth: 18)
                        Circle()
                            .trim(from: 0, to: 0.271)
                            .stroke(Theme.green, style: StrokeStyle(lineWidth: 18, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                        VStack {
                            Text("27,1%")
                                .font(Theme.Fonts.sectionTitle)
                                .foregroundColor(Theme.green)
                            Text("thu nhập")
                                .font(Theme.Fonts.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(width: 124, height: 124)
                }
                .padding(14)
                .background(HeroBackground())
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                VStack(spacing: 0) {
                    ProgressRow(icon: "wallet.pass", title: "Lương nhận", value: salary.amount, total: salary.amount, color: Theme.green)
                    ProgressRow(icon: "diamond", title: "Khoản phải trả bắt buộc", value: mandatoryDue, total: salary.amount, color: Theme.red)
                    ProgressRow(icon: "pause.circle", title: "Khoản có thể skip", value: skippableDue, total: salary.amount, color: Theme.orange)
                    ProgressRow(icon: "square", title: "Khả dụng sau kế hoạch", value: salary.amount - mandatoryDue - 6_000_000, total: salary.amount, color: Theme.blue)
                }
                .background(CardBackground())
            }
            .padding(16)
            .padding(.bottom, 26)
        }
        .background(AppBackground())
    }

    private var mandatoryDue: Double { payments.filter { $0.priority == .mustPay && !$0.isPaid }.reduce(0) { $0 + $1.amount } }
    private var skippableDue: Double { payments.filter { $0.priority == .skippable && !$0.isPaid }.reduce(0) { $0 + $1.amount } }
}

private struct SettingsScreen: View {
    let showImportSalary: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ScreenHeader(title: "Cài đặt", subtitle: "Bảo mật, dữ liệu và import")
                VStack(spacing: 0) {
                    SettingsRow(icon: "doc.text", title: "Paste thông báo", subtitle: "Nhập text notification ngân hàng", actionTitle: "Mở", action: showImportSalary)
                    Divider().padding(.leading, 56)
                    SettingsRow(icon: "camera.viewfinder", title: "Đọc từ ảnh chụp màn hình", subtitle: "Preview mô phỏng OCR on-device", actionTitle: "Mở", action: showImportSalary)
                    Divider().padding(.leading, 56)
                    SettingsRow(icon: "building.columns", title: "Danh mục ngân hàng", subtitle: "49 ngân hàng Việt Nam + badge local", actionTitle: "Mở", action: {})
                    Divider().padding(.leading, 56)
                    SettingsRow(icon: "chart.bar", title: "Sao lưu dữ liệu", subtitle: "Export JSON local", actionTitle: "Export", action: {})
                }
                .background(CardBackground())
                InfoCard(
                    icon: "info.circle",
                    title: "Public app khả thi",
                    text: "Không cần App Store nếu dùng bản web. Native iOS cài bằng Sideloadly cần Developer Mode."
                )
            }
            .padding(16)
            .padding(.bottom, 26)
        }
        .background(AppBackground())
    }
}

private struct ScreenHeader: View {
    let title: String
    let subtitle: String

    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 7) {
                Text(title)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundColor(Theme.ink)
                if !subtitle.isEmpty {
                    Text(subtitle)
                        .font(Theme.Fonts.body)
                        .foregroundColor(Theme.muted)
                }
            }
            Spacer()
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell")
                    .font(.system(size: 20, weight: .medium))
                    .frame(width: 44, height: 44)
                    .background(Color.white.opacity(0.76))
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Theme.line, lineWidth: 1))
                Text("3")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 18, height: 18)
                    .background(Theme.red)
                    .clipShape(Circle())
                    .offset(x: 3, y: -4)
            }
        }
    }
}

private struct MetricsHero: View {
    let salary: Double
    let payments: [PaymentSnapshot]
    var columns: Int = 4

    var body: some View {
        HStack(spacing: 0) {
            MetricItem(icon: "wallet.pass", title: "Lương tháng này", value: CurrencyFormatter.vnd(salary), sub: "↑ 8,5%")
            Divider().background(Color.white.opacity(0.7))
            MetricItem(icon: "receipt", title: "Phải trả bắt buộc", value: CurrencyFormatter.vnd(8_245_000), sub: "37,2%")
            Divider().background(Color.white.opacity(0.7))
            MetricItem(icon: "piggybank", title: "Có thể tiết kiệm", value: CurrencyFormatter.vnd(6_000_000), sub: "27,1%")
            if columns == 4 {
                Divider().background(Color.white.opacity(0.7))
                MetricItem(icon: "wallet.pass", title: "Còn lại sau thanh toán", value: CurrencyFormatter.vnd(7_920_337), sub: "35,7%")
            }
        }
        .padding(.vertical, 12)
        .background(HeroBackground())
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .shadow(color: Theme.primary.opacity(0.12), radius: 16, x: 0, y: 9)
    }
}

private struct MetricItem: View {
    let icon: String
    let title: String
    let value: String
    let sub: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 19, weight: .medium))
                .frame(width: 42, height: 42)
                .background(Color.white.opacity(0.78))
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            Text(title)
                .font(.system(size: 11))
                .foregroundColor(Theme.ink.opacity(0.76))
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .frame(height: 30)
            Text(value)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(Theme.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.72)
            Text(sub)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(Theme.blue)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 5)
    }
}

private struct SalaryCard: View {
    let salary: SalarySnapshot
    let showImportSalary: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            BankLogoView(bank: salary.bank, size: 52)
            VStack(alignment: .leading, spacing: 8) {
                Text("Đã nhận diện lương")
                    .font(Theme.Fonts.sectionTitle)
                Text("Lương đã được nhận diện từ thông báo ngân hàng")
                    .font(Theme.Fonts.caption)
                    .foregroundColor(Theme.muted)
                Text("\(salary.bank?.displayName ?? "TPBank") · \(CurrencyFormatter.vnd(salary.amount)) · \(salary.description)")
                    .font(Theme.Fonts.body)
                    .foregroundColor(Theme.ink)
                    .padding(10)
                    .background(Color(red: 0.94, green: 0.98, blue: 0.96))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                Button("NHẬP LƯƠNG", action: showImportSalary)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Theme.green)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 9)
                    .background(Theme.green.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
        .padding(14)
        .background(CardBackground())
    }
}

private struct SectionBlock<Content: View>: View {
    let title: String
    let actionTitle: String
    let action: () -> Void
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(Theme.ink)
                Spacer()
                Button(action: action) {
                    Text(actionTitle)
                    Image(systemName: "chevron.right")
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Theme.blue)
            }
            content
        }
    }
}

private struct CardList<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(spacing: 0) {
            content
        }
        .background(CardBackground())
    }
}

private struct PaymentRow: View {
    let payment: PaymentSnapshot

    var body: some View {
        HStack(spacing: 12) {
            CategoryIcon(category: payment.category)
            VStack(alignment: .leading, spacing: 4) {
                Text(payment.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Theme.ink)
                    .lineLimit(1)
                Text(payment.installmentText)
                    .font(Theme.Fonts.caption)
                    .foregroundColor(Theme.muted)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 5) {
                Text(CurrencyFormatter.vnd(payment.amount))
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(Theme.ink)
                Text(payment.dueDate, format: .dateTime.day().month().year())
                    .font(.system(size: 13))
                    .foregroundColor(payment.priority == .skippable ? Theme.orange : Theme.red)
                StatusPill(payment: payment)
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(Theme.muted)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 13)
    }
}

private struct ChecklistRow: View {
    let payment: PaymentSnapshot

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: payment.isPaid ? "checkmark.square.fill" : "square")
                .font(.system(size: 26, weight: .medium))
                .foregroundColor(payment.isPaid ? Theme.green : Theme.muted)
                .frame(width: 32)
            VStack(alignment: .leading, spacing: 4) {
                Text(payment.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(Theme.ink)
                Text(payment.recurrence == "INSTALLMENT" ? "Còn 6/12 kỳ" : "Tự tạo từ khoản phải trả")
                    .font(Theme.Fonts.caption)
                    .foregroundColor(Theme.muted)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(CurrencyFormatter.vnd(payment.amount))
                    .font(.system(size: 16, weight: .bold))
                Text(payment.dueDate, format: .dateTime.day().month().year())
                    .font(.system(size: 13))
                    .foregroundColor(payment.priority == .skippable ? Theme.orange : Theme.red)
            }
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(Theme.muted)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 12)
    }
}

private struct CategoryIcon: View {
    let category: PaymentSnapshot.Category

    var body: some View {
        Image(systemName: icon)
            .font(.system(size: 20, weight: .medium))
            .foregroundColor(color)
            .frame(width: 42, height: 42)
            .background(color.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var icon: String {
        switch category {
        case .house: return "house"
        case .laptop: return "laptopcomputer"
        case .card: return "creditcard"
        case .bill: return "bolt"
        case .wifi: return "wifi"
        case .other: return "doc.text"
        }
    }

    private var color: Color {
        switch category {
        case .house: return Theme.green
        case .laptop: return Theme.blue
        case .card: return Theme.purple
        case .bill, .wifi: return Theme.orange
        case .other: return Theme.muted
        }
    }
}

private struct StatusPill: View {
    let payment: PaymentSnapshot

    var body: some View {
        Text(title)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(color)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .frame(maxWidth: 118)
            .background(color.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private var title: String {
        if payment.isPaid { return "ĐÃ TRẢ" }
        if payment.priority == .skippable { return "CÓ THỂ SKIP" }
        return "PHẢI TRẢ ĐÚNG HẠN"
    }

    private var color: Color {
        if payment.isPaid { return Theme.green }
        if payment.priority == .skippable { return Theme.orange }
        return Theme.red
    }
}

private struct ProgressRow: View {
    let icon: String
    let title: String
    let value: Double
    let total: Double
    let color: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .frame(width: 42, height: 42)
                .background(Color.white.opacity(0.72))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(Theme.Fonts.bodyEmphasis)
                GeometryReader { proxy in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color.black.opacity(0.07))
                        Capsule().fill(color).frame(width: proxy.size.width * progress)
                    }
                }
                .frame(height: 8)
            }
            Text("\(Int(progress * 100))%")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(color)
                .frame(width: 54, alignment: .trailing)
        }
        .padding(12)
    }

    private var progress: CGFloat {
        guard total > 0 else { return 0 }
        return CGFloat(min(1, max(0, value / total)))
    }
}

private struct FilterChips: View {
    let items: [String]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                    Text(item)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(index == 0 ? .white : Theme.muted)
                        .padding(.horizontal, 14)
                        .frame(height: 44)
                        .background(index == 0 ? Theme.primary : Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(index == 0 ? Color.clear : Theme.line, lineWidth: 1)
                        )
                }
            }
        }
    }
}

private struct SettingsRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let actionTitle: String
    let action: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            CategoryIcon(category: .other)
                .overlay(Image(systemName: icon).foregroundColor(Theme.blue))
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(Theme.Fonts.bodyEmphasis)
                Text(subtitle)
                    .font(Theme.Fonts.caption)
                    .foregroundColor(Theme.muted)
            }
            Spacer()
            Button(actionTitle, action: action)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Theme.blue)
        }
        .padding(14)
    }
}

private struct InfoCard: View {
    let icon: String
    let title: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .medium))
                .foregroundColor(Theme.blue)
                .frame(width: 42, height: 42)
                .background(Theme.blue.opacity(0.10))
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(Theme.Fonts.bodyEmphasis)
                Text(text)
                    .font(Theme.Fonts.caption)
                    .foregroundColor(Theme.muted)
            }
        }
        .padding(14)
        .background(CardBackground())
    }
}

private struct CardBackground: View {
    var body: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(Color.white.opacity(0.93))
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Theme.line, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 14, x: 0, y: 5)
    }
}

private struct HeroBackground: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 0.82, green: 0.98, blue: 0.92),
                Color(red: 0.78, green: 0.92, blue: 1.00)
            ],
            startPoint: .leading,
            endPoint: .trailing
        )
    }
}

private struct AppBackground: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 0.97, green: 0.99, blue: 1.0),
                Color(red: 0.91, green: 0.95, blue: 0.98)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environment(\.managedObjectContext, PersistenceController(inMemory: true).container.viewContext)
    }
}
