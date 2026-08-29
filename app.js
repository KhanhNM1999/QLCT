const STORAGE_KEY = "luongTietKiem.preview.v5"
const LEGACY_STORAGE_KEYS = [
  "luongTietKiem.preview.v4",
  "luongTietKiem.preview.v3",
  "luongTietKiem.preview.v2",
  "luongTietKiem.preview.v1"
]

const emptyState = {
  activeTab: "dashboard",
  checklistFilter: "month",
  paymentFilter: "all",
  paymentSort: "dueDate",
  selectedMonth: "",
  profile: {
    name: "",
    createdAt: ""
  },
  dataSafety: {
    lastBackupAt: "",
    lastRecoveryKeyAt: "",
    persistentStorage: false,
    persistentAskedAt: ""
  },
  salary: null,
  payments: [],
  imported: [],
  notifications: []
}

const sampleState = {
  activeTab: "dashboard",
  checklistFilter: "month",
  paymentFilter: "all",
  paymentSort: "dueDate",
  selectedMonth: "2026-08",
  profile: {
    name: "Minh",
    createdAt: "2026-08-26"
  },
  salary: {
    amount: 22165337,
    bank: "TPBank",
    date: "2026-08-19",
    time: "15:41",
    description: "Payslip FSOFT HO CHUYEN TIEN LUONG THANG 8",
    confidence: "HIGH"
  },
  payments: [
    {
      id: "home-rent",
      name: "Tiền nhà",
      amount: 4000000,
      category: "house",
      recurrence: "MONTHLY",
      priority: "MUST_PAY",
      dueDate: "2026-08-05",
      status: "DUE",
      paid: false
    },
    {
      id: "laptop",
      name: "Trả góp laptop",
      amount: 2450000,
      category: "laptop",
      recurrence: "INSTALLMENT",
      priority: "MUST_PAY",
      dueDate: "2026-08-07",
      status: "DUE",
      paid: false,
      originalPrincipal: 24500000,
      remainingPrincipal: 12250000,
      installmentCount: 12,
      paidInstallmentCount: 6
    },
    {
      id: "friend-loan",
      name: "Vay bạn",
      amount: 1500000,
      category: "card",
      recurrence: "ONCE",
      priority: "MUST_PAY",
      dueDate: "2026-08-10",
      status: "PAID",
      paid: true
    },
    {
      id: "credit-card",
      name: "Thẻ tín dụng - VPBank",
      amount: 1600000,
      category: "card",
      recurrence: "MONTHLY",
      priority: "MUST_PAY",
      dueDate: "2026-08-09",
      status: "DUE",
      paid: false
    },
    {
      id: "electric",
      name: "Điện",
      amount: 1150000,
      category: "bill",
      recurrence: "MONTHLY",
      priority: "SKIPPABLE",
      dueDate: "2026-08-12",
      status: "DEFERABLE",
      paid: false
    },
    {
      id: "internet",
      name: "Internet",
      amount: 695000,
      category: "wifi",
      recurrence: "MONTHLY",
      priority: "SKIPPABLE",
      dueDate: "2026-08-15",
      status: "PAID",
      paid: true
    }
  ],
  imported: [
    {
      id: "tpbank-salary",
      bank: "TPBank",
      raw: "(TPBank): 19/08/26;15:41 TK: xxxx2668886 PS:+22.165.337VND SD KHA DUNG: 22.198.783VND ND: Payslip FSOFT HO CHUYEN TIEN LUONG THANG 8",
      amount: 22165337,
      date: "19/08/2026",
      time: "15:41",
      type: "CREDIT",
      confidence: "HIGH",
      salary: true
    },
    {
      id: "hsbc-salary",
      bank: "HSBC",
      raw: "Tai khoan/Account: 202****82001; +VND21,313,871; 19/06/2026. So du kha dung/Available Balance: VND21,313,871",
      amount: 21313871,
      date: "19/06/2026",
      time: "09:22",
      type: "CREDIT",
      confidence: "MEDIUM",
      salary: false
    }
  ]
}

let state = loadState()
let touchStartY = 0

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `qlct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function loadState() {
  const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue

    try {
      const normalized = normalizeState(JSON.parse(raw))
      if (key !== STORAGE_KEY) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      return normalized
    } catch {
      continue
    }
  }
  return clone(emptyState)
}

function normalizeState(saved) {
  const base = clone(emptyState)
  const payments = Array.isArray(saved.payments) ? saved.payments.map(normalizePayment) : []
  return {
    ...base,
    ...saved,
    profile: { ...base.profile, ...(saved.profile || {}) },
    dataSafety: { ...base.dataSafety, ...(saved.dataSafety || {}) },
    paymentFilter: saved.paymentFilter || base.paymentFilter,
    paymentSort: saved.paymentSort || base.paymentSort,
    selectedMonth: saved.selectedMonth || currentMonthKey(),
    payments,
    imported: Array.isArray(saved.imported) ? saved.imported : [],
    notifications: Array.isArray(saved.notifications) ? saved.notifications : []
  }
}

function normalizePayment(payment) {
  const recurrence = payment.recurrence || "ONCE"
  const paidMonths = payment.paidMonths && typeof payment.paidMonths === "object" ? payment.paidMonths : {}
  const amount = Number(payment.amount || 0)
  const baseMonth = monthKey(payment.dueDate || payment.createdAt) || currentMonthKey()
  const monthlyStartMonth = recurrence === "MONTHLY" ? (payment.monthlyStartMonth || baseMonth) : ""
  const monthlyEndMonth = recurrence === "MONTHLY" ? (payment.monthlyEndMonth || addMonths(monthlyStartMonth, 11)) : ""
  const installmentCount = recurrence === "INSTALLMENT" ? Math.max(1, Number(payment.installmentCount || 12)) : Number(payment.installmentCount || 0)
  const paidInstallmentCount = recurrence === "INSTALLMENT"
    ? Object.values(paidMonths).filter(Boolean).length || Number(payment.paidInstallmentCount || 0)
    : Number(payment.paidInstallmentCount || 0)
  const originalPrincipal = recurrence === "INSTALLMENT"
    ? Number(payment.originalPrincipal || amount * installmentCount)
    : Number(payment.originalPrincipal || 0)

  return {
    ...payment,
    amount,
    recurrence,
    paidMonths,
    monthlyStartMonth,
    monthlyEndMonth,
    installmentCount,
    paidInstallmentCount,
    originalPrincipal,
    remainingPrincipal: recurrence === "INSTALLMENT"
      ? Math.max(0, originalPrincipal - paidInstallmentCount * amount)
      : Number(payment.remainingPrincipal || 0)
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

async function refreshStorageStatus() {
  if (!navigator.storage?.persisted) return
  try {
    const persisted = await navigator.storage.persisted()
    if (state.dataSafety?.persistentStorage !== persisted) {
      state.dataSafety = { ...emptyState.dataSafety, ...(state.dataSafety || {}), persistentStorage: persisted }
      saveState()
      if (state.activeTab === "settings") render()
    }
  } catch {
  }
}

async function requestStorageProtection() {
  state.dataSafety = {
    ...emptyState.dataSafety,
    ...(state.dataSafety || {}),
    persistentAskedAt: new Date().toISOString()
  }

  if (!navigator.storage?.persist) {
    state.dataSafety.persistentStorage = false
    saveState()
    showToast("Thiết bị này không hỗ trợ lưu bền")
    render()
    return
  }

  try {
    state.dataSafety.persistentStorage = await navigator.storage.persist()
    saveState()
    showToast(state.dataSafety.persistentStorage ? "Đã bật lưu bền trên máy" : "Trình duyệt chưa cấp lưu bền")
  } catch {
    state.dataSafety.persistentStorage = false
    saveState()
    showToast("Không bật được lưu bền")
  }
  render()
}

function installScrollGuard() {
  document.addEventListener("touchstart", event => {
    touchStartY = event.touches[0]?.clientY || 0
  }, { passive: true })

  document.addEventListener("touchmove", event => {
    const scroller = event.target.closest(".screen, .modal, .salary-bank-list, .bank-grid")
    if (!scroller) {
      event.preventDefault()
      return
    }

    const currentY = event.touches[0]?.clientY || 0
    const deltaY = currentY - touchStartY
    const canScroll = scroller.scrollHeight > scroller.clientHeight
    if (!canScroll) {
      event.preventDefault()
      return
    }

    const atTop = scroller.scrollTop <= 0
    const atBottom = Math.ceil(scroller.scrollTop + scroller.clientHeight) >= scroller.scrollHeight
    if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) event.preventDefault()
  }, { passive: false })
}

function money(value) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(value || 0))}đ`
}

function formatNumberInput(value) {
  const digits = String(value || "").replace(/\D/g, "")
  if (!digits) return ""
  return new Intl.NumberFormat("en-US").format(Number(digits))
}

function bindMoneyInput(input) {
  if (!input) return
  input.value = formatNumberInput(input.value)
  input.addEventListener("input", () => {
    input.value = formatNumberInput(input.value)
  })
}

function base64UrlEncode(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlDecode(value) {
  const normalized = String(value || "").trim().replace(/^QLCT-KEY-/i, "").replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

function makeRecoveryCode() {
  const payload = {
    app: "QLCT",
    version: 1,
    exportedAt: new Date().toISOString(),
    state
  }
  return `QLCT-KEY-${base64UrlEncode(JSON.stringify(payload))}`
}

function parseRecoveryCode(code) {
  const payload = JSON.parse(base64UrlDecode(code))
  if (payload?.app !== "QLCT" || !payload.state) throw new Error("Invalid recovery code")
  return normalizeState(payload.state)
}

function pct(value, total = salaryForViewingMonth()?.amount || 0) {
  if (!total) return "0%"
  return `${(value / total * 100).toFixed(1).replace(".", ",")}%`
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function currentMonthKey() {
  return formatMonthKey(new Date())
}

function viewingMonth() {
  return state.selectedMonth || currentMonthKey()
}

function isViewingCurrentMonth() {
  return viewingMonth() === currentMonthKey()
}

function addMonths(key, delta) {
  const [year, month] = String(key || currentMonthKey()).split("-").map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return formatMonthKey(date)
}

function dateForViewingMonth() {
  return isViewingCurrentMonth() ? new Date().toISOString().slice(0, 10) : `${viewingMonth()}-01`
}

function matchesViewingMonth(value) {
  return monthKey(value) === viewingMonth()
}

function paymentsForViewingMonth() {
  return state.payments
    .map(payment => materializePaymentForMonth(payment, viewingMonth()))
    .filter(Boolean)
}

function paymentOccurrenceMonths(payment) {
  const baseDate = eventDate(payment.dueDate || payment.createdAt)
  if (!baseDate) return []

  const startMonth = payment.recurrence === "MONTHLY"
    ? (payment.monthlyStartMonth || monthKey(baseDate))
    : monthKey(baseDate)
  const recurrence = payment.recurrence || "ONCE"
  if (recurrence === "ONCE") return [startMonth]

  const paidMonths = Object.keys(payment.paidMonths || {})
  const endMonthNumber = Math.max(
    monthNumber(currentMonthKey()),
    monthNumber(viewingMonth()),
    ...paidMonths.map(monthNumber)
  )

  if (recurrence === "INSTALLMENT") {
    const count = Math.max(1, Number(payment.installmentCount || 12))
    return Array.from({ length: count }, (_, index) => addMonths(startMonth, index))
  }

  if (recurrence === "MONTHLY") {
    const endMonth = payment.monthlyEndMonth || addMonths(startMonth, 11)
    const cappedEndMonthNumber = Math.min(endMonthNumber, monthNumber(endMonth))
    const count = Math.max(0, cappedEndMonthNumber - monthNumber(startMonth) + 1)
    return Array.from({ length: count }, (_, index) => addMonths(startMonth, index))
  }

  return [startMonth]
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function monthNumber(key) {
  const [year, month] = String(key || currentMonthKey()).split("-").map(Number)
  return year * 12 + month - 1
}

function monthOffset(fromKey, toKey) {
  return monthNumber(toKey) - monthNumber(fromKey)
}

function dueDateInMonth(originalDate, key) {
  const [year, month] = String(key).split("-").map(Number)
  const originalDay = Number(String(originalDate || "").slice(8, 10)) || 1
  const day = Math.min(originalDay, daysInMonth(year, month))
  return `${key}-${String(day).padStart(2, "0")}`
}

function materializePaymentForMonth(payment, key) {
  const baseDate = eventDate(payment.dueDate || payment.createdAt)
  if (!baseDate) return null

  const recurrence = payment.recurrence || "ONCE"
  const startMonth = recurrence === "MONTHLY"
    ? (payment.monthlyStartMonth || monthKey(baseDate))
    : monthKey(baseDate)
  const offset = monthOffset(startMonth, key)
  if (recurrence === "ONCE" && startMonth !== key) return null
  if (recurrence === "MONTHLY") {
    const endMonth = payment.monthlyEndMonth || addMonths(startMonth, 11)
    if (offset < 0 || monthNumber(key) > monthNumber(endMonth)) return null
  }
  if (recurrence === "INSTALLMENT") {
    const count = Math.max(1, Number(payment.installmentCount || 12))
    if (offset < 0 || offset >= count) return null
  }

  const paidMonths = payment.paidMonths || {}
  const paid = recurrence === "ONCE"
    ? Boolean(payment.paid || payment.status === "PAID")
    : Boolean(paidMonths[key])
  const paidInstallmentCount = recurrence === "INSTALLMENT"
    ? Object.keys(paidMonths).filter(month => paidMonths[month] && monthOffset(startMonth, month) >= 0 && monthOffset(startMonth, month) < Number(payment.installmentCount || 12)).length
    : Number(payment.paidInstallmentCount || 0)
  const originalPrincipal = Number(payment.originalPrincipal || Number(payment.amount || 0) * Number(payment.installmentCount || 12))

  return {
    ...payment,
    baseId: payment.id,
    occurrenceKey: key,
    dueDate: recurrence === "ONCE" ? baseDate : dueDateInMonth(baseDate, key),
    paid,
    status: paid ? "PAID" : (payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"),
    paidInstallmentCount,
    remainingPrincipal: recurrence === "INSTALLMENT"
      ? Math.max(0, originalPrincipal - paidInstallmentCount * Number(payment.amount || 0))
      : Number(payment.remainingPrincipal || 0)
  }
}

function salaryForViewingMonth() {
  const salaries = state.imported.filter(item => item.salary && matchesViewingMonth(item.isoDate || item.date || item.savedAt))
  if (salaries.length) {
    const latest = [...salaries].sort((a, b) => eventDate(b.isoDate || b.date || b.savedAt).localeCompare(eventDate(a.isoDate || a.date || a.savedAt)))[0]
    return {
      amount: salaries.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      bank: latest.bank || "Lương",
      date: latest.isoDate || eventDate(latest.date) || latest.savedAt || "",
      time: latest.time || "",
      description: latest.description || "Lương đã lưu",
      confidence: latest.confidence || "MANUAL"
    }
  }

  if (state.salary && matchesViewingMonth(state.salary.date || state.salary.savedAt)) return state.salary
  return null
}

function latestSalaryEntryForViewingMonth() {
  const salaries = state.imported
    .filter(item => item.salary && matchesViewingMonth(item.isoDate || item.date || item.savedAt))
    .sort((a, b) => eventDate(b.isoDate || b.date || b.savedAt).localeCompare(eventDate(a.isoDate || a.date || a.savedAt)))
  if (salaries.length) return salaries[0]
  if (state.salary && matchesViewingMonth(state.salary.date || state.salary.savedAt)) return state.salary
  return null
}

function upsertSalaryForMonth(salary, importedRecord) {
  const key = monthKey(salary.date || salary.savedAt)
  state.imported = state.imported.filter(item => {
    if (!item.salary) return true
    return monthKey(item.isoDate || item.date || item.savedAt) !== key
  })
  state.salary = salary
  state.imported.unshift(importedRecord)
  state.selectedMonth = key
}

function dueDateValue(payment) {
  const value = eventDate(payment.dueDate || payment.createdAt)
  return value || "9999-12-31"
}

function alertablePaymentsForViewingMonth() {
  const today = new Date().toISOString().slice(0, 10)
  return sortPayments(paymentsForViewingMonth().filter(payment => {
    if (payment.paid || payment.status === "PAID") return false
    return dueDateValue(payment) <= today
  }))
}

function notificationBelongsToViewingMonth(item) {
  const date = eventDate(item.date || item.createdAt || item.savedAt)
  if (!date) return isViewingCurrentMonth()
  return monthKey(date) === viewingMonth() && date <= new Date().toISOString().slice(0, 10)
}

function dueAmount(payment) {
  if (payment.paid || payment.status === "PAID") return 0
  return Number(payment.amount || 0)
}

function finance() {
  const monthPayments = paymentsForViewingMonth()
  const monthSalary = salaryForViewingMonth()
  const monthlyIncome = Number(monthSalary?.amount || 0)
  const mandatoryDue = monthPayments
    .filter(payment => payment.priority === "MUST_PAY")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const skippableDue = monthPayments
    .filter(payment => payment.priority === "SKIPPABLE")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const remainingMandatory = monthPayments
    .filter(payment => payment.priority === "MUST_PAY")
    .reduce((sum, payment) => sum + dueAmount(payment), 0)
  const remainingSkippable = monthPayments
    .filter(payment => payment.priority === "SKIPPABLE")
    .reduce((sum, payment) => sum + dueAmount(payment), 0)
  const paidThisMonth = monthPayments.reduce((sum, payment) => sum + (payment.paid ? Number(payment.amount || 0) : 0), 0)
  const availableAfterMandatory = monthlyIncome - remainingMandatory
  const availableAfterBills = monthlyIncome - remainingMandatory - remainingSkippable
  const totalOutstandingDebt = monthPayments.reduce((sum, payment) => {
    if (payment.recurrence === "INSTALLMENT") return sum + Number(payment.remainingPrincipal || 0)
    return sum + dueAmount(payment)
  }, 0)

  return {
    monthlyIncome,
    monthSalary,
    mandatoryDue,
    skippableDue,
    paidThisMonth,
    remainingMandatory,
    remainingSkippable,
    availableAfterMandatory,
    targetSavings: Math.max(0, availableAfterBills),
    availableAfterSavings: availableAfterBills,
    totalOutstandingDebt
  }
}

function sortPayments(payments) {
  return [...payments].sort((a, b) => {
    if (state.paymentSort === "amount") return Number(b.amount || 0) - Number(a.amount || 0)
    if (state.paymentSort === "status") return Number(a.paid) - Number(b.paid)
    return String(a.dueDate || "").localeCompare(String(b.dueDate || ""))
  })
}

function filteredPayments() {
  const filtered = paymentsForViewingMonth().filter(payment => {
    if (state.paymentFilter === "must") return payment.priority === "MUST_PAY"
    if (state.paymentFilter === "skippable") return payment.priority === "SKIPPABLE"
    if (state.paymentFilter === "installment") return payment.recurrence === "INSTALLMENT"
    if (state.paymentFilter === "once") return payment.recurrence === "ONCE"
    if (state.paymentFilter === "paid") return payment.paid || payment.status === "PAID"
    return true
  })
  return sortPayments(filtered)
}

function checklistPayments() {
  const [viewYear, viewMonth] = viewingMonth().split("-").map(Number)
  const startDay = state.checklistFilter === "today" && isViewingCurrentMonth() ? new Date().getDate() : 1
  const start = new Date(viewYear, viewMonth - 1, startDay)
  const end = new Date(start)
  if (state.checklistFilter === "today") {
    end.setDate(start.getDate() + 1)
  } else if (state.checklistFilter === "week") {
    end.setDate(start.getDate() + 7)
  } else {
    end.setMonth(start.getMonth() + 1)
  }

  return sortPayments(paymentsForViewingMonth().filter(payment => {
    const due = new Date(payment.dueDate || payment.createdAt || new Date())
    return due >= start && due < end
  }))
}

function categoryIcon(category) {
  return {
    house: iconSvg("house"),
    laptop: iconSvg("laptop"),
    card: iconSvg("card"),
    bill: iconSvg("bolt"),
    wifi: iconSvg("wifi"),
    loan: iconSvg("bank"),
    other: iconSvg("receipt")
  }[category] || iconSvg("receipt")
}

function categoryTone(category) {
  return {
    house: "green",
    laptop: "blue",
    card: "purple",
    bill: "orange",
    wifi: "orange",
    loan: "green",
    other: "neutral"
  }[category] || "neutral"
}

function statusHtml(payment) {
  if (payment.paid || payment.status === "PAID") return `<span class="status paid">Đã trả</span>`
  if (payment.priority === "SKIPPABLE") return `<span class="status skip">Có thể skip</span>`
  return `<span class="status must">Phải trả đúng hạn</span>`
}

function render() {
  saveState()
  const isOnboarding = !state.profile?.name
  document.body.classList.toggle("is-onboarding", isOnboarding)
  renderTabIcons()
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === state.activeTab)
  })

  if (isOnboarding) {
    document.getElementById("app").innerHTML = renderOnboarding()
    bindOnboardingActions()
    return
  }

  const routes = {
    dashboard: renderDashboard,
    payments: renderPayments,
    checklist: renderChecklist,
    analytics: renderAnalytics,
    settings: renderSettings
  }

  document.getElementById("app").innerHTML = routes[state.activeTab]()
  bindScreenActions()
}

function renderTabIcons() {
  const icons = {
    dashboard: "home",
    payments: "receipt",
    checklist: "check",
    analytics: "chart",
    settings: "settings"
  }
  document.querySelectorAll(".tab").forEach(tab => {
    const icon = tab.querySelector(".tab-icon")
    if (icon) icon.innerHTML = tabIconSvg(icons[tab.dataset.tab] || "info")
  })
}

function tabIconSvg(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24"><path class="tab-fill" d="M4.25 10.9 12 4.45l7.75 6.45v8.15c0 .86-.69 1.55-1.55 1.55h-3.85v-5.3c0-.66-.54-1.2-1.2-1.2h-2.3c-.66 0-1.2.54-1.2 1.2v5.3H5.8c-.86 0-1.55-.69-1.55-1.55V10.9Z"/><path class="tab-cut" d="M2.8 11.3 12 3.65l9.2 7.65"/></svg>',
    receipt: '<svg viewBox="0 0 24 24"><path class="tab-fill" d="M7.25 3.2h9.5c.86 0 1.55.69 1.55 1.55v15.9l-3.05-1.82-3.25 1.94-3.25-1.94-3.05 1.82V4.75c0-.86.69-1.55 1.55-1.55Z"/><path class="tab-cut" d="M9.35 8.25h5.3M9.35 11.95h5.3M9.35 15.65h3.65"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path class="tab-fill" d="M5.65 3.6h12.7c1.13 0 2.05.92 2.05 2.05v12.7c0 1.13-.92 2.05-2.05 2.05H5.65a2.05 2.05 0 0 1-2.05-2.05V5.65c0-1.13.92-2.05 2.05-2.05Z"/><path class="tab-cut" d="m7.55 12.25 3 3 6-6.5"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path class="tab-ghost" d="M12 3.5a8.5 8.5 0 1 1-8.5 8.5H12V3.5Z"/><path class="tab-fill" d="M13.75 3.5a8.5 8.5 0 0 1 6.75 6.75h-6.75V3.5Z"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><path class="tab-fill" d="M13.75 3.15 14.45 6c.45.13.88.31 1.28.53l2.48-1.52 2.05 2.05-1.52 2.48c.22.4.4.83.53 1.28l2.78.7v2.96l-2.78.7c-.13.45-.31.88-.53 1.28l1.52 2.48-2.05 2.05-2.48-1.52c-.4.22-.83.4-1.28.53l-.7 2.85h-3.5L9.55 20a7.14 7.14 0 0 1-1.28-.53l-2.48 1.52-2.05-2.05 1.52-2.48c-.22-.4-.4-.83-.53-1.28l-2.78-.7v-2.96l2.78-.7c.13-.45.31-.88.53-1.28L3.74 7.06l2.05-2.05 2.48 1.52c.4-.22.83-.4 1.28-.53l.7-2.85h3.5Z"/><path class="tab-cut" d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"/></svg>'
  }

  return icons[name] || iconSvg(name)
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 11) return "Chào buổi sáng"
  if (hour < 18) return "Chào buổi chiều"
  return "Chào buổi tối"
}

function userName() {
  return state.profile?.name || "bạn"
}

function notificationCount() {
  return state.notifications.filter(item => !item.read && notificationBelongsToViewingMonth(item)).length + alertablePaymentsForViewingMonth().length
}

function header(title, subtitle = `${greeting()}, ${userName()}`) {
  const count = notificationCount()
  return `
    <div class="top-row">
      <div>
        <h1 class="title">${safeText(title)}</h1>
        <p class="subtitle">${safeText(subtitle)}</p>
      </div>
      <button class="bell ${count ? "has-count" : ""}" aria-label="Thông báo" data-count="${count}">${iconSvg("bell")}</button>
    </div>
  `
}

function monthSelector() {
  return `
    <section class="month-switcher section">
      <button type="button" class="month-arrow month-prev" data-action="month-prev" aria-label="Tháng trước">${iconSvg("chevronRight")}</button>
      <button type="button" class="month-current" data-action="open-month-picker">
        <span>Tháng đang xem</span>
        <strong>${monthLabel(viewingMonth())}</strong>
      </button>
      <button type="button" class="month-arrow month-next" data-action="month-next" aria-label="Tháng sau">${iconSvg("chevronRight")}</button>
      ${isViewingCurrentMonth() ? "" : `<button type="button" class="month-today" data-action="month-today">Về tháng này</button>`}
    </section>
  `
}

function renderOnboarding() {
  return `
    <section class="onboarding">
      <p class="eyebrow">Thiết lập ban đầu</p>
      <h1 class="title">Lương & Tiết Kiệm</h1>
      <p class="subtitle">Tạo hồ sơ trống để tự nhập lương, khoản cần trả và kế hoạch của bạn.</p>

      <form id="onboardingForm" class="card onboarding-card">
        <div class="field">
          <label>Tên của bạn</label>
          <input name="name" autocomplete="given-name" placeholder="Ví dụ: Khánh" required />
        </div>
        <button class="primary">Bắt đầu dùng app</button>
      </form>
      <div class="form-actions stack-actions onboarding-restore">
        <button type="button" class="ghost" data-action="restore-key">Nhập mã khôi phục dữ liệu</button>
        <button type="button" class="ghost" data-action="restore">Khôi phục dữ liệu từ backup</button>
      </div>
    </section>
  `
}

function bindOnboardingActions() {
  document.querySelectorAll("[data-action='restore']").forEach(button => {
    button.onclick = importJson
  })

  document.querySelectorAll("[data-action='restore-key']").forEach(button => {
    button.onclick = openRestoreKeyModal
  })

  document.getElementById("onboardingForm").onsubmit = event => {
    event.preventDefault()
    const form = new FormData(event.target)
    const name = String(form.get("name") || "").trim()
    if (!name) {
      showToast("Nhập tên trước đã")
      return
    }

    state.profile = {
      name,
      createdAt: new Date().toISOString()
    }
    state.activeTab = "dashboard"
    requestStorageProtection()
    showToast("Đã tạo app trắng")
    render()
  }
}

function renderDashboard() {
  const f = finance()
  const heroDue = f.remainingMandatory
  const heroAvailable = f.availableAfterSavings
  const monthPayments = sortPayments(paymentsForViewingMonth())
  const nextPayments = monthPayments.slice(0, 4)
  const checklist = monthPayments.slice(0, 3)

  return `
    ${header("Lương & Tiết Kiệm")}
    ${monthSelector()}
    <section class="hero dashboard-hero">
      <div class="hero-grid">
        ${metric(iconSvg("wallet"), "Lương tháng này", money(f.monthlyIncome), f.monthSalary ? "Đã nhập" : "Chưa có")}
        ${metric(iconSvg("receipt"), "Phải trả bắt buộc", money(heroDue), pct(heroDue))}
        ${metric(iconSvg("piggy"), "Có thể tiết kiệm", money(f.targetSavings), pct(f.targetSavings))}
        ${metric(iconSvg("coin"), "Còn lại sau thanh toán", money(heroAvailable), pct(heroAvailable))}
      </div>
    </section>

    <section class="section">
      ${f.monthSalary ? salaryCard(f.monthSalary) : emptyCard(
        iconSvg("wallet"),
        "Chưa nhập lương",
        "Nhập thẳng số tiền hoặc paste tin nhắn ngân hàng để bắt đầu tính kế hoạch.",
        "Nhập lương",
        "open-import"
      )}
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Việc cần trả sắp đến hạn</h2>
      <button class="link icon-link" data-tab-go="payments"><span>Xem tất cả</span>${iconSvg("chevronRight")}</button>
      </div>
      ${nextPayments.length ? `<div class="card list">${nextPayments.map(paymentRow).join("")}</div>` : emptyCard(
        iconSvg("receipt"),
        "Chưa có khoản cần trả",
        "Thêm tiền nhà, trả góp, thẻ tín dụng hoặc khoản vay để app lập checklist cho bạn.",
        "Thêm khoản",
        "open-payment"
      )}
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Kế hoạch tháng này</h2>
      <button class="link icon-link" data-tab-go="analytics"><span>Xem chi tiết</span>${iconSvg("chevronRight")}</button>
      </div>
      <div class="card">
        ${progressRow(iconSvg("card"), "Tổng nợ", f.totalOutstandingDebt, 15000000, "var(--purple)")}
        ${progressRow(iconSvg("check"), "Đã thanh toán", f.paidThisMonth, f.mandatoryDue + f.skippableDue, "var(--green)")}
        ${progressRow(iconSvg("piggy"), "Tiết kiệm dự kiến", f.targetSavings, f.monthlyIncome, "var(--blue)")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>Checklist hôm nay</h2>
      <button class="link icon-link" data-tab-go="checklist"><span>Xem tất cả</span>${iconSvg("chevronRight")}</button>
      </div>
      ${checklist.length ? `<div class="card list">${checklist.map(checklistRow).join("")}</div>` : emptyCard(
        iconSvg("check"),
        "Checklist đang trống",
        "Khi bạn thêm khoản cần trả, checklist thanh toán sẽ tự xuất hiện ở đây.",
        "Thêm khoản",
        "open-payment"
      )}
    </section>
  `
}

function safeText(value) {
  return escapeHtml(value)
}

function salaryCard() {
  const salary = arguments[0] || state.salary
  return `
    <div class="salary-card card">
      ${bankLogo(salary.bank)}
      <div>
        <strong>Đã nhận diện lương</strong>
        <div class="desc">Lương đã được lưu từ dữ liệu bạn nhập</div>
        <div class="bank-line">
          <strong>${safeText(salary.bank)}</strong> · ${money(salary.amount)} · ${safeText(salary.description)}
        </div>
      </div>
      <button class="pill green" data-action="open-import">Cập nhật lương</button>
    </div>
  `
}

function emptyCard(icon, title, desc, actionLabel, action) {
  return `
    <div class="card empty-card">
      <div class="list-icon blue">${icon}</div>
      <div>
        <strong>${title}</strong>
        <div class="desc">${desc}</div>
      </div>
      <button class="pill green" data-action="${action}">${actionLabel}</button>
    </div>
  `
}

function metric(icon, label, value, sub) {
  return `
    <div class="metric">
      <div class="metric-icon">${icon}</div>
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}</div>
      <div class="metric-sub">${sub}</div>
    </div>
  `
}

function paymentRow(payment) {
  const meta = payment.recurrence === "INSTALLMENT"
    ? `Kỳ ${payment.paidInstallmentCount || 0}/${payment.installmentCount || 0}`
    : payment.recurrence === "ONCE" ? "Một lần" : monthLabel(monthKey(payment.dueDate))

  return `
    <div class="row-item" data-payment-id="${payment.id}">
      <div class="list-icon ${categoryTone(payment.category)}">${categoryIcon(payment.category)}</div>
      <div class="row-main">
        <div class="row-line row-line-top">
          <div class="row-title">${safeText(payment.name)}</div>
          <div class="row-amount">${money(payment.amount)}</div>
        </div>
        <div class="row-line row-line-bottom">
          <div class="row-date">Hạn ${formatDate(payment.dueDate)}</div>
          <div class="row-sub">${meta}</div>
        </div>
        ${statusHtml(payment)}
      </div>
      <div class="chevron">${iconSvg("chevronRight")}</div>
    </div>
  `
}

function checklistRow(payment) {
  const meta = payment.recurrence === "INSTALLMENT"
    ? `Còn ${(payment.installmentCount || 0) - (payment.paidInstallmentCount || 0)}/${payment.installmentCount || 0} kỳ`
    : payment.paid ? "Đã thanh toán" : "Cần thanh toán"

  return `
    <div class="plan-row" data-payment-id="${payment.id}">
      <button class="check ${payment.paid ? "done" : ""}" data-action="toggle-paid" data-id="${payment.id}">${payment.paid ? iconSvg("check") : ""}</button>
      <div class="row-main">
        <div class="row-line row-line-top">
          <div class="row-title">${safeText(payment.name)}</div>
          <div class="row-amount">${money(payment.amount)}</div>
        </div>
        <div class="row-line row-line-bottom">
          <div class="row-date ${payment.priority === "SKIPPABLE" ? "orange" : ""}">Hạn ${formatDate(payment.dueDate)}</div>
          <div class="row-sub">${meta}</div>
        </div>
      </div>
      <div class="chevron">${iconSvg("chevronRight")}</div>
    </div>
  `
}

function progressRow(icon, label, value, total, color) {
  const width = total ? Math.min(100, Math.round(value / total * 100)) : 0
  return `
    <div class="progress-row">
      <div class="list-icon">${icon}</div>
      <div>
        <div>${label}</div>
        <div class="bar"><span style="width:${width}%;background:${color}"></span></div>
      </div>
      <strong style="color:${color}">${width}%</strong>
    </div>
  `
}

function renderPayments() {
  const f = finance()
  const payments = filteredPayments()
  const filterLabels = {
    all: "Tất cả",
    must: "Đúng hạn",
    skippable: "Có thể skip",
    installment: "Trả góp",
    once: "Một lần",
    paid: "Đã trả"
  }
  const sortLabels = {
    dueDate: "Sắp đến hạn",
    amount: "Số tiền cao",
    status: "Chưa trả trước"
  }
  return `
    ${header("Khoản phải trả", "")}
    ${monthSelector()}
    <div class="chips section">
      ${Object.entries(filterLabels).map(([key, label]) => `<button class="chip ${state.paymentFilter === key ? "active" : ""}" data-payment-filter="${key}">${label}</button>`).join("")}
    </div>
    <section class="hero">
      <div class="hero-grid" style="grid-template-columns:repeat(3,1fr)">
        ${metric(iconSvg("receipt"), "Tổng phải trả tháng này", money(f.mandatoryDue + f.skippableDue), "")}
        ${metric(iconSvg("check"), "Đã thanh toán", money(f.paidThisMonth), pct(f.paidThisMonth, f.mandatoryDue + f.skippableDue))}
        ${metric(iconSvg("coin"), "Còn lại", money(f.remainingMandatory + f.remainingSkippable), pct(f.remainingMandatory + f.remainingSkippable, f.mandatoryDue + f.skippableDue))}
      </div>
    </section>
    <section class="section">
      <div class="section-head">
        <h2>${payments.length} khoản phải trả</h2>
        <button class="link icon-link" data-action="cycle-payment-sort"><span>${sortLabels[state.paymentSort]}</span>${iconSvg("chevronDown")}</button>
      </div>
      ${payments.length ? `<div class="card list">${payments.map(paymentRow).join("")}</div>` : emptyCard(
        iconSvg("receipt"),
        "Chưa có khoản cần trả",
        "Bấm dấu cộng để thêm khoản đầu tiên.",
        "Thêm khoản",
        "open-payment"
      )}
      <button class="fab" data-action="open-payment" aria-label="Thêm khoản">${iconSvg("plus")}</button>
    </section>
  `
}

function renderChecklist() {
  const payments = checklistPayments()
  const done = payments.filter(payment => payment.paid).length
  return `
    ${header("Checklist thanh toán", `Quản lý các khoản phải trả đúng hạn, ${userName()}`)}
    ${monthSelector()}
    <div class="segmented section">
      <button class="segment ${state.checklistFilter === "today" ? "active" : ""}" data-filter="today">Hôm nay</button>
      <button class="segment ${state.checklistFilter === "week" ? "active" : ""}" data-filter="week">Tuần này</button>
      <button class="segment ${state.checklistFilter === "month" ? "active" : ""}" data-filter="month">Tháng này</button>
    </div>
    <section class="hero">
      <div class="hero-grid" style="grid-template-columns:repeat(3,1fr)">
        ${metric(iconSvg("list"), "Tổng checklist", payments.length, "khoản")}
        ${metric(iconSvg("check"), "Đã hoàn thành", done, "khoản")}
        ${metric(iconSvg("clock"), "Sắp đến hạn", payments.length - done, "khoản")}
      </div>
    </section>
    <section class="section">
      ${payments.length ? `<div class="card list">${payments.map(checklistRow).join("")}</div>` : emptyCard(
        iconSvg("check"),
        "Checklist đang trống",
        "Không có khoản nào trong khoảng thời gian đang chọn.",
        "Thêm khoản",
        "open-payment"
      )}
    </section>
    <section class="section info-card card" style="grid-template-columns:54px 1fr">
      <div class="list-icon blue">${iconSvg("info")}</div>
      <div>
        <strong>Tự động xử lý tháng sau</strong>
        <div class="desc">Khoản một lần đã hoàn thành sẽ tự ẩn ở tháng sau. Khoản trả góp giảm số kỳ và tổng nợ còn lại.</div>
      </div>
    </section>
  `
}

function renderAnalytics() {
  const f = finance()
  const savingRate = f.monthlyIncome ? f.targetSavings / f.monthlyIncome * 100 : 0
  const history = historySummary()
  const events = historyEvents()
  return `
    ${header("Phân tích & Tiết kiệm")}
    <section class="hero analytics-hero">
      <div>
        <div>Có thể tiết kiệm tháng này</div>
        <div class="big-money">${money(f.targetSavings)}</div>
        <div class="card" style="padding:12px">Nếu giữ kỷ luật, bạn có thể tiết kiệm <strong class="green">${money(f.targetSavings)}</strong></div>
      </div>
      <div class="donut" style="--value:${savingRate}%">
        <div class="donut-inner">
          <div>
            <div class="donut-value">${savingRate.toFixed(1).replace(".", ",")}%</div>
            <div class="muted">thu nhập</div>
          </div>
        </div>
      </div>
    </section>
    <section class="section card">
      ${analysisLine(iconSvg("wallet"), "Lương nhận", f.monthlyIncome, 100, "var(--green)")}
      ${analysisLine(iconSvg("receipt"), "Khoản phải trả bắt buộc", f.remainingMandatory, f.monthlyIncome, "var(--red)")}
      ${analysisLine(iconSvg("clock"), "Khoản có thể skip", f.remainingSkippable, f.monthlyIncome, "var(--orange)")}
      ${analysisLine(iconSvg("coin"), "Khả dụng sau kế hoạch", f.availableAfterSavings, f.monthlyIncome, "var(--blue)")}
      ${analysisLine(iconSvg("piggy"), "Tiết kiệm dự kiến", f.targetSavings, f.monthlyIncome, "var(--green)")}
    </section>
    <section class="section">
      <div class="section-head">
        <h2>Lịch sử theo tháng</h2>
        <button class="link icon-link" data-action="backup"><span>Sao lưu</span>${iconSvg("chevronRight")}</button>
      </div>
      ${history.length ? `<div class="card list">${history.map(historyRow).join("")}</div>` : emptyCard(
        iconSvg("calendar"),
        "Chưa có lịch sử",
        "Khi bạn nhập lương hoặc thêm khoản cần trả, app sẽ tự lưu theo ngày/tháng/năm.",
        "Nhập lương",
        "open-import"
      )}
    </section>
    <section class="section">
      <div class="section-head">
        <h2>Dòng thời gian</h2>
        <button class="link icon-link" data-action="backup"><span>Export</span>${iconSvg("chevronRight")}</button>
      </div>
      ${events.length ? `<div class="card list">${events.map(historyEventRow).join("")}</div>` : emptyCard(
        iconSvg("calendar"),
        "Chưa có dữ liệu theo ngày",
        "Lương và khoản cần trả sẽ được lưu với ngày phát sinh để xem lại sau.",
        "Thêm khoản",
        "open-payment"
      )}
    </section>
    <section class="section">
      <div class="section-head">
        <h2>Khuyến nghị thông minh</h2>
        <button class="link icon-link" data-action="open-recommendations"><span>Xem tất cả</span>${iconSvg("chevronRight")}</button>
      </div>
      ${paymentsForViewingMonth().length || f.monthSalary ? `<div class="chips">
          <div class="card" style="min-width:150px;padding:14px"><strong>Dời khoản có thể skip</strong><p class="muted">Tiết kiệm thêm <span class="orange">${money(f.remainingSkippable)}</span></p></div>
          <div class="card" style="min-width:150px;padding:14px"><strong>Tăng tiết kiệm</strong><p class="muted">Thêm ${money(500000)} mỗi tháng</p></div>
          <div class="card" style="min-width:150px;padding:14px"><strong>Ưu tiên trả nợ</strong><p class="muted">Giảm chi phí lãi dài hạn</p></div>
        </div>` : emptyCard(
          iconSvg("chart"),
          "Chưa đủ dữ liệu phân tích",
          "Nhập lương và khoản cần trả để app tính tỷ lệ tiết kiệm cho bạn.",
          "Nhập lương",
          "open-import"
        )}
    </section>
  `
}

function historyEventRow(event) {
  return `
    <div class="timeline-row">
      <div class="list-icon ${event.type === "salary" ? "green" : "blue"}">${event.icon}</div>
      <div class="row-main">
        <div class="row-line row-line-top">
          <strong class="row-title">${safeText(event.title)}</strong>
          <strong class="${event.type === "salary" ? "green" : "red"} row-amount">${money(event.amount)}</strong>
        </div>
        <div class="row-line row-line-bottom">
          <div class="row-date">${formatDate(event.date)}</div>
          <div class="row-sub">${safeText(event.note)}</div>
        </div>
      </div>
    </div>
  `
}

function historyRow(item) {
  return `
    <div class="history-row">
      <div>
        <strong>${monthLabel(item.key)}</strong>
        <div class="row-sub">${item.payments} khoản cần trả</div>
      </div>
      <div>
        <span>Lương</span>
        <strong class="green">${money(item.salary)}</strong>
      </div>
      <div>
        <span>Đã trả</span>
        <strong>${money(item.paid)}</strong>
      </div>
      <div>
        <span>Còn phải trả</span>
        <strong class="red">${money(item.due)}</strong>
      </div>
      <div>
        <span>Tiết kiệm</span>
        <strong class="${item.saving >= 0 ? "green" : "red"}">${money(item.saving)}</strong>
      </div>
    </div>
  `
}

function analysisLine(icon, label, value, total, color) {
  const width = total ? Math.max(0, Math.min(100, value / total * 100)) : 0
  return `
    <div class="progress-row" style="grid-template-columns:54px 1fr 104px">
      <div class="list-icon">${icon}</div>
      <div>
        <strong>${label}</strong>
        <div class="bar"><span style="width:${width}%;background:${color}"></span></div>
      </div>
      <div style="text-align:right">
        <strong style="color:${color}">${money(value)}</strong>
        <div class="muted">${pct(value)}</div>
      </div>
    </div>
  `
}

function dataSafetyText() {
  const persistent = state.dataSafety?.persistentStorage ? "Lưu bền đã bật" : "Lưu bền chưa bật"
  const backup = state.dataSafety?.lastBackupAt ? `Backup ${formatDate(eventDate(state.dataSafety.lastBackupAt))}` : "Chưa có backup"
  return `${persistent} · ${backup}`
}

function recoveryKeyText() {
  return state.dataSafety?.lastRecoveryKeyAt ? `Tạo lần cuối ${formatDate(eventDate(state.dataSafety.lastRecoveryKeyAt))}` : "Chưa tạo mã"
}

function renderSettings() {
  return `
    ${header("Cài đặt", "Dữ liệu và import")}
    <section class="section card">
      ${settingsRow(iconSvg("shield"), "Bảo vệ dữ liệu", dataSafetyText(), `<button class="link" data-action="protect-storage">Bật</button>`)}
      ${settingsRow(iconSvg("key"), "Mã khôi phục", recoveryKeyText(), `<button class="link" data-action="recovery-key">Tạo</button>`)}
      ${settingsRow(iconSvg("upload"), "Nhập mã khôi phục", "Dùng khi cài lại app hoặc đổi máy", `<button class="link" data-action="restore-key">Nhập</button>`)}
      ${settingsRow(iconSvg("user"), "Hồ sơ", `${userName()} · App cá nhân`, `<button class="link" data-action="edit-profile">Sửa</button>`)}
      ${settingsRow(iconSvg("wallet"), "Nhập lương", "Nhập tay hoặc paste tin nhắn ngân hàng", `<button class="link" data-action="open-import">Mở</button>`)}
      ${settingsRow(iconSvg("bank"), "Danh mục ngân hàng", "Danh sách ngân hàng để chọn khi nhận diện lương", `<button class="link" data-action="open-bank-directory">Mở</button>`)}
      ${settingsRow(iconSvg("download"), "Sao lưu dữ liệu", "Export JSON local", `<button class="link" data-action="backup">Export</button>`)}
      ${settingsRow(iconSvg("upload"), "Khôi phục dữ liệu", "Import file backup JSON từ máy cũ", `<button class="link" data-action="restore">Import</button>`)}
      ${settingsRow(iconSvg("refresh"), "Load sample data", "Chỉ dùng để xem mockup/demo", `<button class="link" data-action="load-sample">Load</button>`)}
      ${settingsRow(iconSvg("trash"), "Đưa app về trắng", "Xóa dữ liệu trên máy này và chạy lại onboarding", `<button class="link red" data-action="reset-empty">Reset</button>`)}
    </section>
    <section class="section info-card card" style="grid-template-columns:54px 1fr">
      <div class="list-icon blue">${iconSvg("info")}</div>
      <div>
        <strong>Dữ liệu nằm trên máy bạn</strong>
        <div class="desc">App web/PWA lưu dữ liệu trên thiết bị đang dùng. Dùng Export JSON định kỳ để giữ bản sao và Import lại khi đổi máy.</div>
      </div>
    </section>
  `
}

function settingsRow(icon, title, desc, action) {
  return `
    <div class="settings-row">
      <div class="list-icon">${icon}</div>
      <div>
        <strong>${safeText(title)}</strong>
        <div class="row-sub">${safeText(desc)}</div>
      </div>
      ${action}
    </div>
  `
}

function bindScreenActions() {
  document.querySelectorAll("[data-tab-go]").forEach(button => {
    button.onclick = () => {
      state.activeTab = button.dataset.tabGo
      render()
    }
  })

  document.querySelectorAll("[data-action='open-payment']").forEach(button => {
    button.onclick = openPaymentModal
  })

  document.querySelectorAll("[data-action='open-import']").forEach(button => {
    button.onclick = openImportModal
  })

  document.querySelectorAll("[data-action='open-bank-directory']").forEach(button => {
    button.onclick = openBankDirectoryModal
  })

  document.querySelectorAll("[data-action='edit-profile']").forEach(button => {
    button.onclick = openProfileModal
  })

  document.querySelectorAll("[data-action='toggle-paid']").forEach(button => {
    button.onclick = () => togglePaid(button.dataset.id)
  })

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.onclick = () => {
      state.checklistFilter = button.dataset.filter
      render()
    }
  })

  document.querySelectorAll("[data-action='load-sample']").forEach(button => {
    button.onclick = loadSample
  })

  document.querySelectorAll("[data-action='backup']").forEach(button => {
    button.onclick = exportJson
  })

  document.querySelectorAll("[data-action='restore']").forEach(button => {
    button.onclick = importJson
  })

  document.querySelectorAll("[data-action='recovery-key']").forEach(button => {
    button.onclick = openRecoveryKeyModal
  })

  document.querySelectorAll("[data-action='restore-key']").forEach(button => {
    button.onclick = openRestoreKeyModal
  })

  document.querySelectorAll("[data-action='protect-storage']").forEach(button => {
    button.onclick = requestStorageProtection
  })

  document.querySelectorAll("[data-action='reset-empty']").forEach(button => {
    button.onclick = resetToEmpty
  })

  document.querySelectorAll(".bell").forEach(button => {
    button.onclick = openNotificationsModal
  })

  document.querySelectorAll("[data-payment-filter]").forEach(button => {
    button.onclick = () => {
      state.paymentFilter = button.dataset.paymentFilter
      render()
    }
  })

  document.querySelectorAll("[data-action='cycle-payment-sort']").forEach(button => {
    button.onclick = cyclePaymentSort
  })

  document.querySelectorAll("[data-payment-id]").forEach(row => {
    row.onclick = event => {
      if (event.target.closest("button")) return
      openPaymentDetailModal(row.dataset.paymentId)
    }
  })

  document.querySelectorAll("[data-action='open-recommendations']").forEach(button => {
    button.onclick = openRecommendationsModal
  })

  document.querySelectorAll("[data-action='month-prev']").forEach(button => {
    button.onclick = () => {
      state.selectedMonth = addMonths(viewingMonth(), -1)
      render()
    }
  })

  document.querySelectorAll("[data-action='month-next']").forEach(button => {
    button.onclick = () => {
      state.selectedMonth = addMonths(viewingMonth(), 1)
      render()
    }
  })

  document.querySelectorAll("[data-action='month-today']").forEach(button => {
    button.onclick = () => {
      state.selectedMonth = currentMonthKey()
      render()
    }
  })

  document.querySelectorAll("[data-action='open-month-picker']").forEach(button => {
    button.onclick = openMonthPickerModal
  })
}

function cyclePaymentSort() {
  const order = ["dueDate", "amount", "status"]
  const index = order.indexOf(state.paymentSort)
  state.paymentSort = order[(index + 1) % order.length]
  render()
}

function openMonthPickerModal() {
  openModal(`
    <h2>Chọn tháng</h2>
    <form id="monthPickerForm" class="form">
      <div class="field">
        <label>Tháng cần xem</label>
        <input name="month" type="month" value="${viewingMonth()}" required />
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Hủy</button>
        <button class="primary">Xem tháng này</button>
      </div>
    </form>
  `)

  document.getElementById("monthPickerForm").onsubmit = event => {
    event.preventDefault()
    const form = new FormData(event.target)
    state.selectedMonth = String(form.get("month") || currentMonthKey())
    closeModal()
    render()
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function openPaymentDetailModal(id) {
  const basePayment = state.payments.find(item => item.id === id)
  if (!basePayment) return
  const payment = materializePaymentForMonth(basePayment, viewingMonth()) || basePayment

  openModal(`
    <h2>${escapeHtml(payment.name)}</h2>
    <div class="form">
      <div class="detail-grid">
        <div class="detail-box"><span>Số tiền</span><strong>${money(payment.amount)}</strong></div>
        <div class="detail-box"><span>Ngày đến hạn</span><strong>${formatDate(payment.dueDate)}</strong></div>
        <div class="detail-box"><span>Loại</span><strong>${payment.recurrence === "INSTALLMENT" ? "Trả góp" : payment.recurrence === "MONTHLY" ? "Theo tháng" : "Một lần"}</strong></div>
        <div class="detail-box"><span>Trạng thái</span><strong>${payment.paid ? "Đã trả" : "Chưa trả"}</strong></div>
      </div>
      ${payment.recurrence === "MONTHLY" ? `<div class="bank-line">Áp dụng từ ${monthLabel(payment.monthlyStartMonth)} đến ${monthLabel(payment.monthlyEndMonth)}</div>` : ""}
      ${payment.recurrence === "INSTALLMENT" ? `<div class="bank-line">Đã trả ${payment.paidInstallmentCount || 0}/${payment.installmentCount || 0} kỳ · Còn nợ ${money(payment.remainingPrincipal || 0)}</div>` : ""}
      <div class="form-actions stack-actions">
        <button type="button" class="primary" data-action="detail-toggle-paid">${payment.paid ? "Đánh dấu chưa trả" : "Đánh dấu đã trả"}</button>
        <button type="button" class="ghost" data-action="detail-edit-payment">Sửa khoản</button>
        <button type="button" class="ghost red" data-action="detail-delete-payment">Xóa khoản</button>
        <button type="button" class="ghost" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelector("[data-action='detail-toggle-paid']").onclick = () => {
    closeModal()
    togglePaid(id)
  }
  document.querySelector("[data-action='detail-edit-payment']").onclick = () => openEditPaymentModal(basePayment.id)
  document.querySelector("[data-action='detail-delete-payment']").onclick = () => deletePayment(basePayment.id)
}

function openEditPaymentModal(id) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return

  openModal(`
    <h2>Sửa khoản phải trả</h2>
    <form id="editPaymentForm" class="form">
      <div class="field">
        <label>Tên khoản</label>
        <input name="name" value="${escapeHtml(payment.name)}" required />
      </div>
      <div class="field">
        <label>Số tiền</label>
        <input name="amount" inputmode="numeric" value="${formatNumberInput(payment.amount)}" required />
      </div>
      <div class="field">
        <label>Ngày đến hạn</label>
        <input name="dueDate" type="date" value="${payment.dueDate || ""}" />
      </div>
      <div class="dual-field ${payment.recurrence === "MONTHLY" ? "" : "hidden"}" id="editPaymentMonthlyRange">
        <div class="field">
          <label>Tháng bắt đầu</label>
          <input name="monthlyStartMonth" type="month" value="${payment.monthlyStartMonth || monthKey(payment.dueDate || payment.createdAt) || viewingMonth()}" />
        </div>
        <div class="field">
          <label>Tháng kết thúc</label>
          <input name="monthlyEndMonth" type="month" value="${payment.monthlyEndMonth || addMonths(payment.monthlyStartMonth || monthKey(payment.dueDate || payment.createdAt) || viewingMonth(), 11)}" />
        </div>
      </div>
      <div class="field">
        <label>Loại lặp lại</label>
        <select name="recurrence" id="editPaymentRecurrence">
          <option value="ONCE" ${payment.recurrence === "ONCE" ? "selected" : ""}>Một lần</option>
          <option value="MONTHLY" ${payment.recurrence === "MONTHLY" ? "selected" : ""}>Theo tháng</option>
          <option value="INSTALLMENT" ${payment.recurrence === "INSTALLMENT" ? "selected" : ""}>Trả góp</option>
        </select>
      </div>
      <div class="field ${payment.recurrence === "INSTALLMENT" ? "" : "hidden"}" id="editPaymentInstallmentField">
        <label>Số kỳ trả góp</label>
        <input name="installmentCount" inputmode="numeric" value="${payment.installmentCount || 12}" />
      </div>
      <div class="field">
        <label>Trạng thái khoản</label>
        <select name="priority">
          <option value="MUST_PAY" ${payment.priority === "MUST_PAY" ? "selected" : ""}>Cần phải trả đúng kỳ hạn</option>
          <option value="SKIPPABLE" ${payment.priority === "SKIPPABLE" ? "selected" : ""}>Có thể skip</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Hủy</button>
        <button class="primary">Lưu thay đổi</button>
      </div>
    </form>
  `)

  document.getElementById("editPaymentForm").onsubmit = event => {
    event.preventDefault()
    const form = new FormData(event.target)
    const name = String(form.get("name") || "").trim()
    const amount = parseMoney(form.get("amount"))
    if (!name) {
      showToast("Nhập tên khoản cần trả")
      return
    }
    if (!amount) {
      showToast("Nhập số tiền lớn hơn 0")
      return
    }

    payment.name = name
    payment.amount = amount
    payment.recurrence = form.get("recurrence")
    const monthlyStartMonth = form.get("monthlyStartMonth") || monthKey(form.get("dueDate")) || viewingMonth()
    const monthlyEndMonth = form.get("monthlyEndMonth") || monthlyStartMonth
    if (payment.recurrence === "MONTHLY" && monthNumber(monthlyEndMonth) < monthNumber(monthlyStartMonth)) {
      showToast("Tháng kết thúc phải sau tháng bắt đầu")
      return
    }
    payment.monthlyStartMonth = payment.recurrence === "MONTHLY" ? monthlyStartMonth : ""
    payment.monthlyEndMonth = payment.recurrence === "MONTHLY" ? monthlyEndMonth : ""
    payment.dueDate = payment.recurrence === "MONTHLY"
      ? dueDateInMonth(form.get("dueDate") || `${monthlyStartMonth}-01`, monthlyStartMonth)
      : (form.get("dueDate") || dateForViewingMonth())
    payment.priority = form.get("priority")
    payment.category = payment.recurrence === "INSTALLMENT" ? "laptop" : payment.category || "other"
    payment.paidMonths = payment.paidMonths && typeof payment.paidMonths === "object" ? payment.paidMonths : {}
    if (payment.recurrence === "INSTALLMENT") {
      payment.installmentCount = Math.max(1, parseMoney(form.get("installmentCount") || payment.installmentCount || 12))
      payment.originalPrincipal = Math.max(Number(payment.originalPrincipal || 0), payment.amount * payment.installmentCount)
      payment.paidInstallmentCount = Object.keys(payment.paidMonths).filter(month => payment.paidMonths[month]).length
      payment.remainingPrincipal = Math.max(0, payment.originalPrincipal - payment.paidInstallmentCount * payment.amount)
    } else {
      payment.installmentCount = 0
      payment.originalPrincipal = 0
      payment.remainingPrincipal = 0
    }
    if (!payment.paid) payment.status = payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"
    closeModal()
    showToast("Đã lưu thay đổi")
    render()
  }
  bindMoneyInput(document.querySelector("#editPaymentForm [name='amount']"))
  const recurrenceInput = document.getElementById("editPaymentRecurrence")
  const installmentField = document.getElementById("editPaymentInstallmentField")
  const monthlyRange = document.getElementById("editPaymentMonthlyRange")
  recurrenceInput.onchange = () => {
    installmentField.classList.toggle("hidden", recurrenceInput.value !== "INSTALLMENT")
    monthlyRange.classList.toggle("hidden", recurrenceInput.value !== "MONTHLY")
  }
}

function deletePayment(id) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return
  if (!confirm(`Xóa khoản "${payment.name}"?`)) return
  state.payments = state.payments.filter(item => item.id !== id)
  closeModal()
  showToast("Đã xóa khoản")
  render()
}

function openNotificationsModal() {
  const upcoming = alertablePaymentsForViewingMonth().slice(0, 8)
  const customNotifications = state.notifications.filter(notificationBelongsToViewingMonth).map(item => ({
    id: item.id,
    title: item.title || "Thông báo",
    desc: item.desc || item.message || "",
    amount: Number(item.amount || 0),
    dueDate: eventDate(item.date || item.createdAt || item.savedAt),
    read: Boolean(item.read)
  }))
  const generated = upcoming.map(payment => ({
    id: payment.id,
    title: payment.name,
    desc: "Khoản cần trả",
    amount: Number(payment.amount || 0),
    dueDate: payment.dueDate,
    read: false
  }))
  const items = [...customNotifications, ...generated]

  openModal(`
    <h2>Thông báo</h2>
    <div class="form">
      ${items.length ? `<div class="card list">${items.map(item => `
        <button class="notification-row" type="button" data-notification-payment="${item.id}">
          <span class="notification-main">
            <span class="row-line row-line-top">
              <strong class="row-title">${escapeHtml(item.title)}</strong>
              ${item.amount ? `<strong class="row-amount">${money(item.amount)}</strong>` : ""}
            </span>
            <span class="row-line row-line-bottom">
              <span class="row-date">${item.dueDate ? `Hạn ${formatDate(item.dueDate)}` : escapeHtml(item.desc)}</span>
            </span>
          </span>
          <span class="status ${item.read ? "neutral" : "must"}">${item.read ? "Đã đọc" : "Mới"}</span>
        </button>
      `).join("")}</div>` : `<div class="card empty-card"><div class="list-icon blue">${iconSvg("info")}</div><div><strong>Không có thông báo</strong><div class="desc">Khi có khoản chưa trả hoặc dữ liệu mới, thông báo sẽ hiện ở đây.</div></div></div>`}
      <div class="form-actions modal-actions">
        <button type="button" class="ghost" data-action="mark-notifications-read">Đánh dấu đã đọc</button>
        <button type="button" class="ghost red" data-action="clear-notifications">Xóa thông báo</button>
        <button type="button" class="primary span-2" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelectorAll("[data-notification-payment]").forEach(button => {
    button.onclick = () => {
      const payment = state.payments.find(item => item.id === button.dataset.notificationPayment)
      if (payment) openPaymentDetailModal(payment.id)
    }
  })
  document.querySelector("[data-action='mark-notifications-read']").onclick = () => {
    state.notifications = state.notifications.map(item => ({ ...item, read: true }))
    showToast("Đã đánh dấu đã đọc")
    closeModal()
    render()
  }
  document.querySelector("[data-action='clear-notifications']").onclick = () => {
    state.notifications = []
    showToast("Đã xóa thông báo")
    closeModal()
    render()
  }
}

function openRecommendationsModal() {
  const f = finance()
  const recommendations = []
  if (f.remainingSkippable > 0) recommendations.push(["Dời khoản có thể skip", `Bạn có thể giữ lại ${money(f.remainingSkippable)} nếu chưa cần thanh toán ngay.`])
  if (f.targetSavings > 0) recommendations.push(["Khóa khoản tiết kiệm", `Sau khi trừ khoản phải trả, mức còn lại dự kiến là ${money(f.targetSavings)}.`])
  if (f.totalOutstandingDebt > 0) recommendations.push(["Ưu tiên khoản nợ lớn", "Xem lại các khoản trả góp/nợ để giảm áp lực các tháng sau."])

  openModal(`
    <h2>Khuyến nghị thông minh</h2>
    <div class="form">
      ${recommendations.length ? `<div class="card list">${recommendations.map(item => `
        <div class="settings-row">
          <div class="list-icon green">${iconSvg("chart")}</div>
          <div><strong>${item[0]}</strong><div class="row-sub">${item[1]}</div></div>
        </div>
      `).join("")}</div>` : `<div class="card empty-card"><div class="list-icon blue">${iconSvg("chart")}</div><div><strong>Chưa đủ dữ liệu</strong><div class="desc">Nhập lương và khoản cần trả để app đưa khuyến nghị.</div></div></div>`}
      <button type="button" class="primary" data-close>Đóng</button>
    </div>
  `)
}

function openBankInfoModal(id) {
  const bank = findBankByID(id)
  if (!bank) return

  openModal(`
    <h2>${escapeHtml(bank.displayName)}</h2>
    <div class="form">
      <div class="bank-info-head">
        ${bankLogo(bank)}
        <div>
          <strong>${escapeHtml(bank.shortName)}</strong>
          <div class="row-sub">${escapeHtml(bank.category || "Ngân hàng")}</div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-box"><span>Tên hiển thị</span><strong>${escapeHtml(bank.displayName)}</strong></div>
        <div class="detail-box"><span>Viết tắt</span><strong>${escapeHtml(bank.shortName)}</strong></div>
      </div>
      <div class="bank-line">
        Alias nhận diện: ${(bank.aliases || []).map(escapeHtml).join(", ") || "Chưa có"}
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" data-action="choose-bank-for-salary">Dùng để nhập lương</button>
        <button type="button" class="primary" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelector("[data-action='choose-bank-for-salary']").onclick = () => {
    closeModal()
    openImportModal()
    showToast(`Chọn ${bank.shortName} trong danh sách ngân hàng`)
  }
}

function openCustomBankInfoModal() {
  openModal(`
    <h2>Ngân hàng khác</h2>
    <div class="form">
      <div class="card empty-card">
        <div class="list-icon blue">${iconSvg("bank")}</div>
        <div>
          <strong>Dùng tên ngân hàng trong tin nhắn</strong>
          <div class="desc">Nếu ngân hàng chưa có logo, bạn vẫn có thể nhập lương thủ công. Với tin nhắn ngân hàng, chọn ngân hàng gần đúng trong danh sách hoặc nhập tay số tiền.</div>
        </div>
      </div>
      <button type="button" class="primary" data-action="open-import-from-custom-bank">Nhập lương</button>
      <button type="button" class="ghost" data-close>Đóng</button>
    </div>
  `)

  document.querySelector("[data-action='open-import-from-custom-bank']").onclick = () => {
    closeModal()
    openImportModal()
  }
}

function togglePaid(id) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return

  const recurrence = payment.recurrence || "ONCE"
  const key = viewingMonth()

  if (recurrence === "ONCE") {
    payment.paid = !payment.paid
    payment.status = payment.paid ? "PAID" : (payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE")
  } else {
    payment.paidMonths = payment.paidMonths && typeof payment.paidMonths === "object" ? payment.paidMonths : {}
    payment.paidMonths[key] = !payment.paidMonths[key]
    payment.paid = false
    payment.status = payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"
  }

  if (recurrence === "INSTALLMENT") {
    const startMonth = monthKey(payment.dueDate || payment.createdAt)
    const count = Math.max(1, Number(payment.installmentCount || 12))
    payment.paidInstallmentCount = Object.keys(payment.paidMonths || {})
      .filter(month => payment.paidMonths[month] && monthOffset(startMonth, month) >= 0 && monthOffset(startMonth, month) < count)
      .length
    payment.originalPrincipal = Number(payment.originalPrincipal || Number(payment.amount || 0) * count)
    payment.remainingPrincipal = Math.max(0, payment.originalPrincipal - payment.paidInstallmentCount * Number(payment.amount || 0))
  }

  const current = materializePaymentForMonth(payment, key) || payment
  showToast(current.paid ? "Đã đánh dấu thanh toán" : "Đã undo thanh toán")
  render()
}

function openRecoveryKeyModal() {
  state.dataSafety = {
    ...emptyState.dataSafety,
    ...(state.dataSafety || {}),
    lastRecoveryKeyAt: new Date().toISOString()
  }
  saveState()
  const code = makeRecoveryCode()

  openModal(`
    <h2>Mã khôi phục dữ liệu</h2>
    <div class="form">
      <div class="field">
        <label>Lưu mã này ở nơi riêng</label>
        <textarea id="recoveryCodeOutput" readonly>${code}</textarea>
      </div>
      <div class="note-card compact-note">
        <strong>Mã này chứa toàn bộ dữ liệu hiện tại</strong>
        <span>Sau khi thêm/sửa/xóa dữ liệu quan trọng, hãy tạo mã mới. Nếu gỡ app, nhập lại mã này để khôi phục snapshot đã lưu trong mã.</span>
      </div>
      <div class="form-actions">
        <button type="button" class="primary" data-action="copy-recovery-key">Copy mã</button>
        <button type="button" class="ghost" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelector("[data-action='copy-recovery-key']").onclick = async () => {
    const text = document.getElementById("recoveryCodeOutput").value
    try {
      await navigator.clipboard.writeText(text)
      showToast("Đã copy mã khôi phục")
    } catch {
      document.getElementById("recoveryCodeOutput").select()
      showToast("Chọn mã rồi copy thủ công")
    }
  }
}

function openRestoreKeyModal() {
  openModal(`
    <h2>Nhập mã khôi phục</h2>
    <div class="form">
      <div class="field">
        <label>Mã khôi phục</label>
        <textarea id="recoveryCodeInput" placeholder="Dán mã bắt đầu bằng QLCT-KEY-"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="primary" data-action="apply-recovery-key">Khôi phục</button>
        <button type="button" class="ghost" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelector("[data-action='apply-recovery-key']").onclick = () => {
    const code = document.getElementById("recoveryCodeInput").value
    try {
      const restored = parseRecoveryCode(code)
      if (!restored.profile.name) {
        showToast("Mã thiếu hồ sơ")
        return
      }
      state = restored
      saveState()
      closeModal()
      showToast("Đã khôi phục dữ liệu từ mã")
      render()
    } catch {
      showToast("Mã khôi phục không hợp lệ")
    }
  }
}

function openPaymentModal() {
  const today = isViewingCurrentMonth() ? new Date().toISOString().slice(0, 10) : `${viewingMonth()}-01`
  openModal(`
    <h2>Thêm khoản phải trả</h2>
    <form id="paymentForm" class="form">
      <div class="field">
        <label>Tên khoản</label>
        <input name="name" placeholder="Ví dụ: Tiền nhà, Trả góp laptop" required />
      </div>
      <div class="field">
        <label>Số tiền</label>
        <input name="amount" inputmode="numeric" placeholder="4,000,000" required />
      </div>
      <div class="field">
        <label>Ngày đến hạn</label>
        <input name="dueDate" type="date" value="${today}" />
      </div>
      <div class="dual-field hidden" id="paymentMonthlyRange">
        <div class="field">
          <label>Tháng bắt đầu</label>
          <input name="monthlyStartMonth" type="month" value="${viewingMonth()}" />
        </div>
        <div class="field">
          <label>Tháng kết thúc</label>
          <input name="monthlyEndMonth" type="month" value="${addMonths(viewingMonth(), 11)}" />
        </div>
      </div>
      <div class="field">
        <label>Loại lặp lại</label>
        <select name="recurrence" id="paymentRecurrence">
          <option value="ONCE">Một lần</option>
          <option value="MONTHLY">Theo tháng</option>
          <option value="INSTALLMENT">Trả góp</option>
        </select>
      </div>
      <div class="field hidden" id="paymentInstallmentField">
        <label>Số kỳ trả góp</label>
        <input name="installmentCount" inputmode="numeric" placeholder="12" value="12" />
      </div>
      <div class="field">
        <label>Trạng thái khoản</label>
        <select name="priority">
          <option value="MUST_PAY">Cần phải trả đúng kỳ hạn</option>
          <option value="SKIPPABLE">Có thể skip</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Hủy</button>
        <button class="primary">Lưu khoản</button>
      </div>
    </form>
  `)

  document.getElementById("paymentForm").onsubmit = event => {
    event.preventDefault()
    const form = new FormData(event.target)
    const recurrence = form.get("recurrence")
    const name = String(form.get("name") || "").trim()
    const amount = parseMoney(form.get("amount"))
    const installmentCount = recurrence === "INSTALLMENT" ? Math.max(1, parseMoney(form.get("installmentCount") || 12)) : 0
    const monthlyStartMonth = form.get("monthlyStartMonth") || monthKey(form.get("dueDate")) || viewingMonth()
    const monthlyEndMonth = form.get("monthlyEndMonth") || monthlyStartMonth
    if (!name) {
      showToast("Nhập tên khoản cần trả")
      return
    }
    if (!amount) {
      showToast("Nhập số tiền lớn hơn 0")
      return
    }
    if (recurrence === "MONTHLY" && monthNumber(monthlyEndMonth) < monthNumber(monthlyStartMonth)) {
      showToast("Tháng kết thúc phải sau tháng bắt đầu")
      return
    }

    state.payments.unshift(normalizePayment({
      id: newId(),
      name,
      amount,
      dueDate: recurrence === "MONTHLY"
        ? dueDateInMonth(form.get("dueDate") || `${monthlyStartMonth}-01`, monthlyStartMonth)
        : (form.get("dueDate") || dateForViewingMonth()),
      createdAt: new Date().toISOString(),
      recurrence,
      monthlyStartMonth: recurrence === "MONTHLY" ? monthlyStartMonth : "",
      monthlyEndMonth: recurrence === "MONTHLY" ? monthlyEndMonth : "",
      priority: form.get("priority"),
      category: recurrence === "INSTALLMENT" ? "laptop" : "other",
      status: form.get("priority") === "SKIPPABLE" ? "DEFERABLE" : "DUE",
      paid: false,
      paidMonths: {},
      installmentCount,
      originalPrincipal: installmentCount ? amount * installmentCount : 0,
      remainingPrincipal: installmentCount ? amount * installmentCount : 0
    }))
    closeModal()
    showToast("Đã thêm khoản phải trả")
    render()
  }
  bindMoneyInput(document.querySelector("#paymentForm [name='amount']"))
  const recurrenceInput = document.getElementById("paymentRecurrence")
  const installmentField = document.getElementById("paymentInstallmentField")
  const monthlyRange = document.getElementById("paymentMonthlyRange")
  recurrenceInput.onchange = () => {
    installmentField.classList.toggle("hidden", recurrenceInput.value !== "INSTALLMENT")
    monthlyRange.classList.toggle("hidden", recurrenceInput.value !== "MONTHLY")
  }
}

function openProfileModal() {
  openModal(`
    <h2>Hồ sơ cá nhân</h2>
    <form id="profileForm" class="form">
      <div class="field">
        <label>Tên của bạn</label>
        <input name="name" value="${userName()}" required />
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Đóng</button>
        <button class="primary">Lưu hồ sơ</button>
      </div>
    </form>
  `)

  document.getElementById("profileForm").onsubmit = event => {
    event.preventDefault()
    const form = new FormData(event.target)
    const name = String(form.get("name") || "").trim()
    if (!name) {
      showToast("Nhập tên trước đã")
      return
    }
    state.profile = {
      ...(state.profile || {}),
      name
    }
    closeModal()
    showToast("Đã lưu hồ sơ")
    render()
  }
}

function openBankDirectoryModal() {
  openModal(`
    <h2>Danh mục ngân hàng</h2>
    <div class="form">
      <div class="field">
        <label>Tìm ngân hàng</label>
        <input id="bankSearch" placeholder="TPBank, Tiên Phong, VCB, HSBC..." />
      </div>
      <div id="bankDirectoryList" class="bank-grid"></div>
      <button type="button" class="ghost" data-close>Đóng</button>
    </div>
  `)

  const input = document.getElementById("bankSearch")
  const list = document.getElementById("bankDirectoryList")

  const renderBanks = () => {
    const query = normalizeBankText(input.value)
    const banks = VIETNAM_BANKS.filter(bank => {
      if (!query) return true
      return [bank.displayName, bank.shortName, ...bank.aliases]
        .some(value => normalizeBankText(value).includes(query))
    })

    const bankRows = banks.map(bank => `
      <button class="bank-option" type="button" data-bank-directory-id="${bank.id}">
        ${bankLogo(bank, "small")}
        <span>
          <strong>${safeText(bank.displayName)}</strong>
          <span class="row-sub">${safeText(bank.shortName)} · ${safeText(bank.category)}</span>
        </span>
        <span class="chevron">${iconSvg("chevronRight")}</span>
      </button>
    `).join("")

    const otherBank = !query || normalizeBankText("Ngân hàng khác custom other").includes(query)
      ? `
        <button class="bank-option custom-bank" type="button" data-action="custom-bank-info">
          ${bankLogo(null, "small")}
          <span>
            <strong>Ngân hàng khác</strong>
            <span class="row-sub">Cho phép nhập tên, viết tắt và alias riêng</span>
          </span>
          <span class="chevron">${iconSvg("chevronRight")}</span>
        </button>
      `
      : ""

    list.innerHTML = bankRows + otherBank
    list.querySelectorAll("[data-bank-directory-id]").forEach(button => {
      button.onclick = () => openBankInfoModal(button.dataset.bankDirectoryId)
    })
    list.querySelectorAll("[data-action='custom-bank-info']").forEach(button => {
      button.onclick = openCustomBankInfoModal
    })
  }

  input.oninput = renderBanks
  renderBanks()
}

function openImportModal() {
  const currentSalary = latestSalaryEntryForViewingMonth()
  const currentAmount = currentSalary?.amount ? formatNumberInput(currentSalary.amount) : ""
  const currentBank = currentSalary?.bank || ""
  const currentRaw = currentSalary?.raw || ""
  const currentIsPasted = Boolean(currentRaw)
  openModal(`
    <h2>Nhập lương</h2>
    <div class="form">
      <div class="salary-options">
        <label class="check-option">
          <input id="manualAmountToggle" name="salaryInputMode" type="radio" value="manual" checked />
          <span>Nhập tay</span>
        </label>
        <label class="check-option">
          <input id="pasteMessageToggle" name="salaryInputMode" type="radio" value="paste" />
          <span>Paste tin nhắn</span>
        </label>
      </div>

      <div id="manualSalaryFields" class="form sub-form">
        <div class="field">
          <label>Số tiền lương</label>
          <input id="manualAmount" inputmode="numeric" placeholder="22,165,337" value="${currentAmount}" />
        </div>
        <div class="field">
          <label>Ngân hàng</label>
          <input id="manualBankSearch" placeholder="Tìm TPBank, Vietcombank, HSBC..." />
          <div id="manualBankList" class="salary-bank-list"></div>
        </div>
      </div>

      <div id="pasteSalaryFields" class="form sub-form hidden">
        <div class="field">
          <label>Nội dung tin nhắn lương</label>
          <textarea id="bankText" placeholder="Dán nội dung tin nhắn ngân hàng ở đây">${escapeHtml(currentRaw)}</textarea>
        </div>
        <button class="primary" id="analyzeBank">Phân tích</button>
      </div>

      <div id="analysisPreview"></div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Đóng</button>
        <button class="primary" id="saveSalary">Lưu là lương</button>
      </div>
    </div>
  `)

  let parsed = null
  let selectedManualBank = findBankByName(currentBank)
  let manualCustomBank = selectedManualBank ? "" : currentBank
  const input = document.getElementById("bankText")
  const manualAmountToggle = document.getElementById("manualAmountToggle")
  const pasteMessageToggle = document.getElementById("pasteMessageToggle")
  const manualSalaryFields = document.getElementById("manualSalaryFields")
  const pasteSalaryFields = document.getElementById("pasteSalaryFields")
  const manualAmountInput = document.getElementById("manualAmount")
  const manualBankSearch = document.getElementById("manualBankSearch")
  const manualBankList = document.getElementById("manualBankList")
  const analysisPreview = document.getElementById("analysisPreview")
  bindMoneyInput(manualAmountInput)

  const renderManualBankList = () => {
    const query = normalizeBankText(manualBankSearch.value)
    const banks = VIETNAM_BANKS.filter(bank => {
      if (!query) return true
      return [bank.displayName, bank.shortName, ...bank.aliases]
        .some(value => normalizeBankText(value).includes(query))
    }).slice(0, 18)

    const bankRows = banks.map(bank => `
      <button class="salary-bank-choice ${selectedManualBank?.id === bank.id ? "selected" : ""}" type="button" data-manual-bank-id="${bank.id}">
        ${bankLogo(bank, "small")}
        <span>
            <strong>${safeText(bank.displayName)}</strong>
            <span class="row-sub">${safeText(bank.shortName)}</span>
        </span>
      </button>
    `).join("")

    const customRow = query
      ? `<button class="salary-bank-choice ${manualCustomBank && !selectedManualBank ? "selected" : ""}" type="button" data-manual-bank-custom="${escapeHtml(manualBankSearch.value)}">
          ${bankLogo(null, "small")}
          <span>
            <strong>${escapeHtml(manualBankSearch.value)}</strong>
            <span class="row-sub">Dùng tên ngân hàng tự nhập</span>
          </span>
        </button>`
      : ""

    manualBankList.innerHTML = bankRows + customRow
    manualBankList.querySelectorAll("[data-manual-bank-id]").forEach(button => {
      button.onclick = () => {
        selectedManualBank = findBankByID(button.dataset.manualBankId)
        manualCustomBank = ""
        manualBankSearch.value = selectedManualBank?.displayName || ""
        renderManualBankList()
      }
    })
    manualBankList.querySelectorAll("[data-manual-bank-custom]").forEach(button => {
      button.onclick = () => {
        selectedManualBank = null
        manualCustomBank = button.dataset.manualBankCustom
        manualBankSearch.value = manualCustomBank
        renderManualBankList()
      }
    })
  }

  const showParsedPreview = () => {
    analysisPreview.innerHTML = parsed
      ? `<div class="card" style="padding:14px;margin-top:10px">
          <strong>${safeText(parsed.bank)}</strong> · <span class="${parsed.type === "CREDIT" ? "green" : "red"}">${safeText(parsed.type)}</span>
          <div class="preview-amount">${money(parsed.amount)}</div>
          <div class="muted">${parsed.date || "Chưa rõ ngày"} · Confidence ${parsed.confidence}</div>
          <div class="bank-line">${safeText(parsed.description || "Chưa nhận diện mô tả")}</div>
        </div>`
      : `<div class="card" style="padding:14px;margin-top:10px;color:var(--red)">Không parse được nội dung này.</div>`
  }

  const syncOptionalFields = () => {
    const isPasteMode = pasteMessageToggle.checked
    manualSalaryFields.classList.toggle("hidden", isPasteMode)
    pasteSalaryFields.classList.toggle("hidden", !isPasteMode)
    analysisPreview.innerHTML = ""
    parsed = null
  }

  manualAmountToggle.onchange = syncOptionalFields
  pasteMessageToggle.onchange = syncOptionalFields
  input.oninput = () => {
    parsed = null
    analysisPreview.innerHTML = ""
  }
  manualBankSearch.oninput = () => {
    selectedManualBank = null
    manualCustomBank = manualBankSearch.value.trim()
    renderManualBankList()
  }
  syncOptionalFields()
  manualBankSearch.value = currentBank
  renderManualBankList()
  if (currentIsPasted) {
    pasteMessageToggle.checked = true
    manualAmountToggle.checked = false
    syncOptionalFields()
    parsed = parseBankMessage(currentRaw)
    showParsedPreview()
  }

  document.getElementById("analyzeBank").onclick = () => {
    parsed = parseBankMessage(input.value)
    showParsedPreview()
  }

  document.getElementById("saveSalary").onclick = () => {
    const isPasteMode = pasteMessageToggle.checked

    if (!isPasteMode) {
      const amount = parseMoney(manualAmountInput.value)
      const bank = selectedManualBank?.displayName || String(manualCustomBank || manualBankSearch.value || "").trim()
      if (!amount) {
        showToast("Nhập số tiền lương trước đã")
        return
      }
      if (!bank) {
        showToast("Nhập ngân hàng nhận lương")
        return
      }

      const salary = {
        amount,
        bank,
        date: dateForViewingMonth(),
        savedAt: new Date().toISOString(),
        time: "",
        description: "Nhập tay",
        confidence: "MANUAL"
      }
      upsertSalaryForMonth(salary, {
        id: newId(),
        raw: "",
        amount,
        bank,
        isoDate: salary.date,
        date: formatDate(salary.date),
        savedAt: new Date().toISOString(),
        type: "CREDIT",
        salary: true
      })
      closeModal()
      showToast("Đã lưu khoản lương")
      state.activeTab = "dashboard"
      render()
      return
    }

    if (!input.value.trim()) {
      showToast("Dán nội dung tin nhắn lương trước đã")
      return
    }

    if (!parsed) parsed = parseBankMessage(input.value)
    const amount = parsed?.amount || 0
    const bank = parsed?.bank || "Không rõ"

    if (!amount) {
      showToast("Không nhận diện được số tiền")
      showParsedPreview()
      return
    }

    if (parsed.type !== "CREDIT") {
      showToast("Chưa có giao dịch tiền vào hợp lệ")
      showParsedPreview()
      return
    }

    if (bank === "Không rõ") {
      showToast("Không nhận diện được ngân hàng")
      showParsedPreview()
      return
    }

    const salary = {
      amount,
      bank,
      date: parsed?.isoDate || dateForViewingMonth(),
      savedAt: new Date().toISOString(),
      time: parsed?.time || "",
      description: parsed?.description || "Tin nhắn ngân hàng",
      confidence: parsed?.confidence || "MEDIUM"
    }
    upsertSalaryForMonth(salary, {
      id: newId(),
      raw: input.value,
      ...(parsed || {}),
      amount,
      bank,
      isoDate: salary.date,
      savedAt: new Date().toISOString(),
      salary: true
    })
    closeModal()
    showToast("Đã lưu khoản lương")
    state.activeTab = "dashboard"
    render()
  }
}

function parseBankMessage(text) {
  if (!text || !text.trim()) return null
  const normalized = text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
  const bankMatch = matchBank(text)
  const bank = bankMatch?.bank.displayName || "Không rõ"
  const isDebit = /-\s*(vnd)?\s*[0-9]/i.test(text)
  const amountMatch = text.match(/PS:\s*([+-]?[0-9]{1,3}(?:[.,][0-9]{3})+)/i)
    || text.match(/([+-]?)\s*VND\s*([0-9]{1,3}(?:[.,][0-9]{3})+)/i)
    || text.match(/([+-]?[0-9]{1,3}(?:[.,][0-9]{3})+)\s*VND/i)
    || text.match(/([+-]?[0-9]{1,3}(?:[.,][0-9]{3})+)/)
  if (!amountMatch) return null
  const amountToken = amountMatch[2] || amountMatch[1]
  const amount = parseMoney(amountToken)
  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  const timeMatch = text.match(/;(\d{1,2}:\d{2})/)
  const descMatch = text.match(/ND:\s*(.+)$/i)
  const hasSalaryWord = /(luong|salary|payslip|payroll|wage)/i.test(normalized)
  const confidence = hasSalaryWord && !isDebit ? "HIGH" : !isDebit ? "MEDIUM" : "LOW"
  const year = dateMatch ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : ""

  return {
    bank,
    amount,
    type: isDebit || amountToken.startsWith("-") ? "DEBIT" : "CREDIT",
    date: dateMatch ? `${dateMatch[1].padStart(2, "0")}/${dateMatch[2].padStart(2, "0")}/${year}` : "",
    isoDate: dateMatch ? `${year}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}` : "",
    time: timeMatch ? timeMatch[1] : "",
    description: descMatch ? descMatch[1] : text.slice(0, 90),
    confidence
  }
}

function parseMoney(value) {
  return Number(String(value || "0").replace(/[^\d-]/g, ""))
}

function formatDate(value) {
  const date = eventDate(value)
  if (!date) return ""
  const [year, month, day] = date.split("-")
  if (!year || !month || !day) return ""
  return `${day}/${month}/${year}`
}

function monthKey(value) {
  const date = String(value || new Date().toISOString())
  const vnDate = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (vnDate) return `${vnDate[3]}-${vnDate[2].padStart(2, "0")}`
  return date.slice(0, 7)
}

function monthLabel(key) {
  const [year, month] = key.split("-")
  if (!year || !month) return "Không rõ tháng"
  return `Tháng ${Number(month)}/${year}`
}

function historySummary() {
  const byMonth = new Map()

  const ensure = key => {
    if (!byMonth.has(key)) {
      byMonth.set(key, {
        key,
        salary: 0,
        paid: 0,
        due: 0,
        payments: 0
      })
    }
    return byMonth.get(key)
  }

  for (const item of state.imported.filter(item => item.salary)) {
    const bucket = ensure(monthKey(item.isoDate || item.savedAt || item.date))
    bucket.salary += Number(item.amount || 0)
  }

  if (state.salary && !state.imported.some(item => item.salary)) {
    const bucket = ensure(monthKey(state.salary.date || state.salary.savedAt))
    bucket.salary += Number(state.salary.amount || 0)
  }

  for (const payment of state.payments) {
    for (const key of paymentOccurrenceMonths(payment)) {
      const occurrence = materializePaymentForMonth(payment, key)
      if (!occurrence) continue
      const bucket = ensure(key)
      bucket.payments += 1
      if (occurrence.paid || occurrence.status === "PAID") {
        bucket.paid += Number(occurrence.amount || 0)
      } else {
        bucket.due += Number(occurrence.amount || 0)
      }
    }
  }

  return Array.from(byMonth.values())
    .map(item => ({
      ...item,
      saving: item.salary - item.paid - item.due
    }))
    .sort((a, b) => b.key.localeCompare(a.key))
}

function historyEvents() {
  const salaries = state.imported
    .filter(item => item.salary)
    .map(item => ({
      type: "salary",
      icon: iconSvg("wallet"),
      title: item.bank || "Lương",
      note: "Lương đã lưu",
      amount: Number(item.amount || 0),
      date: eventDate(item.isoDate || item.savedAt || item.date)
    }))

  const payments = state.payments.flatMap(payment => paymentOccurrenceMonths(payment)
    .map(key => materializePaymentForMonth(payment, key))
    .filter(Boolean)
    .map(occurrence => ({
      type: "payment",
      icon: iconSvg("receipt"),
      title: occurrence.name,
      note: occurrence.paid ? "Đã thanh toán" : "Khoản cần trả",
      amount: Number(occurrence.amount || 0),
      date: eventDate(occurrence.dueDate || occurrence.createdAt)
    })))

  return [...salaries, ...payments]
    .filter(item => item.date)
    .sort((a, b) => b.date.localeCompare(a.date))
}

function eventDate(value) {
  const date = String(value || "")
  const vnDate = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (vnDate) return `${vnDate[3]}-${vnDate[2].padStart(2, "0")}-${vnDate[1].padStart(2, "0")}`
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10)
  return ""
}

function openModal(html) {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">${html}</div>
    </div>
  `
  document.querySelectorAll("[data-close]").forEach(button => {
    button.onclick = closeModal
  })
}

function closeModal() {
  document.getElementById("modalRoot").innerHTML = ""
}

function showToast(message) {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.classList.add("show")
  clearTimeout(showToast.timer)
  clearTimeout(showToast.clearTimer)
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show")
    showToast.clearTimer = setTimeout(() => {
      if (!toast.classList.contains("show")) toast.textContent = ""
    }, 220)
  }, 1800)
}

function loadSample() {
  state = normalizeState(sampleState)
  showToast("Đã load sample data")
  render()
}

function resetToEmpty() {
  ;[STORAGE_KEY, ...LEGACY_STORAGE_KEYS].forEach(key => localStorage.removeItem(key))
  state = clone(emptyState)
  showToast("Đã đưa app về trắng")
  render()
}

function exportJson() {
  state.dataSafety = {
    ...emptyState.dataSafety,
    ...(state.dataSafety || {}),
    lastBackupAt: new Date().toISOString()
  }
  saveState()
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "luong-tiet-kiem-backup.json"
  link.click()
  URL.revokeObjectURL(url)
}

function importJson() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "application/json,.json"
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        state = normalizeState(JSON.parse(reader.result))
        if (!state.profile.name) {
          showToast("File thiếu tên hồ sơ")
          return
        }
        showToast("Đã khôi phục dữ liệu")
        render()
      } catch {
        showToast("File backup không hợp lệ")
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    state.activeTab = tab.dataset.tab
    render()
  }
})

document.getElementById("openImportFromSide").onclick = openImportModal
document.getElementById("loadSampleFromSide").onclick = loadSample
document.getElementById("resetFromSide").onclick = () => {
  resetToEmpty()
}

if ("serviceWorker" in navigator) {
  let refreshing = false
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  navigator.serviceWorker.register("sw.js?v=26").then(registration => {
    registration.update?.()
  }).catch(() => {})
}

installScrollGuard()
refreshStorageStatus()
render()
