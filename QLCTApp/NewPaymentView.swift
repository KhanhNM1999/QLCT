import SwiftUI
import CoreData

struct NewPaymentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var amount = ""
    @State private var isRecurring = false
    @State private var dueDate = Date()

    var body: some View {
        NavigationStack {
            Form {
                TextField("Tên khoản", text: $name)

                TextField("Số tiền", text: $amount)
                    .keyboardType(.numberPad)

                Toggle("Trả góp định kỳ", isOn: $isRecurring)

                DatePicker("Ngày đến hạn", selection: $dueDate, displayedComponents: .date)
            }
            .navigationTitle("Tạo khoản trả")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Lưu") { save() }
                        .disabled(parsedAmount == nil)
                }

                ToolbarItem(placement: .cancellationAction) {
                    Button("Hủy") { dismiss() }
                }
            }
        }
    }

    private var parsedAmount: Double? {
        let normalized = amount
            .replacingOccurrences(of: ".", with: "")
            .replacingOccurrences(of: ",", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        return Double(normalized)
    }

    private func save() {
        guard let amount = parsedAmount else { return }

        let payment = Payment(context: viewContext)
        payment.id = UUID()
        payment.name = name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Khoản mới" : name
        payment.amount = amount
        payment.isRecurring = isRecurring
        payment.dueDate = dueDate
        payment.status = "pending"
        payment.remaining = NSNumber(value: amount)

        do {
            try viewContext.save()
            PaymentNotificationManager.shared.scheduleDueReminder(for: payment)
            dismiss()
        } catch {
            viewContext.rollback()
        }
    }
}

struct NewPaymentView_Previews: PreviewProvider {
    static var previews: some View {
        NewPaymentView()
            .environment(\.managedObjectContext, PersistenceController(inMemory: true).container.viewContext)
    }
}
