import Foundation
import CoreData

struct SyncManager {
    private static let sharedNotificationsKey = "shared_notifications"

    static func syncSharedNotifications(context: NSManagedObjectContext) {
        guard let userDefaults = UserDefaults(suiteName: SharedConstants.appGroup) else {
            return
        }

        let notifications = userDefaults.stringArray(forKey: sharedNotificationsKey) ?? []
        guard !notifications.isEmpty else { return }

        for text in notifications {
            if let parsed = Parser.parseSalary(from: text) {
                insertSalaryIfNeeded(parsed, context: context)
            } else {
                insertRawNotification(text, context: context)
            }
        }

        do {
            try context.save()
            userDefaults.removeObject(forKey: sharedNotificationsKey)
        } catch {
            context.rollback()
        }
    }

    private static func insertSalaryIfNeeded(_ parsed: ParsedSalary, context: NSManagedObjectContext) {
        let request = NSFetchRequest<Transaction>(entityName: "Transaction")
        let startOfDay = Calendar.current.startOfDay(for: parsed.date)
        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: startOfDay) ?? parsed.date

        request.fetchLimit = 1
        request.predicate = NSPredicate(
            format: "amount == %f AND date >= %@ AND date < %@",
            parsed.amount,
            startOfDay as NSDate,
            endOfDay as NSDate
        )

        if let existing = try? context.fetch(request), !existing.isEmpty {
            return
        }

        let transaction = Transaction(context: context)
        transaction.id = UUID()
        transaction.amount = parsed.amount
        transaction.date = parsed.date
        transaction.source = parsed.bankID.map { "salary:\($0)" } ?? "salary"
    }

    private static func insertRawNotification(_ text: String, context: NSManagedObjectContext) {
        let transaction = Transaction(context: context)
        transaction.id = UUID()
        transaction.amount = 0
        transaction.date = Date()
        transaction.source = String(text.prefix(100))
    }
}
