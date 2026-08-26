import Foundation
import UserNotifications

final class PaymentNotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = PaymentNotificationManager()

    private let center = UNUserNotificationCenter.current()
    private let calendar = Calendar.current

    private override init() {
        super.init()
    }

    func configure() {
        center.delegate = self
        requestAuthorization()
    }

    func requestAuthorization() {
        center.requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if let error {
                print("Notification authorization error: \(error.localizedDescription)")
            }

            if granted {
                print("Payment notifications authorized")
            }
        }
    }

    func scheduleAll(for payments: [Payment]) {
        payments.forEach { payment in
            if shouldSchedule(payment) {
                scheduleDueReminder(for: payment)
            } else {
                cancelReminder(for: payment)
            }
        }
    }

    func scheduleDueReminder(for payment: Payment) {
        guard shouldSchedule(payment),
              let dueDate = payment.dueDate else {
            cancelReminder(for: payment)
            return
        }

        cancelReminder(for: payment)

        guard let triggerDate = notificationDate(for: dueDate) else {
            return
        }

        let content = UNMutableNotificationContent()
        content.title = "Khoản thanh toán đến hạn"
        content.body = "\(payment.name) \(CurrencyFormatter.vnd(payment.amount)) đến hạn hôm nay."
        content.sound = .default
        content.badge = 1
        content.userInfo = [
            "paymentID": payment.id.uuidString,
            "type": "payment_due"
        ]

        let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: triggerDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        let request = UNNotificationRequest(
            identifier: notificationIdentifier(for: payment),
            content: content,
            trigger: trigger
        )

        center.add(request) { error in
            if let error {
                print("Schedule payment notification error: \(error.localizedDescription)")
            }
        }
    }

    func cancelReminder(for payment: Payment) {
        center.removePendingNotificationRequests(withIdentifiers: [notificationIdentifier(for: payment)])
        center.removeDeliveredNotifications(withIdentifiers: [notificationIdentifier(for: payment)])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .list, .sound]
    }

    private func shouldSchedule(_ payment: Payment) -> Bool {
        guard payment.dueDate != nil else { return false }

        if let remaining = payment.remaining?.doubleValue, remaining <= 0 {
            return false
        }

        if payment.status == "paid" {
            return false
        }

        return true
    }

    private func notificationDate(for dueDate: Date) -> Date? {
        let startOfDueDay = calendar.startOfDay(for: dueDate)
        let today = calendar.startOfDay(for: Date())

        guard startOfDueDay >= today else {
            return nil
        }

        var components = calendar.dateComponents([.year, .month, .day], from: dueDate)
        components.hour = 9
        components.minute = 0

        guard let scheduledDate = calendar.date(from: components) else {
            return nil
        }

        if scheduledDate > Date() {
            return scheduledDate
        }

        if calendar.isDateInToday(dueDate) {
            return Date().addingTimeInterval(60)
        }

        return nil
    }

    private func notificationIdentifier(for payment: Payment) -> String {
        "payment-due-\(payment.id.uuidString)"
    }
}
