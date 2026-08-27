const STORAGE_KEY = "luongTietKiem.preview.v5"

const emptyState = {
  activeTab: "dashboard",
  checklistFilter: "month",
  profile: {
    name: "",
    createdAt: ""
  },
  salary: null,
  faceId: false,
  payments: [],
  imported: [],
  notifications: []
}

const sampleState = {
  activeTab: "dashboard",
  checklistFilter: "month",
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
  faceId: false,
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
    : `<div class="row-sub">${payment.recurrence === "ONCE" ? "Một lần" : "Tháng 8/2026"}</div>`

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
    <div class="plan-row">
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
  return `
    ${header("Khoản phải trả", "")}
    <div class="chips section">
      <button class="chip active">Tất cả</button>
      <button class="chip">Đúng hạn</button>
      <button class="chip">Có thể skip</button>
      <button class="chip">Trả góp</button>
      <button class="chip">Một lần</button>
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
        <h2>${state.payments.length} khoản phải trả</h2>
        <button class="link">Sắp đến hạn⌄</button>
      </div>
      ${state.payments.length ? `<div class="card list">${state.payments.map(paymentRow).join("")}</div>` : emptyCard(
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
  const done = state.payments.filter(payment => payment.paid).length
  return `
    ${header("Checklist thanh toán", `Quản lý các khoản phải trả đúng hạn, ${userName()}`)}
    <div class="segmented section">
      <button class="segment ${state.checklistFilter === "today" ? "active" : ""}" data-filter="today">Hôm nay</button>
      <button class="segment ${state.checklistFilter === "week" ? "active" : ""}" data-filter="week">Tuần này</button>
      <button class="segment ${state.checklistFilter === "month" ? "active" : ""}" data-filter="month">Tháng này</button>
    </div>
    <section class="hero">
      <div class="hero-grid" style="grid-template-columns:repeat(3,1fr)">
        ${metric("☑", "Tổng checklist", state.payments.length, "khoản")}
        ${metric("✓", "Đã hoàn thành", done, "khoản")}
        ${metric("◌", "Sắp đến hạn", state.payments.length - done, "khoản")}
      </div>
    </section>
    <section class="section">
      ${state.payments.length ? `<div class="card list">${state.payments.map(checklistRow).join("")}</div>` : emptyCard(
        iconSvg("check"),
        "Checklist đang trống",
        "Thêm khoản cần trả để app tự tạo việc cần làm trong tháng.",
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
        <h2>Khuyến nghị thông minh</h2>
        <button class="link">Xem tất cả ›</button>
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
    ${header("Cài đặt", "Bảo mật, dữ liệu và import")}
    <section class="section card">
      ${settingsRow(iconSvg("settings"), "Hồ sơ", `${userName()} · App cá nhân`, `<button class="link" data-action="edit-profile">Sửa</button>`)}
      ${settingsRow(iconSvg("receipt"), "Paste thông báo", "Nhập text notification ngân hàng", `<button class="link" data-action="open-import">Mở</button>`)}
      ${settingsRow(iconSvg("wallet"), "Đọc từ ảnh chụp màn hình", "Preview mô phỏng OCR on-device", `<button class="link" data-action="open-import">Mở</button>`)}
      ${settingsRow(iconSvg("bank"), "Danh mục ngân hàng", "49 ngân hàng Việt Nam + badge local", `<button class="link" data-action="open-bank-directory">Mở</button>`)}
      ${settingsRow(iconSvg("settings"), "Khóa ứng dụng", "Face ID hoặc passcode trên iPhone thật", `<button class="switch ${state.faceId ? "on" : ""}" data-action="toggle-face"></button>`)}
      ${settingsRow(iconSvg("chart"), "Sao lưu dữ liệu", "Export JSON local", `<button class="link" data-action="backup">Export</button>`)}
      ${settingsRow(iconSvg("wallet"), "Khôi phục dữ liệu", "Import file backup JSON từ máy cũ", `<button class="link" data-action="restore">Import</button>`)}
      ${settingsRow(iconSvg("calendar"), "Load sample data", "Chỉ dùng để xem mockup/demo", `<button class="link" data-action="load-sample">Load</button>`)}
      ${settingsRow(iconSvg("settings"), "Đưa app về trắng", "Xóa dữ liệu trên máy này và chạy lại onboarding", `<button class="link red" data-action="reset-empty">Reset</button>`)}
    </section>
    <section class="section info-card card" style="grid-template-columns:54px 1fr">
      <div class="list-icon blue">i</div>
      <div>
        <strong>Public app khả thi</strong>
        <div class="desc">Không cần App Store. GitHub Actions có thể build unsigned IPA, rồi bạn dùng Sideloadly trên Windows để ký/cài vào iPhone. Apple ID miễn phí thường phải refresh khoảng 7 ngày.</div>
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

  document.querySelectorAll("[data-action='toggle-face']").forEach(button => {
    button.onclick = () => {
      state.faceId = !state.faceId
      showToast(state.faceId ? "Đã bật khóa ứng dụng" : "Đã tắt khóa ứng dụng")
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
      <button class="bank-option" type="button">
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
        <button class="bank-option custom-bank" type="button">
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
        <textarea id="bankText" placeholder="Dán notification TPBank, HSBC hoặc nội dung OCR ở đây"></textarea>
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
        time: "",
        description: "Nhập tay",
        confidence: "MANUAL"
      }
      state.imported.unshift({
        id: crypto.randomUUID(),
        raw: "",
        amount,
        bank: "Nhập tay",
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

render()
