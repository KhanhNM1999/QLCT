import SwiftUI
import CoreData

struct ImportSalaryView: View {
    private enum Mode: String, CaseIterable, Identifiable {
        case manual
        case bank

        var id: String { rawValue }
        var title: String {
            switch self {
            case .manual: return "Nhập lương"
            case .bank: return "Lựa chọn ngân hàng"
            }
        }
    }

    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss

    @State private var mode: Mode = .manual
    @State private var amount = ""
    @State private var message = ""
    @State private var search = ""
    @State private var selectedBankID: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Picker("Cách nhập", selection: $mode) {
                        ForEach(Mode.allCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    if mode == .manual {
                        FieldBlock(title: "Số tiền lương") {
                            TextField("22.165.337", text: $amount)
                                .keyboardType(.numberPad)
                        }
                    } else {
                        FieldBlock(title: "Nhập nội dung giao dịch") {
                            TextEditor(text: $message)
                                .frame(minHeight: 128)
                        }

                        FieldBlock(title: "Chọn ngân hàng") {
                            TextField("Tìm TPBank, VCB, HSBC...", text: $search)
                            VStack(spacing: 8) {
                                ForEach(filteredBanks) { bank in
                                    Button {
                                        selectedBankID = bank.id
                                    } label: {
                                        HStack(spacing: 10) {
                                            BankLogoView(bank: bank, size: 40)
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(bank.displayName)
                                                    .font(Theme.Fonts.bodyEmphasis)
                                                    .foregroundColor(Theme.ink)
                                                Text(bank.shortName)
                                                    .font(Theme.Fonts.caption)
                                                    .foregroundColor(Theme.muted)
                                            }
                                            Spacer()
                                            if selectedBankID == bank.id {
                                                Image(systemName: "checkmark.circle.fill")
                                                    .foregroundColor(Theme.primary)
                                            }
                                        }
                                        .padding(9)
                                        .background(selectedBankID == bank.id ? Theme.primary.opacity(0.08) : Color.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                                .stroke(selectedBankID == bank.id ? Theme.primary : Theme.line, lineWidth: 1)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(AppSheetBackground())
            .navigationTitle("Nhận diện lương")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Đóng") { dismiss() }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Lưu") { save() }
                        .disabled(!canSave)
                }
            }
        }
    }

    private var filteredBanks: [BankDefinition] {
        let query = BankTextNormalizer.normalize(search)
        guard !query.isEmpty else { return VietnamBankDirectory.banks }
        return VietnamBankDirectory.banks.filter { bank in
            ([bank.displayName, bank.shortName] + bank.aliases + bank.legacyAliases)
                .contains { BankTextNormalizer.normalize($0).contains(query) }
        }
    }

    private var canSave: Bool {
        switch mode {
        case .manual:
            return parsedManualAmount != nil
        case .bank:
            return !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && selectedBankID != nil
        }
    }

    private var parsedManualAmount: Double? {
        let normalized = amount
            .replacingOccurrences(of: ".", with: "")
            .replacingOccurrences(of: ",", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return Double(normalized)
    }

    private func save() {
        let transaction = Transaction(context: viewContext)
        transaction.id = UUID()
        transaction.date = Date()

        switch mode {
        case .manual:
            transaction.amount = parsedManualAmount ?? 0
            transaction.source = "manual"
        case .bank:
            let parsed = Parser.parseSalary(from: message)
            transaction.amount = parsed?.amount ?? Parser.findAmountUsingPatterns(in: message) ?? 0
            transaction.date = parsed?.date ?? Date()
            transaction.source = selectedBankID.map { "salary:\($0)" } ?? "salary"
        }

        do {
            try viewContext.save()
            dismiss()
        } catch {
            viewContext.rollback()
        }
    }
}

private struct FieldBlock<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(Theme.Fonts.bodyEmphasis)
                .foregroundColor(Theme.ink)
            content
                .padding(12)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Theme.line, lineWidth: 1)
                )
        }
    }
}

private struct AppSheetBackground: View {
    var body: some View {
        Color(red: 0.96, green: 0.98, blue: 1.0)
            .ignoresSafeArea()
    }
}
