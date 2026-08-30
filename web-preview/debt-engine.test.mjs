import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"

const source = fs.readFileSync(new URL("./app.js", import.meta.url), "utf8")
const engineSource = source.match(/const DebtEngine = [\s\S]*?\n}\n\nlet state/)?.[0].replace(/\n\nlet state$/, "")
const moneyIntSource = source.match(/function moneyInt\(value\) \{[\s\S]*?\n\}/)?.[0]

if (!engineSource || !moneyIntSource) {
  throw new Error("DebtEngine source not found")
}

const context = {}
vm.runInNewContext(`${moneyIntSource}\n${engineSource}\nthis.DebtEngine = DebtEngine`, context)
const { DebtEngine } = context

function debt(originalPrincipal, monthlyPayment, payments = [], initialPaidAmount = 0) {
  return {
    originalPrincipal,
    monthlyPayment,
    amount: monthlyPayment,
    initialPaidAmount,
    debtPayments: payments.map((amount, index) => ({
      id: `r${index}`,
      principalPaid: amount,
      actualPaidAmount: amount,
      paymentPeriod: `2026-${String(index + 1).padStart(2, "0")}`
    }))
  }
}

{
  const item = debt(24_000_000, 2_000_000, [2_000_000])
  assert.equal(DebtEngine.calculateTotalPaid(item), 2_000_000)
  assert.equal(DebtEngine.calculateRemainingPrincipal(item), 22_000_000)
  assert.equal(DebtEngine.calculateEstimatedRemainingPayments(item), 11)
  assert.equal(DebtEngine.calculateProgress(item).toFixed(4), "8.3333")
}

{
  const item = debt(10_000_000, 3_000_000, [3_000_000, 3_000_000, 3_000_000])
  assert.equal(DebtEngine.calculateRemainingPrincipal(item), 1_000_000)
  assert.equal(DebtEngine.calculateNextPaymentAmount(item), 1_000_000)
  assert.equal(DebtEngine.calculateEstimatedRemainingPayments(item), 1)
}

{
  const item = debt(24_000_000, 2_000_000, [5_000_000])
  assert.equal(DebtEngine.calculateRemainingPrincipal(item), 19_000_000)
  assert.equal(DebtEngine.calculateProgress(item).toFixed(4), "20.8333")
  assert.equal(DebtEngine.calculateEstimatedRemainingPayments(item), 10)
}

{
  const item = debt(3_000_000, 2_000_000, [2_000_000])
  const maxPayment = DebtEngine.calculateNextPaymentAmount(item)
  item.debtPayments.push({ principalPaid: maxPayment, actualPaidAmount: maxPayment, paymentPeriod: "2026-02" })
  assert.equal(maxPayment, 1_000_000)
  assert.equal(DebtEngine.calculateRemainingPrincipal(item), 0)
  assert.equal(DebtEngine.isPaidOff(item), true)
  assert.equal(DebtEngine.calculateProgress(item), 100)
}

{
  const item = debt(12_000_000, 2_000_000, [2_000_000, 2_000_000, 2_000_000])
  item.debtPayments.pop()
  assert.equal(DebtEngine.calculateTotalPaid(item), 4_000_000)
  assert.equal(DebtEngine.calculateRemainingPrincipal(item), 8_000_000)
  assert.equal(DebtEngine.calculateProgress(item).toFixed(4), "33.3333")
}

console.log("DebtEngine tests passed")
