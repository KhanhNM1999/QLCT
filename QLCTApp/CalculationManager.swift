import Foundation

struct CalculationManager {
    static func computeMonthlySavings(salary: Double, payments: [Payment]) -> Double {
        let due = payments.reduce(0.0) { total, payment in
            total + amountDueThisMonth(for: payment)
        }

        return max(0, salary - due)
    }

    static func planSchedule(salary: Double, payments: [Payment]) -> [(Payment, Double)] {
        payments.map { payment in
            (payment, amountDueThisMonth(for: payment))
        }
    }

    static func amountDueThisMonth(for payment: Payment) -> Double {
        if let remaining = payment.remaining?.doubleValue, remaining <= 0 {
            return 0
        }

        if payment.status == "paid" {
            return 0
        }

        if payment.isRecurring {
            return min(payment.amount, payment.remaining?.doubleValue ?? payment.amount)
        }

        guard let dueDate = payment.dueDate else {
            return 0
        }

        let dueThisMonth = Calendar.current.isDate(dueDate, equalTo: Date(), toGranularity: .month)
        let dueWithin30Days = abs(dueDate.timeIntervalSinceNow) < 60 * 60 * 24 * 30

        return dueThisMonth || dueWithin30Days ? payment.amount : 0
    }
}
