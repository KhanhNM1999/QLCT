import SwiftUI
import CoreData

struct ContentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(entity: Payment.entity(), sortDescriptors: []) private var payments: FetchedResults<Payment>
    @FetchRequest(
        entity: Transaction.entity(),
        sortDescriptors: [NSSortDescriptor(keyPath: \Transaction.date, ascending: false)]
    ) private var transactions: FetchedResults<Transaction>

    @State private var showAddPayment = false

    var body: some View {
        TabView {
            NavigationStack {
                VStack(spacing: 12) {
                    header
                    summaryCard
                    paymentsList
                }
                .padding()
                .navigationTitle("QLCT")
                .sheet(isPresented: $showAddPayment) {
                    NewPaymentView()
                        .environment(\.managedObjectContext, viewContext)
                }
                .onAppear {
                    SyncManager.syncSharedNotifications(context: viewContext)
                    PaymentNotificationManager.shared.scheduleAll(for: payments.map { $0 })
                }
            }
            .tabItem { Label("Home", systemImage: "house.fill") }

            NavigationStack {
                PlanView()
                    .environment(\.managedObjectContext, viewContext)
            }
            .tabItem { Label("Kế hoạch", systemImage: "calendar") }
        }
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Text("Số lương mới nhất")
                    .font(Theme.Fonts.caption)
                    .foregroundColor(.secondary)

                Text(latestSalaryText())
                    .font(Theme.Fonts.amount)

                Text("Tiết kiệm dự kiến: \(CurrencyFormatter.vnd(predictedSavings()))")
                    .font(Theme.Fonts.captionEmphasis)
                    .foregroundColor(.green)
            }

            Spacer()

            HStack(spacing: 12) {
                if let bank = latestSalaryBank() {
                    BankLogoView(bank: bank, size: 48)
                }

                Button(action: { showAddPayment = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(Theme.Fonts.iconLarge)
                }
                .accessibilityLabel("Thêm khoản cần trả")
            }
        }
    }

    private var summaryCard: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Tổng còn lại")
                    .font(Theme.Fonts.caption)
                    .foregroundColor(.secondary)

                Text(remainingText())
                    .font(Theme.Fonts.sectionTitle)
            }

            Spacer()

            VStack(alignment: .leading) {
                Text("Khoản cần trả sắp tới")
                    .font(Theme.Fonts.caption)
                    .foregroundColor(.secondary)

                Text(CurrencyFormatter.vnd(upcomingDue()))
                    .font(Theme.Fonts.amountSmall)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }

    private var paymentsList: some View {
        List {
            Section(header: Text("Khoản cần trả")) {
                ForEach(payments, id: \.id) { payment in
                    HStack {
                        if let bank = BankMatcher.match(payment.name)?.bank {
                            BankLogoView(bank: bank, size: 40)
                        }

                        VStack(alignment: .leading) {
                            Text(payment.name)
                                .font(Theme.Fonts.bodyEmphasis)

                            Text(CurrencyFormatter.vnd(payment.amount))
                                .font(Theme.Fonts.caption)
                                .foregroundColor(.secondary)

                            if let dueDate = payment.dueDate {
                                Text(dueDate, style: .date)
                                    .font(Theme.Fonts.caption)
                            }
                        }

                        Spacer()

                        Button(action: { togglePaid(payment: payment) }) {
                            Text(isPaid(payment) ? "Đã trả" : "Mark trả")
                                .foregroundColor(isPaid(payment) ? .gray : .blue)
                        }
                    }
                }
                .onDelete(perform: deletePayments)
            }
        }
        .listStyle(.insetGrouped)
    }

    private func latestSalaryText() -> String {
        guard let transaction = transactions.first, transaction.amount > 0 else {
            return "Chưa có"
        }

        return CurrencyFormatter.vnd(transaction.amount)
    }

    private func latestSalaryBank() -> BankDefinition? {
        guard let source = transactions.first?.source else { return nil }
        if source.hasPrefix("salary:") {
            let bankID = String(source.dropFirst("salary:".count))
            return VietnamBankDirectory.banks.first { $0.id == bankID }
        }
        return BankMatcher.match(source)?.bank
    }

    private func predictedSavings() -> Double {
        guard let transaction = transactions.first else { return 0 }
        return CalculationManager.computeMonthlySavings(salary: transaction.amount, payments: payments.map { $0 })
    }

    private func remainingText() -> String {
        guard let transaction = transactions.first else { return CurrencyFormatter.vnd(0) }
        let remaining = CalculationManager.computeMonthlySavings(salary: transaction.amount, payments: payments.map { $0 })
        return CurrencyFormatter.vnd(remaining)
    }

    private func upcomingDue() -> Double {
        payments.reduce(0.0) { total, payment in
            total + CalculationManager.amountDueThisMonth(for: payment)
        }
    }

    private func isPaid(_ payment: Payment) -> Bool {
        if let remaining = payment.remaining?.doubleValue { return remaining <= 0 }
        if payment.isRecurring { return false }
        return payment.status == "paid"
    }

    private func togglePaid(payment: Payment) {
        if payment.isRecurring {
            let currentRemaining = payment.remaining?.doubleValue ?? payment.amount
            payment.remaining = NSNumber(value: max(0, currentRemaining - payment.amount))
        } else {
            payment.status = "paid"
            payment.remaining = NSNumber(value: 0)
        }

        do {
            try viewContext.save()
            if isPaid(payment) {
                PaymentNotificationManager.shared.cancelReminder(for: payment)
            } else {
                PaymentNotificationManager.shared.scheduleDueReminder(for: payment)
            }
        } catch {
            viewContext.rollback()
        }
    }

    private func deletePayments(at offsets: IndexSet) {
        offsets.forEach { index in
            let payment = payments[index]
            PaymentNotificationManager.shared.cancelReminder(for: payment)
            viewContext.delete(payment)
        }

        do {
            try viewContext.save()
        } catch {
            viewContext.rollback()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environment(\.managedObjectContext, PersistenceController(inMemory: true).container.viewContext)
    }
}
