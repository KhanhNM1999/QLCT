import SwiftUI
import CoreData

struct PlanView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(entity: Payment.entity(), sortDescriptors: []) private var payments: FetchedResults<Payment>

    var body: some View {
        List {
            Section(header: Text("Kế hoạch trả nợ tháng này")) {
                ForEach(planItems, id: \.0.id) { item in
                    let payment = item.0
                    let amount = item.1

                    HStack {
                        VStack(alignment: .leading) {
                            Text(payment.name)
                                .font(Theme.Fonts.bodyEmphasis)

                            Text(payment.isRecurring ? "Trả góp" : "Thanh toán một lần")
                                .font(Theme.Fonts.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Text(CurrencyFormatter.vnd(amount))
                            .font(Theme.Fonts.amountSmall)
                    }
                }
            }
        }
        .navigationTitle("Kế hoạch")
    }

    private var planItems: [(Payment, Double)] {
        CalculationManager
            .planSchedule(salary: currentSalary(), payments: payments.map { $0 })
            .filter { $0.1 > 0 }
    }

    private func currentSalary() -> Double {
        let request = NSFetchRequest<Transaction>(entityName: "Transaction")
        request.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]
        request.fetchLimit = 1

        if let transactions = try? viewContext.fetch(request), let latest = transactions.first {
            return latest.amount
        }

        return 0
    }
}

struct PlanView_Previews: PreviewProvider {
    static var previews: some View {
        PlanView()
            .environment(\.managedObjectContext, PersistenceController(inMemory: true).container.viewContext)
    }
}
