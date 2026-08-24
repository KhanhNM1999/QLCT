import SwiftUI
import CoreData

struct ContentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(entity: Payment.entity(), sortDescriptors: []) private var payments: FetchedResults<Payment>
    @FetchRequest(entity: Transaction.entity(), sortDescriptors: [NSSortDescriptor(keyPath: \Transaction.date, ascending: false)]) private var transactions: FetchedResults<Transaction>

    @State private var showAddPayment = false

    var body: some View {
        TabView {
            NavigationView {
                VStack(spacing: 12) {
                    header
                    summaryCard
                    paymentsList
                }
                .padding()
                .navigationTitle("QLCT")
                .sheet(isPresented: $showAddPayment) {
                    NewPaymentView().environment(\.managedObjectContext, viewContext)
                }
                .onAppear {
                    SyncManager.syncSharedNotifications(context: viewContext)
                }
            }
            .tabItem { Label("Home", systemImage: "house.fill") }

            NavigationView { PlanView().environment(\.managedObjectContext, viewContext) }
                .tabItem { Label("Kế hoạch", systemImage: "calendar") }
        }
    }

    var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Text("Số lương mới nhất").font(.subheadline).foregroundColor(.secondary)
                Text(latestSalaryText()).font(.title).bold()
                Text("Tiết kiệm dự kiến: \(Int(predictedSavings())) VND")
                    .font(.subheadline).foregroundColor(.green)
            }
            Spacer()
            Button(action: { showAddPayment = true }) {
                Image(systemName: "plus.circle.fill").font(.largeTitle)
            }
        }
    }

    var summaryCard: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Tổng còn lại").font(.caption).foregroundColor(.secondary)
                Text(remainingText()).font(.title2).bold()
            }
            Spacer()
            VStack(alignment: .leading) {
                Text("Khoản cần trả sắp tới").font(.caption).foregroundColor(.secondary)
                Text("\(Int(upcomingDue())) VND").bold()
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }

    var paymentsList: some View {
        List {
            Section(header: Text("Khoản cần trả")) {
                ForEach(payments, id: \.id) { p in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(p.name)
                            Text("\(Int(p.amount)) VND")
                                .font(.caption).foregroundColor(.secondary)
                            if let d = p.dueDate { Text(d, style: .date).font(.caption2) }
                        }
                        Spacer()
                        Button(action: { togglePaid(payment: p) }) {
                            Text(isPaid(p) ? "Đã trả" : "Mark trả")
                                .foregroundColor(isPaid(p) ? .gray : .blue)
                        }
                    }
                }
                .onDelete(perform: deletePayments)
            }
        }
        .listStyle(InsetGroupedListStyle())
    }

    func latestSalaryText() -> String {
        if let t = transactions.first, t.amount > 0 {
            return String(format: "VND %.0f", t.amount)
        }
        return "Chưa có"
    }

    func predictedSavings() -> Double {
        guard let t = transactions.first else { return 0 }
        return CalculationManager.computeMonthlySavings(salary: t.amount, payments: payments.map { $0 })
    }

    func remainingText() -> String {
        guard let t = transactions.first else { return "0 VND" }
        let rem = CalculationManager.computeMonthlySavings(salary: t.amount, payments: payments.map { $0 })
        return "VND \(Int(rem))"
    }

    func upcomingDue() -> Double {
        payments.reduce(0.0) { acc, p in
            if p.isRecurring { return acc + p.amount }
            if let d = p.dueDate {
                if Calendar.current.isDate(d, equalTo: Date(), toGranularity: .month) || abs(d.timeIntervalSinceNow) < 60*60*24*30 {
                    return acc + p.amount
                }
            }
            return acc
        }
    }

    func isPaid(_ p: Payment) -> Bool {
        if let rem = p.remaining?.doubleValue { return rem <= 0 }
        if p.isRecurring { return false }
        return p.status == "paid"
    }

    func togglePaid(payment: Payment) {
        if payment.isRecurring {
            if payment.remaining == nil { payment.remaining = NSNumber(value: payment.amount) }
            let newRem = max(0, payment.remaining!.doubleValue - payment.amount)
            payment.remaining = NSNumber(value: newRem)
        } else {
            payment.status = "paid"
            payment.remaining = NSNumber(value: 0)
        }
        do { try viewContext.save() } catch {}
    }

    func deletePayments(at offsets: IndexSet) {
        offsets.forEach { i in
            let p = payments[i]
            viewContext.delete(p)
        }
        do { try viewContext.save() } catch {}
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
