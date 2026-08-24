import SwiftUI
import CoreData

struct NewPaymentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.presentationMode) var presentationMode

    @State private var name: String = ""
    @State private var amount: String = ""
    @State private var isRecurring: Bool = false
    @State private var dueDate: Date = Date()

    var body: some View {
        NavigationView {
            Form {
                TextField("Tên khoản", text: $name)
                TextField("Số tiền", text: $amount)
                    .keyboardType(.numberPad)
                Toggle("Trả góp (định kỳ)", isOn: $isRecurring)
                DatePicker("Ngày đến hạn", selection: $dueDate, displayedComponents: .date)
            }
            .navigationTitle("Tạo khoản trả")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Lưu") { save() }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Hủy") { presentationMode.wrappedValue.dismiss() }
                }
            }
        }
    }

    func save() {
        guard let amt = Double(amount) else { return }
        let p = Payment(context: viewContext)
        p.id = UUID()
        p.name = name.isEmpty ? "Khoản mới" : name
        p.amount = amt
        p.isRecurring = isRecurring
        p.dueDate = dueDate
        p.status = "pending"
        p.remaining = NSNumber(value: amt)
        do { try viewContext.save(); presentationMode.wrappedValue.dismiss() } catch {}
    }
}

struct NewPaymentView_Previews: PreviewProvider {
    static var previews: some View {
        NewPaymentView()
    }
}
