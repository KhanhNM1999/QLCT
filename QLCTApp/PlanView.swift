import SwiftUI
import CoreData

struct PlanView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(entity: Payment.entity(), sortDescriptors: []) private var payments: FetchedResults<Payment>

    var body: some View {
        List {
            Section(header: Text("Kế hoạch trả nợ tháng này")) {
                ForEach(CalculationManager.planSchedule(salary: currentSalary(), payments: payments.map { $0 }), id: \.(0.id)) { item in
                    let p = item.0
                    let amt = item.1
                    HStack {
                        VStack(alignment: .leading) {
                            Text(p.name)
                            Text(p.isRecurring ? "Trả góp" : "Thanh toán một lần")
                                .font(.caption).foregroundColor(.secondary)
                        }
                        Spacer()
                        Text("\(Int(amt)) VND")
                    }
                }
            }
        }
        .navigationTitle("Kế hoạch")
    }

    func currentSalary() -> Double {
        // try to fetch latest salary transaction
        let req = NSFetchRequest<Transaction>(entityName: "Transaction")
        req.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]
        req.fetchLimit = 1
        if let arr = try? viewContext.fetch(req), let t = arr.first {
            return t.amount
        }
        return 0
    }
}

struct PlanView_Previews: PreviewProvider {
    static var previews: some View {
        PlanView()
    }
}
