import SwiftUI

@main
struct QLCTApp: App {
    let persistence = PersistenceController.shared
    let notifications = PaymentNotificationManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistence.container.viewContext)
                .onAppear {
                    notifications.configure()
                }
        }
    }
}
