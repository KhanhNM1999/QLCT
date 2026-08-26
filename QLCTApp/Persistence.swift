import Foundation
import CoreData

final class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentContainer

    init(inMemory: Bool = false) {
        let model = Self.makeModel()
        container = NSPersistentContainer(name: "QLCTModel", managedObjectModel: model)

        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }

        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Unresolved error \(error)")
            }
        }
    }

    static func makeModel() -> NSManagedObjectModel {
        let model = NSManagedObjectModel()

        // Transaction entity
        let transaction = NSEntityDescription()
        transaction.name = "Transaction"
        transaction.managedObjectClassName = NSStringFromClass(Transaction.self)

        let t_id = NSAttributeDescription()
        t_id.name = "id"
        t_id.attributeType = .UUIDAttributeType
        t_id.isOptional = false

        let t_amount = NSAttributeDescription()
        t_amount.name = "amount"
        t_amount.attributeType = .doubleAttributeType
        t_amount.isOptional = false

        let t_date = NSAttributeDescription()
        t_date.name = "date"
        t_date.attributeType = .dateAttributeType
        t_date.isOptional = false

        let t_source = NSAttributeDescription()
        t_source.name = "source"
        t_source.attributeType = .stringAttributeType
        t_source.isOptional = true

        transaction.properties = [t_id, t_amount, t_date, t_source]

        // Payment entity
        let payment = NSEntityDescription()
        payment.name = "Payment"
        payment.managedObjectClassName = NSStringFromClass(Payment.self)

        let p_id = NSAttributeDescription()
        p_id.name = "id"
        p_id.attributeType = .UUIDAttributeType
        p_id.isOptional = false

        let p_name = NSAttributeDescription()
        p_name.name = "name"
        p_name.attributeType = .stringAttributeType
        p_name.isOptional = false

        let p_amount = NSAttributeDescription()
        p_amount.name = "amount"
        p_amount.attributeType = .doubleAttributeType
        p_amount.isOptional = false

        let p_dueDate = NSAttributeDescription()
        p_dueDate.name = "dueDate"
        p_dueDate.attributeType = .dateAttributeType
        p_dueDate.isOptional = true

        let p_isRecurring = NSAttributeDescription()
        p_isRecurring.name = "isRecurring"
        p_isRecurring.attributeType = .booleanAttributeType
        p_isRecurring.isOptional = false

        let p_status = NSAttributeDescription()
        p_status.name = "status"
        p_status.attributeType = .stringAttributeType
        p_status.isOptional = true

        let p_remaining = NSAttributeDescription()
        p_remaining.name = "remaining"
        p_remaining.attributeType = .doubleAttributeType
        p_remaining.isOptional = true

        payment.properties = [p_id, p_name, p_amount, p_dueDate, p_isRecurring, p_status, p_remaining]

        model.entities = [transaction, payment]
        return model
    }
}
