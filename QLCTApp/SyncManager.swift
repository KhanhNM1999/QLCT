import Foundation
import CoreData

struct SyncManager {
    static let appGroup = SharedConstants.appGroup

    static func syncSharedNotifications(context: NSManagedObjectContext) {
        guard let ud = UserDefaults(suiteName: appGroup) else { return }
        var arr = ud.stringArray(forKey: "shared_notifications") ?? []
        guard !arr.isEmpty else { return }

        for text in arr {
            // attempt parse salary
            if let parsed = Parser.parseSalary(from: text) {
                // dedupe by amount and date (within 1 day)
                let req = NSFetchRequest<Transaction>(entityName: "Transaction")
                req.predicate = NSPredicate(format: "amount == %f AND date >= %@", parsed.amount, Date().addingTimeInterval(-60*60*24))
                if let found = try? context.fetch(req), found.isEmpty {
                    let t = Transaction(context: context)
                    t.id = UUID()
                    t.amount = parsed.amount
                    t.date = parsed.date
                    t.source = "salary"
                }
            } else {
                // fallback: save as raw notification
                let t = Transaction(context: context)
                t.id = UUID()
                t.amount = 0
                t.date = Date()
                t.source = "notification"
                t.source = text.prefix(100).description
            }
        }

        // clear after sync
        ud.removeObject(forKey: "shared_notifications")
        do { try context.save() } catch {}
    }
}
