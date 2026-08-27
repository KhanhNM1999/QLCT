const STORAGE_KEY = "luongTietKiem.preview.v5"

const emptyState = {
  activeTab: "dashboard",
  checklistFilter: "month",
  paymentFilter: "all",
  paymentSort: "dueDate",
  profile: {
    name: "",
    createdAt: ""
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

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return clone(emptyState)
  try {
    return normalizeState(JSON.parse(raw))
  } catch {
    return clone(emptyState)
  }
}

function normalizeState(saved) {
  const base = clone(emptyState)
  return {
    ...base,
    ...saved,
    profile: { ...base.profile, ...(saved.profile || {}) },
    paymentFilter: saved.paymentFilter || base.paymentFilter,
    paymentSort: saved.paymentSort || base.paymentSort,
    payments: Array.isArray(saved.payments) ? saved.payments : [],
    imported: Array.isArray(saved.imported) ? saved.imported : [],
    notifications: Array.isArray(saved.notifications) ? saved.notifications : []
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function money(value) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(value || 0))}đ`
}

function pct(value, total = state.salary?.amount || 0) {
  if (!total) return "0%"
  return `${(value / total * 100).toFixed(1).replace(".", ",")}%`
}

function dueAmount(payment) {
  if (payment.paid || payment.status === "PAID") return 0
  return Number(payment.amount || 0)
}

function finance() {
  const monthlyIncome = Number(state.salary?.amount || 0)
  const mandatoryDue = state.payments
    .filter(payment => payment.priority === "MUST_PAY")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const skippableDue = state.payments
    .filter(payment => payment.priority === "SKIPPABLE")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const remainingMandatory = state.payments
    .filter(payment => payment.priority === "MUST_PAY")
    .reduce((sum, payment) => sum + dueAmount(payment), 0)
  const remainingSkippable = state.payments
    .filter(payment => payment.priority === "SKIPPABLE")
    .reduce((sum, payment) => sum + dueAmount(payment), 0)
  const paidThisMonth = state.payments.reduce((sum, payment) => sum + (payment.paid ? Number(payment.amount || 0) : 0), 0)
  const availableAfterMandatory = monthlyIncome - remainingMandatory
  const availableAfterBills = monthlyIncome - remainingMandatory - remainingSkippable
  const totalOutstandingDebt = state.payments.reduce((sum, payment) => {
    if (payment.recurrence === "INSTALLMENT") return sum + Number(payment.remainingPrincipal || 0)
    return sum + dueAmount(payment)
  }, 0)

  return {
    monthlyIncome,
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
  const filtered = state.payments.filter(payment => {
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
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(start)
  if (state.checklistFilter === "today") {
    end.setDate(start.getDate() + 1)
  } else if (state.checklistFilter === "week") {
    end.setDate(start.getDate() + 7)
  } else {
    end.setMonth(start.getMonth() + 1)
  }

  return sortPayments(state.payments.filter(payment => {
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
  return state.notifications.filter(item => !item.read).length
}

function header(title, subtitle = `${greeting()}, ${userName()}`) {
  const count = notificationCount()
  return `
    <div class="top-row">
      <div>
        <h1 class="title">${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      <button class="bell ${count ? "has-count" : ""}" aria-label="Thông báo" data-count="${count}">♢</button>
    </div>
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
    </section>
  `
}

function bindOnboardingActions() {
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
    showToast("Đã tạo app trắng")
    render()
  }
}

function renderDashboard() {
  const f = finance()
  const heroDue = f.remainingMandatory
  const heroAvailable = f.availableAfterSavings
  const nextPayments = state.payments.slice(0, 4)
  const checklist = state.payments.slice(0, 3)

  return `
    ${header("Lương & Tiết Kiệm")}
    <section class="hero dashboard-hero">
      <div class="hero-grid">
        ${metric(iconSvg("wallet"), "Lương tháng này", money(f.monthlyIncome), state.salary ? "Đã nhập" : "Chưa có")}
        ${metric(iconSvg("receipt"), "Phải trả bắt buộc", money(heroDue), pct(heroDue))}
        ${metric(iconSvg("piggy"), "Có thể tiết kiệm", money(f.targetSavings), pct(f.targetSavings))}
        ${metric(iconSvg("wallet"), "Còn lại sau thanh toán", money(heroAvailable), pct(heroAvailable))}
      </div>
    </section>

    <section class="section">
      ${state.salary ? salaryCard() : emptyCard(
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
        <button class="link" data-tab-go="payments">Xem tất cả ›</button>
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
        <button class="link" data-tab-go="analytics">Xem chi tiết ›</button>
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
        <button class="link" data-tab-go="checklist">Xem tất cả ›</button>
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

function salaryCard() {
  return `
    <div class="salary-card card">
      ${bankLogo(state.salary.bank)}
      <div>
        <strong>Đã nhận diện lương</strong>
        <div class="desc">Lương đã được lưu từ dữ liệu bạn nhập</div>
        <div class="bank-line">
          <strong>${state.salary.bank}</strong> · ${money(state.salary.amount)} · ${state.salary.description}
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
  const installment = payment.recurrence === "INSTALLMENT"
    ? `<div class="row-sub">Kỳ ${payment.paidInstallmentCount || 0}/${payment.installmentCount || 0}</div>`
    : `<div class="row-sub">${payment.recurrence === "ONCE" ? "Một lần" : monthLabel(monthKey(payment.dueDate))}</div>`

  return `
    <div class="row-item" data-payment-id="${payment.id}">
      <div class="list-icon ${categoryTone(payment.category)}">${categoryIcon(payment.category)}</div>
      <div>
        <div class="row-title">${payment.name}</div>
        ${installment}
      </div>
      <div>
        <div class="row-amount">${money(payment.amount)}</div>
        <div class="row-date">${formatDate(payment.dueDate)}</div>
        ${statusHtml(payment)}
      </div>
      <div class="chevron">›</div>
    </div>
  `
}

function checklistRow(payment) {
  return `
    <div class="plan-row" data-payment-id="${payment.id}">
      <button class="check ${payment.paid ? "done" : ""}" data-action="toggle-paid" data-id="${payment.id}">${payment.paid ? "✓" : ""}</button>
      <div>
        <div class="row-title">${payment.name}</div>
        <div class="row-sub">${payment.recurrence === "INSTALLMENT" ? `Còn ${(payment.installmentCount || 0) - (payment.paidInstallmentCount || 0)}/${payment.installmentCount || 0} kỳ` : "Tự tạo từ khoản phải trả"}</div>
      </div>
      <div>
        <div class="row-amount">${money(payment.amount)}</div>
        <div class="row-date ${payment.priority === "SKIPPABLE" ? "orange" : ""}">${formatDate(payment.dueDate)}</div>
      </div>
      <div class="chevron">›</div>
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
    <div class="chips section">
      ${Object.entries(filterLabels).map(([key, label]) => `<button class="chip ${state.paymentFilter === key ? "active" : ""}" data-payment-filter="${key}">${label}</button>`).join("")}
    </div>
    <section class="hero">
      <div class="hero-grid" style="grid-template-columns:repeat(3,1fr)">
        ${metric("▰", "Tổng phải trả tháng này", money(f.mandatoryDue + f.skippableDue), "")}
        ${metric("✓", "Đã thanh toán", money(f.paidThisMonth), pct(f.paidThisMonth, f.mandatoryDue + f.skippableDue))}
        ${metric("▣", "Còn lại", money(f.remainingMandatory + f.remainingSkippable), pct(f.remainingMandatory + f.remainingSkippable, f.mandatoryDue + f.skippableDue))}
      </div>
    </section>
    <section class="section">
      <div class="section-head">
        <h2>${payments.length} khoản phải trả</h2>
        <button class="link" data-action="cycle-payment-sort">${sortLabels[state.paymentSort]}⌄</button>
      </div>
      ${payments.length ? `<div class="card list">${payments.map(paymentRow).join("")}</div>` : emptyCard(
        iconSvg("receipt"),
        "Chưa có khoản cần trả",
        "Bấm dấu cộng để thêm khoản đầu tiên.",
        "Thêm khoản",
        "open-payment"
      )}
      <button class="fab" data-action="open-payment">+</button>
    </section>
  `
}

function renderChecklist() {
  const payments = checklistPayments()
  const done = payments.filter(payment => payment.paid).length
  return `
    ${header("Checklist thanh toán", `Quản lý các khoản phải trả đúng hạn, ${userName()}`)}
    <div class="segmented section">
      <button class="segment ${state.checklistFilter === "today" ? "active" : ""}" data-filter="today">Hôm nay</button>
      <button class="segment ${state.checklistFilter === "week" ? "active" : ""}" data-filter="week">Tuần này</button>
      <button class="segment ${state.checklistFilter === "month" ? "active" : ""}" data-filter="month">Tháng này</button>
    </div>
    <section class="hero">
      <div class="hero-grid" style="grid-template-columns:repeat(3,1fr)">
        ${metric("☑", "Tổng checklist", payments.length, "khoản")}
        ${metric("✓", "Đã hoàn thành", done, "khoản")}
        ${metric("○", "Sắp đến hạn", payments.length - done, "khoản")}
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
      <div class="list-icon blue">i</div>
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
      ${analysisLine("▰", "Lương nhận", f.monthlyIncome, 100, "var(--green)")}
      ${analysisLine("♦", "Khoản phải trả bắt buộc", f.remainingMandatory, f.monthlyIncome, "var(--red)")}
      ${analysisLine("⊖", "Khoản có thể skip", f.remainingSkippable, f.monthlyIncome, "var(--orange)")}
      ${analysisLine("▣", "Khả dụng sau kế hoạch", f.availableAfterSavings, f.monthlyIncome, "var(--blue)")}
      ${analysisLine("♧", "Tiết kiệm dự kiến", f.targetSavings, f.monthlyIncome, "var(--green)")}
    </section>
    <section class="section">
      <div class="section-head">
        <h2>Lịch sử theo tháng</h2>
        <button class="link" data-action="backup">Sao lưu ›</button>
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
        <button class="link" data-action="backup">Export ›</button>
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
        <button class="link" data-action="open-recommendations">Xem tất cả ›</button>
      </div>
      ${state.payments.length || state.salary ? `<div class="chips">
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
      <div>
        <strong>${event.title}</strong>
        <div class="row-sub">${formatDate(event.date)} · ${event.note}</div>
      </div>
      <strong class="${event.type === "salary" ? "green" : "red"}">${money(event.amount)}</strong>
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

function renderSettings() {
  return `
    ${header("Cài đặt", "Dữ liệu và import")}
    <section class="section card">
      ${settingsRow(iconSvg("settings"), "Hồ sơ", `${userName()} · App cá nhân`, `<button class="link" data-action="edit-profile">Sửa</button>`)}
      ${settingsRow(iconSvg("receipt"), "Nhập lương", "Nhập tay hoặc paste tin nhắn ngân hàng", `<button class="link" data-action="open-import">Mở</button>`)}
      ${settingsRow(iconSvg("bank"), "Danh mục ngân hàng", "Danh sách ngân hàng để chọn khi nhận diện lương", `<button class="link" data-action="open-bank-directory">Mở</button>`)}
      ${settingsRow(iconSvg("chart"), "Sao lưu dữ liệu", "Export JSON local", `<button class="link" data-action="backup">Export</button>`)}
      ${settingsRow(iconSvg("wallet"), "Khôi phục dữ liệu", "Import file backup JSON từ máy cũ", `<button class="link" data-action="restore">Import</button>`)}
      ${settingsRow(iconSvg("calendar"), "Load sample data", "Chỉ dùng để xem mockup/demo", `<button class="link" data-action="load-sample">Load</button>`)}
      ${settingsRow(iconSvg("settings"), "Đưa app về trắng", "Xóa dữ liệu trên máy này và chạy lại onboarding", `<button class="link red" data-action="reset-empty">Reset</button>`)}
    </section>
    <section class="section info-card card" style="grid-template-columns:54px 1fr">
      <div class="list-icon blue">i</div>
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
        <strong>${title}</strong>
        <div class="row-sub">${desc}</div>
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
}

function cyclePaymentSort() {
  const order = ["dueDate", "amount", "status"]
  const index = order.indexOf(state.paymentSort)
  state.paymentSort = order[(index + 1) % order.length]
  render()
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function openPaymentDetailModal(id) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return

  openModal(`
    <h2>${escapeHtml(payment.name)}</h2>
    <div class="form">
      <div class="detail-grid">
        <div class="detail-box"><span>Số tiền</span><strong>${money(payment.amount)}</strong></div>
        <div class="detail-box"><span>Ngày đến hạn</span><strong>${formatDate(payment.dueDate)}</strong></div>
        <div class="detail-box"><span>Loại</span><strong>${payment.recurrence === "INSTALLMENT" ? "Trả góp" : payment.recurrence === "MONTHLY" ? "Theo tháng" : "Một lần"}</strong></div>
        <div class="detail-box"><span>Trạng thái</span><strong>${payment.paid ? "Đã trả" : "Chưa trả"}</strong></div>
      </div>
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
  document.querySelector("[data-action='detail-edit-payment']").onclick = () => openEditPaymentModal(id)
  document.querySelector("[data-action='detail-delete-payment']").onclick = () => deletePayment(id)
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
        <input name="amount" inputmode="numeric" value="${money(payment.amount).replace("đ", "")}" required />
      </div>
      <div class="field">
        <label>Ngày đến hạn</label>
        <input name="dueDate" type="date" value="${payment.dueDate || ""}" />
      </div>
      <div class="field">
        <label>Loại lặp lại</label>
        <select name="recurrence">
          <option value="ONCE" ${payment.recurrence === "ONCE" ? "selected" : ""}>Một lần</option>
          <option value="MONTHLY" ${payment.recurrence === "MONTHLY" ? "selected" : ""}>Theo tháng</option>
          <option value="INSTALLMENT" ${payment.recurrence === "INSTALLMENT" ? "selected" : ""}>Trả góp</option>
        </select>
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
    payment.name = String(form.get("name") || "").trim()
    payment.amount = parseMoney(form.get("amount"))
    payment.dueDate = form.get("dueDate")
    payment.recurrence = form.get("recurrence")
    payment.priority = form.get("priority")
    payment.category = payment.recurrence === "INSTALLMENT" ? "laptop" : payment.category || "other"
    if (!payment.paid) payment.status = payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"
    closeModal()
    showToast("Đã lưu thay đổi")
    render()
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
  const upcoming = sortPayments(state.payments.filter(payment => !payment.paid)).slice(0, 8)
  const customNotifications = state.notifications.map(item => ({
    id: item.id,
    title: item.title || "Thông báo",
    desc: item.desc || item.message || "",
    read: Boolean(item.read)
  }))
  const generated = upcoming.map(payment => ({
    id: payment.id,
    title: payment.name,
    desc: `${money(payment.amount)} · hạn ${formatDate(payment.dueDate)}`,
    read: false
  }))
  const items = [...customNotifications, ...generated]

  openModal(`
    <h2>Thông báo</h2>
    <div class="form">
      ${items.length ? `<div class="card list">${items.map(item => `
        <button class="notification-row" type="button" data-notification-payment="${item.id}">
          <span>
            <strong>${escapeHtml(item.title)}</strong>
            <span class="row-sub">${escapeHtml(item.desc)}</span>
          </span>
          <span class="status ${item.read ? "neutral" : "must"}">${item.read ? "Đã đọc" : "Mới"}</span>
        </button>
      `).join("")}</div>` : `<div class="card empty-card"><div class="list-icon blue">i</div><div><strong>Không có thông báo</strong><div class="desc">Khi có khoản chưa trả hoặc dữ liệu mới, thông báo sẽ hiện ở đây.</div></div></div>`}
      <div class="form-actions">
        <button type="button" class="ghost" data-action="mark-notifications-read">Đánh dấu đã đọc</button>
        <button type="button" class="ghost red" data-action="clear-notifications">Xóa thông báo</button>
        <button type="button" class="primary" data-close>Đóng</button>
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

  payment.paid = !payment.paid
  payment.status = payment.paid ? "PAID" : (payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE")

  if (payment.recurrence === "INSTALLMENT") {
    const paid = payment.paid ? 1 : -1
    payment.paidInstallmentCount = Math.max(0, Math.min(payment.installmentCount, (payment.paidInstallmentCount || 0) + paid))
    payment.remainingPrincipal = Math.max(0, Number(payment.originalPrincipal || 0) - payment.paidInstallmentCount * Number(payment.amount || 0))
  }

  showToast(payment.paid ? "Đã đánh dấu thanh toán" : "Đã undo thanh toán")
  render()
}

function openPaymentModal() {
  const today = new Date().toISOString().slice(0, 10)
  openModal(`
    <h2>Thêm khoản phải trả</h2>
    <form id="paymentForm" class="form">
      <div class="field">
        <label>Tên khoản</label>
        <input name="name" placeholder="Ví dụ: Tiền nhà, Trả góp laptop" required />
      </div>
      <div class="field">
        <label>Số tiền</label>
        <input name="amount" inputmode="numeric" placeholder="4.000.000" required />
      </div>
      <div class="field">
        <label>Ngày đến hạn</label>
        <input name="dueDate" type="date" value="${today}" />
      </div>
      <div class="field">
        <label>Loại lặp lại</label>
        <select name="recurrence">
          <option value="ONCE">Một lần</option>
          <option value="MONTHLY">Theo tháng</option>
          <option value="INSTALLMENT">Trả góp</option>
        </select>
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
    state.payments.unshift({
      id: crypto.randomUUID(),
      name: form.get("name"),
      amount: parseMoney(form.get("amount")),
      dueDate: form.get("dueDate"),
      createdAt: new Date().toISOString(),
      recurrence: form.get("recurrence"),
      priority: form.get("priority"),
      category: form.get("recurrence") === "INSTALLMENT" ? "laptop" : "other",
      status: form.get("priority") === "SKIPPABLE" ? "DEFERABLE" : "DUE",
      paid: false
    })
    closeModal()
    showToast("Đã thêm khoản phải trả")
    render()
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
          <strong>${bank.displayName}</strong>
          <span class="row-sub">${bank.shortName} · ${bank.category}</span>
        </span>
        <span class="chevron">›</span>
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
          <span class="chevron">›</span>
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
  openModal(`
    <h2>Nhận diện lương</h2>
    <div class="form">
      <div class="salary-options">
        <label class="check-option">
          <input id="manualAmountToggle" name="salaryInputMode" type="radio" value="manual" checked />
          <span>Nhập lương</span>
        </label>
        <label class="check-option">
          <input id="bankPickerToggle" name="salaryInputMode" type="radio" value="bank" />
          <span>Lựa chọn ngân hàng</span>
        </label>
      </div>
      <div class="field hidden" id="bankTextField">
        <label>Nhập nội dung giao dịch</label>
        <textarea id="bankText" placeholder="Dán nội dung tin nhắn ngân hàng ở đây"></textarea>
      </div>
      <div class="field" id="manualAmountField">
        <label>Số tiền lương</label>
        <input id="manualAmount" inputmode="numeric" placeholder="22.165.337" />
      </div>
      <div class="field hidden" id="bankPickerField">
        <label>Chọn ngân hàng</label>
        <input id="salaryBankSearch" placeholder="Tìm TPBank, VCB, HSBC..." />
        <div id="salaryBankList" class="salary-bank-list"></div>
      </div>
      <button class="primary hidden" id="analyzeBank">Phân tích</button>
      <div id="analysisPreview"></div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Đóng</button>
        <button class="primary" id="saveSalary">Lưu là lương</button>
      </div>
    </div>
  `)

  let parsed = null
  let selectedBank = null
  const input = document.getElementById("bankText")
  const manualAmountToggle = document.getElementById("manualAmountToggle")
  const bankPickerToggle = document.getElementById("bankPickerToggle")
  const bankTextField = document.getElementById("bankTextField")
  const manualAmountField = document.getElementById("manualAmountField")
  const bankPickerField = document.getElementById("bankPickerField")
  const manualAmountInput = document.getElementById("manualAmount")
  const salaryBankSearch = document.getElementById("salaryBankSearch")
  const salaryBankList = document.getElementById("salaryBankList")
  const analyzeButton = document.getElementById("analyzeBank")
  const analysisPreview = document.getElementById("analysisPreview")

  const renderSalaryBankList = () => {
    const query = normalizeBankText(salaryBankSearch.value)
    const banks = VIETNAM_BANKS.filter(bank => {
      if (!query) return true
      return [bank.displayName, bank.shortName, ...bank.aliases]
        .some(value => normalizeBankText(value).includes(query))
    })

    salaryBankList.innerHTML = banks.map(bank => `
      <button class="salary-bank-choice ${selectedBank?.id === bank.id ? "selected" : ""}" type="button" data-bank-id="${bank.id}">
        ${bankLogo(bank, "small")}
        <span>
          <strong>${bank.displayName}</strong>
          <span class="row-sub">${bank.shortName}</span>
        </span>
      </button>
    `).join("")

    salaryBankList.querySelectorAll("[data-bank-id]").forEach(button => {
      button.onclick = () => {
        selectedBank = findBankByID(button.dataset.bankId)
        renderSalaryBankList()
      }
    })
  }

  const syncOptionalFields = () => {
    const isBankMode = bankPickerToggle.checked
    bankTextField.classList.toggle("hidden", !isBankMode)
    bankPickerField.classList.toggle("hidden", !isBankMode)
    analyzeButton.classList.toggle("hidden", !isBankMode)
    manualAmountField.classList.toggle("hidden", isBankMode)
    analysisPreview.innerHTML = ""
    parsed = null
    if (isBankMode) renderSalaryBankList()
  }

  manualAmountToggle.onchange = syncOptionalFields
  bankPickerToggle.onchange = syncOptionalFields
  salaryBankSearch.oninput = renderSalaryBankList
  syncOptionalFields()

  document.getElementById("analyzeBank").onclick = () => {
    parsed = parseBankMessage(input.value)
    if (parsed && bankPickerToggle.checked && !selectedBank) {
      selectedBank = findBankByName(parsed.bank)
      renderSalaryBankList()
    }
    analysisPreview.innerHTML = parsed
      ? `<div class="card" style="padding:14px;margin-top:10px">
          <strong>${parsed.bank}</strong> · <span class="${parsed.type === "CREDIT" ? "green" : "red"}">${parsed.type}</span>
          <div class="preview-amount">${money(parsed.amount)}</div>
          <div class="muted">${parsed.date || "Chưa rõ ngày"} · Confidence ${parsed.confidence}</div>
          <div class="bank-line">${parsed.description || "Chưa nhận diện mô tả"}</div>
        </div>`
      : `<div class="card" style="padding:14px;margin-top:10px;color:var(--red)">Không parse được nội dung này.</div>`
  }
  document.getElementById("saveSalary").onclick = () => {
    const isBankMode = bankPickerToggle.checked

    if (!isBankMode) {
      const amount = parseMoney(manualAmountInput.value)
      if (!amount) {
        showToast("Nhập số tiền lương trước đã")
        return
      }

      state.salary = {
        amount,
        bank: "Nhập tay",
        date: new Date().toISOString().slice(0, 10),
        savedAt: new Date().toISOString(),
        time: "",
        description: "Nhập tay",
        confidence: "MANUAL"
      }
      state.imported.unshift({
        id: crypto.randomUUID(),
        raw: "",
        amount,
        bank: "Nhập tay",
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

    if (!selectedBank) {
      showToast("Chọn một ngân hàng trong danh sách")
      return
    }

    if (!parsed) parsed = parseBankMessage(input.value)
    const amount = parsed?.amount || 0
    const bank = selectedBank.displayName

    if (!amount) {
      showToast("Nhập số tiền lương trước đã")
      return
    }

    if (parsed.type !== "CREDIT") {
      showToast("Chưa có giao dịch tiền vào hợp lệ")
      return
    }

    state.salary = {
      amount,
      bank,
      date: parsed?.isoDate || new Date().toISOString().slice(0, 10),
      savedAt: new Date().toISOString(),
      time: parsed?.time || "",
      description: parsed?.description || "Nhập tay",
      confidence: parsed?.confidence || "MANUAL"
    }
    state.imported.unshift({
      id: crypto.randomUUID(),
      raw: input.value,
      ...(parsed || {}),
      amount,
      bank,
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
  if (!value) return ""
  const [year, month, day] = value.split("-")
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
    const bucket = ensure(monthKey(payment.dueDate || payment.createdAt))
    bucket.payments += 1
    if (payment.paid || payment.status === "PAID") {
      bucket.paid += Number(payment.amount || 0)
    } else {
      bucket.due += Number(payment.amount || 0)
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

  const payments = state.payments.map(payment => ({
    type: "payment",
    icon: iconSvg("receipt"),
    title: payment.name,
    note: payment.paid ? "Đã thanh toán" : "Khoản cần trả",
    amount: Number(payment.amount || 0),
    date: eventDate(payment.dueDate || payment.createdAt)
  }))

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
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800)
}

function loadSample() {
  state = clone(sampleState)
  showToast("Đã load sample data")
  render()
}

function resetToEmpty() {
  localStorage.removeItem(STORAGE_KEY)
  state = clone(emptyState)
  showToast("Đã đưa app về trắng")
  render()
}

function exportJson() {
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
  navigator.serviceWorker.register("sw.js?v=8").catch(() => {})
}

render()
