import Foundation

struct CalculationManager {
    static func computeMonthlySavings(salary: Double, payments: [Payment]) -> Double {
        // Sum expected payments this month
        let due = payments.reduce(0.0) { acc, p in
            if p.isRecurring { return acc + p.amount }
            if let d = p.dueDate {
                // if due within 30 days
                if Calendar.current.isDate(d, equalTo: Date(), toGranularity: .month) || abs(d.timeIntervalSinceNow) < 60*60*24*30 {
                    return acc + p.amount
                }
            }
            return acc
        }
        return max(0, salary - due)
    }

    static func planSchedule(salary: Double, payments: [Payment]) -> [(Payment, Double)] {
        // Return list of payments and amount to pay this month
        payments.map { p in
            if p.isRecurring { return (p, p.amount) }
            if let d = p.dueDate {
                if Calendar.current.isDate(d, equalTo: Date(), toGranularity: .month) || abs(d.timeIntervalSinceNow) < 60*60*24*30 {
                    return (p, p.amount)
                }
            }
            return (p, 0.0)
        }
    }
}
