import Foundation
import CoreData

@objc(Transaction)
public class Transaction: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var amount: Double
    @NSManaged public var date: Date
    @NSManaged public var source: String?
}

@objc(Payment)
public class Payment: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var amount: Double
    @NSManaged public var dueDate: Date?
    @NSManaged public var isRecurring: Bool
    @NSManaged public var status: String?
    @NSManaged public var remaining: NSNumber?
}
