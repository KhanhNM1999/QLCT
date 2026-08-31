const STORAGE_KEY = "luongTietKiem.preview.v5"
const LEGACY_STORAGE_KEYS = [
  "luongTietKiem.preview.v4",
  "luongTietKiem.preview.v3",
  "luongTietKiem.preview.v2",
  "luongTietKiem.preview.v1"
]
const CLOUD_SYNC_DELAY = 900
const DEFAULT_SUPABASE_URL = "https://hazrohmgtfzawhtowfqx.supabase.co"
const LEGACY_BAD_SUPABASE_URLS = ["https://hazrohmgttfzawhtowfqx.supabase.co"]
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhenJvaG1ndGZ6YXdodG93ZnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNzgyNzMsImV4cCI6MjEwMzY1NDI3M30.wX2b7ZtNJ5MnA12Lfom1Ajnemmm3Sc6cFX8KpGqLPSs"

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
    persistentStorage: false,
    persistentAskedAt: "",
    supabaseEnabled: false,
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseLastSyncedAt: "",
    supabaseCloudUpdatedAt: "",
    supabaseSyncStatus: "off",
    supabaseSyncError: "",
    supabaseUserId: "",
    supabaseUsername: "",
    supabaseSessionToken: ""
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

const PAYMENT_CATEGORIES = [
  ["housing", "🏠", "Nhà ở", "green", ["Tiền thuê nhà / tiền trọ", "Phí dịch vụ / quản lý", "Tiền điện", "Tiền nước", "Internet / Wi-Fi", "Phí gửi xe", "Gas / nhiên liệu sinh hoạt", "Sửa chữa phòng / nhà", "Mua đồ dùng phòng trọ", "Chuyển nhà / đặt cọc nhà", "Khoản nhà ở khác"]],
  ["food", "🍜", "Ăn uống", "orange", ["Ăn sáng", "Ăn trưa", "Ăn tối", "Đi chợ / siêu thị", "Đồ ăn đặt giao", "Cà phê / trà sữa", "Ăn ngoài / nhà hàng", "Đồ ăn vặt", "Nước uống", "Tiệc / liên hoan", "Khoản ăn uống khác"]],
  ["transport", "🛵", "Đi lại", "blue", ["Xăng xe", "Sạc xe điện", "Gửi xe", "Grab / Be / Taxi", "Xe buýt / Metro", "Vé tàu / xe khách", "Vé máy bay", "Bảo dưỡng xe", "Sửa xe", "Rửa xe", "Bảo hiểm xe", "Phí đường bộ / cầu đường", "Phạt giao thông", "Khoản đi lại khác"]],
  ["tech", "📱", "Điện thoại & công nghệ", "blue", ["Cước điện thoại", "4G / 5G", "Mua điện thoại", "Trả góp điện thoại", "Mua máy tính / laptop", "Trả góp máy tính / laptop", "Phụ kiện công nghệ", "Sửa điện thoại / máy tính", "iCloud", "Google One / lưu trữ đám mây", "Phần mềm / ứng dụng", "Khoản công nghệ khác"]],
  ["credit_card", "💳", "Thẻ tín dụng", "purple", ["Thanh toán dư nợ thẻ tín dụng", "Thanh toán tối thiểu thẻ tín dụng", "Trả góp qua thẻ tín dụng", "Phí thường niên", "Phí chậm thanh toán", "Phí chuyển đổi trả góp", "Lãi thẻ tín dụng", "Phí thẻ khác"]],
  ["loan", "💸", "Vay & nợ", "purple", ["Vay ngân hàng", "Vay tiêu dùng", "Vay tín chấp", "Vay thế chấp", "Vay công ty tài chính", "Vay qua ứng dụng", "Vay người thân", "Vay bạn bè", "Nợ cá nhân khác", "Trả gốc khoản vay", "Trả lãi khoản vay", "Trả cả gốc và lãi", "Phí khoản vay", "Khoản nợ khác"]],
  ["installment", "🛍️", "Trả góp", "purple", ["Trả góp điện thoại", "Trả góp laptop / máy tính", "Trả góp xe máy", "Trả góp ô tô", "Trả góp đồ điện tử", "Trả góp đồ gia dụng", "Trả góp mua sắm", "Buy Now Pay Later / Mua trước trả sau", "Shopee SPayLater", "Kredivo", "Home Credit", "FE Credit", "HD SAISON", "Trả góp khác"]],
  ["banking", "🏦", "Tài chính & ngân hàng", "green", ["Phí tài khoản ngân hàng", "Phí chuyển tiền", "Phí SMS Banking", "Phí dịch vụ ngân hàng", "Phí duy trì tài khoản", "Phí rút tiền", "Lãi / phí thấu chi", "Phí tài chính khác"]],
  ["saving", "💰", "Tiết kiệm", "green", ["Tiết kiệm hàng tháng", "Quỹ khẩn cấp", "Tiết kiệm mua nhà", "Tiết kiệm mua xe", "Tiết kiệm du lịch", "Tiết kiệm cưới hỏi", "Tiết kiệm mua đồ công nghệ", "Tiết kiệm mục tiêu khác"]],
  ["investment", "📈", "Đầu tư", "green", ["Chứng khoán", "Chứng chỉ quỹ", "Trái phiếu", "Vàng", "Tiền gửi có kỳ hạn", "Đầu tư kinh doanh", "Đầu tư khác"]],
  ["health", "🏥", "Sức khỏe", "red", ["Khám bệnh", "Thuốc", "Xét nghiệm", "Nha khoa", "Mắt / kính", "Điều trị / thủ thuật", "Bảo hiểm y tế", "Bảo hiểm sức khỏe", "Thực phẩm bổ sung", "Khoản sức khỏe khác"]],
  ["insurance", "🛡️", "Bảo hiểm", "blue", ["Bảo hiểm nhân thọ", "Bảo hiểm sức khỏe", "Bảo hiểm xe", "Bảo hiểm nhà / tài sản", "Bảo hiểm du lịch", "Bảo hiểm khác"]],
  ["work", "👔", "Công việc", "blue", ["Ăn uống khi đi làm", "Đi lại phục vụ công việc", "Trang phục công sở", "Thiết bị phục vụ công việc", "Công tác", "Chứng chỉ nghề nghiệp", "Phí nghề nghiệp", "Khoản công việc khác"]],
  ["education", "📚", "Học tập & phát triển bản thân", "blue", ["Học phí", "Khóa học", "Ngoại ngữ", "Sách / tài liệu", "Thi chứng chỉ", "Phần mềm học tập", "Dụng cụ học tập", "Khoản học tập khác"]],
  ["shopping", "👕", "Mua sắm cá nhân", "orange", ["Quần áo", "Giày dép", "Túi / balo", "Mỹ phẩm", "Chăm sóc cá nhân", "Cắt tóc", "Đồ gia dụng", "Đồ điện tử", "Mua sắm online", "Khoản mua sắm khác"]],
  ["entertainment", "🎮", "Giải trí", "purple", ["Xem phim", "Game", "Nạp game", "Karaoke", "Cafe / đi chơi", "Du lịch", "Khách sạn", "Thể thao", "Gym", "Sở thích cá nhân", "Khoản giải trí khác"]],
  ["subscription", "📺", "Dịch vụ đăng ký định kỳ", "purple", ["Netflix", "YouTube Premium", "Spotify", "Apple Music", "iCloud+", "Google One", "Microsoft 365", "ChatGPT", "Phần mềm / AI", "Game subscription", "Báo / nội dung số", "Dịch vụ định kỳ khác"]],
  ["family", "👨‍👩‍👧", "Gia đình", "green", ["Gửi tiền về gia đình", "Biếu bố mẹ", "Hỗ trợ người thân", "Chi phí con cái", "Học phí con", "Tiền sinh hoạt gia đình", "Chăm sóc người thân", "Khoản gia đình khác"]],
  ["social", "❤️", "Tình cảm & xã hội", "red", ["Hẹn hò", "Quà tặng", "Sinh nhật", "Cưới hỏi", "Mừng cưới", "Đám hiếu", "Liên hoan", "Gặp gỡ bạn bè", "Từ thiện / ủng hộ", "Khoản xã hội khác"]],
  ["pet", "🐶", "Thú cưng", "orange", ["Thức ăn", "Khám thú y", "Thuốc / vaccine", "Grooming", "Phụ kiện", "Khoản thú cưng khác"]],
  ["tax", "🧾", "Thuế, phí & nghĩa vụ", "orange", ["Thuế", "Lệ phí", "Phạt hành chính", "Khoản phải nộp", "Nghĩa vụ tài chính khác"]],
  ["emergency", "🚨", "Chi phí khẩn cấp", "red", ["Khám chữa bệnh khẩn cấp", "Sửa xe đột xuất", "Sửa thiết bị đột xuất", "Hỗ trợ gia đình khẩn cấp", "Mất / hỏng tài sản", "Chi phí phát sinh bất ngờ", "Khoản khẩn cấp khác"]],
  ["other_payable", "📦", "Khoản phải trả khác", "neutral", ["Hoàn tiền cho người khác", "Tiền ứng trước phải hoàn", "Chia tiền ăn / đi chơi", "Chia tiền nhà", "Chia hóa đơn", "Khoản phải trả cá nhân", "Khoản khác"]],
  ["custom", "✏️", "Tùy chỉnh", "neutral", ["Tạo danh mục mới..."]]
].map(([id, icon, label, tone, items]) => ({ id, icon, label, tone, items }))

const DebtEngine = {
  calculateTotalPaid(payment) {
    const records = Array.isArray(payment.debtPayments) ? payment.debtPayments : []
    return moneyInt(payment.initialPaidAmount) + records.reduce((sum, record) => sum + moneyInt(record.principalPaid || record.actualPaidAmount), 0)
  },
  calculateRemainingPrincipal(payment) {
    return Math.max(0, moneyInt(payment.originalPrincipal) - this.calculateTotalPaid(payment))
  },
  calculateProgress(payment) {
    const total = moneyInt(payment.originalPrincipal)
    if (!total) return 0
    return Math.min(100, this.calculateTotalPaid(payment) / total * 100)
  },
  calculateEstimatedRemainingPayments(payment) {
    const monthlyPayment = moneyInt(payment.monthlyPayment || payment.amount)
    const remaining = this.calculateRemainingPrincipal(payment)
    if (!monthlyPayment || !remaining) return 0
    return Math.ceil(remaining / monthlyPayment)
  },
  calculateNextPaymentAmount(payment) {
    const monthlyPayment = moneyInt(payment.monthlyPayment || payment.amount)
    const remaining = this.calculateRemainingPrincipal(payment)
    if (!remaining) return 0
    return Math.min(remaining, monthlyPayment || remaining)
  },
  isPaidOff(payment) {
    return this.calculateRemainingPrincipal(payment) <= 0 && moneyInt(payment.originalPrincipal) > 0
  },
  snapshot(payment) {
    const records = Array.isArray(payment.debtPayments) ? payment.debtPayments : []
    const paidPeriods = new Set(records.map(record => record.paymentPeriod).filter(Boolean))
    return {
      totalPaid: this.calculateTotalPaid(payment),
      remainingPrincipal: this.calculateRemainingPrincipal(payment),
      progress: this.calculateProgress(payment),
      estimatedRemainingPayments: this.calculateEstimatedRemainingPayments(payment),
      nextPaymentAmount: this.calculateNextPaymentAmount(payment),
      paidOff: this.isPaidOff(payment),
      paidPeriods,
      records
    }
  }
}

let state = loadState()
let touchStartY = 0
let cloudSyncTimer = null
let cloudSyncBooted = false
let suppressCloudSync = false

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
  const paymentType = payment.paymentType || (recurrence === "INSTALLMENT" ? "INSTALLMENT" : recurrence === "MONTHLY" ? "RECURRING" : "ONCE")
  const debtLike = paymentType === "MONTHLY_DEBT" || paymentType === "INSTALLMENT" || recurrence === "INSTALLMENT"
  const installmentCount = debtLike ? Math.max(1, Number(payment.installmentCount || 12)) : Number(payment.installmentCount || 0)
  const originalPrincipal = debtLike
    ? moneyInt(payment.originalPrincipal || amount * installmentCount)
    : moneyInt(payment.originalPrincipal || 0)
  const derivedPaidFromOldState = debtLike && !Array.isArray(payment.debtPayments) && payment.remainingPrincipal
    ? Math.max(0, originalPrincipal - moneyInt(payment.remainingPrincipal))
    : 0
  const initialPaidAmount = debtLike
    ? moneyInt(payment.initialPaidAmount || derivedPaidFromOldState)
    : 0
  const debtPayments = Array.isArray(payment.debtPayments)
    ? payment.debtPayments.map(normalizeDebtPaymentRecord).filter(Boolean)
    : []
  const debtSnapshot = debtLike
    ? DebtEngine.snapshot({ ...payment, amount, originalPrincipal, initialPaidAmount, debtPayments })
    : null
  const paidInstallmentCount = debtLike
    ? debtSnapshot.paidPeriods.size || Object.values(paidMonths).filter(Boolean).length || Number(payment.paidInstallmentCount || 0)
    : Number(payment.paidInstallmentCount || 0)
  const categoryInfo = categoryForPayment(payment)

  return {
    ...payment,
    amount,
    recurrence,
    paymentType,
    paidMonths,
    monthlyStartMonth,
    monthlyEndMonth,
    installmentCount,
    paidInstallmentCount,
    initialPaidAmount,
    debtPayments,
    originalPrincipal,
    remainingPrincipal: debtLike
      ? debtSnapshot.remainingPrincipal
      : Number(payment.remainingPrincipal || 0)
    ,
    categoryId: categoryInfo.id,
    categoryLabel: categoryInfo.label,
    categoryIcon: categoryInfo.icon,
    categoryTone: categoryInfo.tone,
    subcategory: payment.subcategory || categoryInfo.subcategory || "",
    customCategory: payment.customCategory || "",
    status: debtLike
      ? (debtSnapshot.paidOff ? "PAID_OFF" : (payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"))
      : (payment.status || "DUE")
  }
}

function moneyInt(value) {
  return Math.max(0, Math.round(Number(value || 0)))
}

function normalizeDebtPaymentRecord(record) {
  if (!record || typeof record !== "object") return null
  const actualPaidAmount = moneyInt(record.actualPaidAmount ?? record.principalPaid ?? record.amount)
  if (!actualPaidAmount) return null
  return {
    id: record.id || newId(),
    debtID: record.debtID || "",
    scheduledAmount: moneyInt(record.scheduledAmount || actualPaidAmount),
    actualPaidAmount,
    principalPaid: moneyInt(record.principalPaid || actualPaidAmount),
    interestPaid: moneyInt(record.interestPaid || 0),
    feePaid: moneyInt(record.feePaid || 0),
    paidAt: record.paidAt || new Date().toISOString(),
    dueDate: eventDate(record.dueDate || record.paidAt) || new Date().toISOString().slice(0, 10),
    paymentPeriod: record.paymentPeriod || monthKey(record.dueDate || record.paidAt) || currentMonthKey(),
    notes: record.notes || "",
    createdAt: record.createdAt || record.paidAt || new Date().toISOString()
  }
}

function saveState(options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  if (!options.skipCloud && cloudSyncBooted && !suppressCloudSync) scheduleCloudSync()
}

function supabaseConfig() {
  const dataSafety = state.dataSafety || {}
  const savedUrl = String(dataSafety.supabaseUrl || "").trim().replace(/\/+$/g, "")
  const url = savedUrl && !LEGACY_BAD_SUPABASE_URLS.includes(savedUrl) ? savedUrl : DEFAULT_SUPABASE_URL
  return {
    enabled: Boolean(dataSafety.supabaseEnabled),
    url,
    anonKey: String(dataSafety.supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY).trim()
  }
}

function supabaseSession() {
  const dataSafety = state.dataSafety || {}
  return {
    userId: String(dataSafety.supabaseUserId || ""),
    username: String(dataSafety.supabaseUsername || ""),
    sessionToken: String(dataSafety.supabaseSessionToken || "")
  }
}

function isSupabaseSignedIn() {
  const session = supabaseSession()
  return Boolean(session.userId && session.sessionToken)
}

function accountDisplayName() {
  const session = supabaseSession()
  if (session.username) return session.username
  return "Bạn"
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32)
}

function hasSupabaseConfig() {
  const config = supabaseConfig()
  return Boolean(config.enabled && config.url && config.anonKey && isSupabaseSignedIn())
}

function publicDataSafety(dataSafety = {}) {
  const {
    supabaseUrl,
    supabaseAnonKey,
    supabaseSyncStatus,
    supabaseSyncError,
    supabaseSessionToken,
    ...safeDataSafety
  } = dataSafety
  return safeDataSafety
}

function cloudPayload() {
  const payload = clone(state)
  payload.dataSafety = publicDataSafety(payload.dataSafety || {})
  return payload
}

function supabaseRpcUrl(config, name) {
  return `${config.url}/rest/v1/rpc/${name}`
}

async function supabaseFetch(config, endpoint, options = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(text || `Supabase HTTP ${response.status}`)
  }
  if (response.status === 204) return null
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

function saveSupabaseSession(data = {}) {
  state.dataSafety = {
    ...emptyState.dataSafety,
    ...(state.dataSafety || {}),
    supabaseEnabled: true,
    supabaseUrl: supabaseConfig().url,
    supabaseAnonKey: supabaseConfig().anonKey,
    supabaseUserId: data.user_id || data.userId || state.dataSafety?.supabaseUserId || "",
    supabaseUsername: data.username || state.dataSafety?.supabaseUsername || "",
    supabaseSessionToken: data.session_token || data.sessionToken || state.dataSafety?.supabaseSessionToken || "",
    supabaseSyncStatus: "idle",
    supabaseSyncError: ""
  }
  saveState({ skipCloud: true })
}

function clearSupabaseSession() {
  state.dataSafety = {
    ...emptyState.dataSafety,
    ...(state.dataSafety || {}),
    supabaseUserId: "",
    supabaseUsername: "",
    supabaseSessionToken: "",
    supabaseSyncStatus: state.dataSafety?.supabaseEnabled ? "idle" : "off"
  }
  saveState({ skipCloud: true })
}

async function signUpSupabase(username, password) {
  const normalized = normalizeUsername(username)
  const config = supabaseConfig()
  const rows = await supabaseFetch(config, supabaseRpcUrl(config, "qlct_register_user"), {
    method: "POST",
    body: JSON.stringify({
      user_name: normalized,
      user_password: password
    })
  })
  const data = Array.isArray(rows) ? rows[0] : rows
  saveSupabaseSession(data)
  return data
}

async function signInSupabase(username, password) {
  const normalized = normalizeUsername(username)
  const config = supabaseConfig()
  const rows = await supabaseFetch(config, supabaseRpcUrl(config, "qlct_login_user"), {
    method: "POST",
    body: JSON.stringify({
      user_name: normalized,
      user_password: password
    })
  })
  const data = Array.isArray(rows) ? rows[0] : rows
  saveSupabaseSession(data)
  return data
}

async function signOutSupabase() {
  const session = supabaseSession()
  if (session.sessionToken) {
    try {
      const config = supabaseConfig()
      await supabaseFetch(config, supabaseRpcUrl(config, "qlct_logout_user"), {
        method: "POST",
        body: JSON.stringify({ session_token: session.sessionToken })
      })
    } catch {
    }
  }
  clearSupabaseSession()
}

function setCloudSyncStatus(status, error = "") {
  const previousSuppress = suppressCloudSync
  suppressCloudSync = true
  state.dataSafety = {
    ...emptyState.dataSafety,
    ...(state.dataSafety || {}),
    supabaseSyncStatus: status,
    supabaseSyncError: error
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  if (state.activeTab === "settings") render()
  suppressCloudSync = previousSuppress
}

function scheduleCloudSync() {
  if (!hasSupabaseConfig()) return
  clearTimeout(cloudSyncTimer)
  cloudSyncTimer = setTimeout(() => {
    pushCloudState(true)
  }, CLOUD_SYNC_DELAY)
}

async function fetchCloudRecord() {
  const config = supabaseConfig()
  if (!hasSupabaseConfig()) throw new Error("Thiếu cấu hình Supabase")
  const rows = await supabaseFetch(config, supabaseRpcUrl(config, "qlct_get_session_state"), {
    method: "POST",
    body: JSON.stringify({ session_token: supabaseSession().sessionToken })
  })
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

async function pushCloudState(silent = false) {
  if (!hasSupabaseConfig()) return false
  clearTimeout(cloudSyncTimer)
  try {
    if (!silent) setCloudSyncStatus("syncing")
    const config = supabaseConfig()
    const now = new Date().toISOString()
    await supabaseFetch(config, supabaseRpcUrl(config, "qlct_upsert_session_state"), {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        session_token: supabaseSession().sessionToken,
        app_state: cloudPayload(),
        saved_at: now
      })
    })
    state.dataSafety = {
      ...emptyState.dataSafety,
      ...(state.dataSafety || {}),
      supabaseLastSyncedAt: now,
      supabaseCloudUpdatedAt: now,
      supabaseSyncStatus: "synced",
      supabaseSyncError: ""
    }
    saveState({ skipCloud: true })
    if (!silent) showToast("Đã đẩy dữ liệu lên Supabase")
    if (state.activeTab === "settings") render()
    return true
  } catch (error) {
    setCloudSyncStatus("error", friendlySupabaseError(error))
    if (!silent) showToast("Không sync được Supabase")
    return false
  }
}

async function pullCloudState(silent = false) {
  if (!hasSupabaseConfig()) return false
  clearTimeout(cloudSyncTimer)
  try {
    if (!silent) setCloudSyncStatus("syncing")
    const record = await fetchCloudRecord()
    if (!record?.state) {
      if (isSupabaseSignedIn()) {
        const currentDataSafety = { ...emptyState.dataSafety, ...(state.dataSafety || {}) }
        state = normalizeState({
          ...clone(emptyState),
          activeTab: "dashboard",
          selectedMonth: currentMonthKey(),
          profile: {
            name: accountDisplayName(),
            createdAt: new Date().toISOString()
          },
          dataSafety: currentDataSafety
        })
      }
      if (!silent) showToast("Cloud chưa có dữ liệu, đang tạo bản đầu")
      return pushCloudState(silent)
    }
    const currentConfig = supabaseConfig()
    const pulled = normalizeState(record.state)
    pulled.dataSafety = {
      ...emptyState.dataSafety,
      ...(pulled.dataSafety || {}),
      supabaseEnabled: true,
      supabaseUrl: currentConfig.url,
      supabaseAnonKey: currentConfig.anonKey,
      supabaseUserId: state.dataSafety?.supabaseUserId || "",
      supabaseUsername: state.dataSafety?.supabaseUsername || "",
      supabaseSessionToken: state.dataSafety?.supabaseSessionToken || "",
      supabaseLastSyncedAt: new Date().toISOString(),
      supabaseCloudUpdatedAt: record.updated_at || "",
      supabaseSyncStatus: "synced",
      supabaseSyncError: ""
    }
    suppressCloudSync = true
    state = pulled
    saveState({ skipCloud: true })
    render()
    suppressCloudSync = false
    if (!silent) showToast("Đã kéo dữ liệu từ Supabase")
    return true
  } catch (error) {
    suppressCloudSync = false
    setCloudSyncStatus("error", friendlySupabaseError(error))
    if (!silent) showToast("Không kéo được Supabase")
    return false
  }
}

async function initCloudSync() {
  cloudSyncBooted = true
  if (!hasSupabaseConfig()) return
  await pullCloudState(true)
}

function friendlySupabaseError(error) {
  const message = String(error?.message || error || "")
  if (message.includes("Failed to fetch")) return "Không kết nối được Supabase"
  if (message.includes("JWT")) return "Anon key không hợp lệ"
  if (message.includes("Could not find the function")) return "Chưa chạy SQL Supabase mới"
  if (message.includes("permission denied")) return "Supabase chưa cấp quyền RPC"
  if (message.length > 110) return `${message.slice(0, 107)}...`
  return message || "Lỗi Supabase"
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

function categoryById(id) {
  return PAYMENT_CATEGORIES.find(category => category.id === id) || null
}

function categoryForPayment(payment = {}) {
  const matched = categoryById(payment.categoryId)
  if (matched) {
    return {
      id: matched.id,
      icon: matched.icon,
      label: payment.customCategory || matched.label,
      tone: matched.tone,
      subcategory: payment.subcategory || ""
    }
  }

  const legacy = {
    house: "housing",
    laptop: "tech",
    card: "credit_card",
    bill: "housing",
    wifi: "housing",
    loan: "loan",
    other: "other_payable"
  }[payment.category]
  const fallback = categoryById(legacy) || categoryById("other_payable")
  return {
    id: fallback.id,
    icon: fallback.icon,
    label: fallback.label,
    tone: fallback.tone,
    subcategory: payment.subcategory || ""
  }
}

function categorySelectButton(payment = {}) {
  const category = categoryForPayment(payment)
  const subcategory = payment.subcategory || "Chọn danh mục"
  return `
    <button type="button" class="category-select" data-action="open-category-picker">
      <span class="category-select-icon ${category.tone}">${category.icon}</span>
      <span>
        <strong>${escapeHtml(subcategory)}</strong>
        <span>${escapeHtml(category.label)}</span>
      </span>
      <span class="time-field-caret">${iconSvg("chevronDown")}</span>
    </button>
    <input type="hidden" name="categoryId" value="${escapeHtml(category.id)}" />
    <input type="hidden" name="subcategory" value="${escapeHtml(payment.subcategory || "")}" />
    <input type="hidden" name="customCategory" value="${escapeHtml(payment.customCategory || "")}" />
    ${categoryPickerPanel()}
  `
}

function categoryPickerPanel() {
  return `
    <div class="category-picker-panel hidden">
      <input class="category-search" placeholder="Tìm hoặc tự nhập..." autocomplete="off" />
      <div class="category-picker-list">
        ${PAYMENT_CATEGORIES.map(category => `
          <div class="category-group" data-category-group>
            <div class="category-group-title">
              <span class="category-select-icon ${category.tone}">${category.icon}</span>
              <strong>${escapeHtml(category.label)}</strong>
            </div>
            <div class="category-options">
              ${category.items.map(item => `
                <button type="button" class="category-option" data-category-id="${category.id}" data-subcategory="${escapeHtml(item)}">
                  <span>${escapeHtml(item)}</span>
                  <small>${escapeHtml(category.label)}</small>
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `
}

function choiceField(name, id, value, options, compact = false) {
  return `
    <input type="hidden" name="${name}" id="${id}" value="${escapeHtml(value)}" />
    <div class="choice-grid ${compact ? "compact" : ""}" data-choice-name="${name}" data-choice-target="${id}">
      ${options.map(option => `
        <button type="button" class="choice-card ${option.value === value ? "selected" : ""}" data-choice-value="${option.value}">
          <span class="choice-icon ${option.tone || "neutral"}">${option.icon}</span>
          <span>
            <strong>${escapeHtml(option.label)}</strong>
            ${option.desc ? `<small>${escapeHtml(option.desc)}</small>` : ""}
          </span>
        </button>
      `).join("")}
    </div>
  `
}

function paymentTypeOptions() {
  return [
    { value: "ONCE", icon: "1x", label: "Một lần", desc: "Trả một lần rồi ẩn", tone: "blue" },
    { value: "MONTHLY", icon: "↻", label: "Định kỳ", desc: "Lặp theo tháng", tone: "green" },
    { value: "MONTHLY_DEBT", icon: "₫", label: "Khoản nợ", desc: "Theo dõi dư nợ", tone: "purple" },
    { value: "INSTALLMENT", icon: "%", label: "Trả góp", desc: "Giảm dần theo thanh toán", tone: "orange" }
  ]
}

function priorityOptions() {
  return [
    { value: "MUST_PAY", icon: "!", label: "Đúng hạn", desc: "Cần trả đúng kỳ", tone: "red" },
    { value: "SKIPPABLE", icon: "↷", label: "Có thể skip", desc: "Có thể dời lại", tone: "orange" }
  ]
}

function syncCategoryInputs(form, selection) {
  if (!form || !selection) return
  form.elements.categoryId.value = selection.categoryId
  form.elements.subcategory.value = selection.subcategory
  form.elements.customCategory.value = selection.customCategory || ""
  const nameInput = form.elements.name
  if (nameInput && !String(nameInput.value || "").trim()) nameInput.value = selection.subcategory
  const button = form.querySelector(".category-select")
  if (button) {
    const category = categoryById(selection.categoryId) || categoryById("custom")
    button.outerHTML = categorySelectButton({
      categoryId: selection.categoryId,
      subcategory: selection.subcategory,
      customCategory: selection.customCategory
    }).split("<input")[0]
    bindCategoryPicker(form)
  }
}

function bindCategoryPicker(form) {
  const panel = form?.querySelector(".category-picker-panel")
  const search = form?.querySelector(".category-search")
  form?.querySelector("[data-action='open-category-picker']")?.addEventListener("click", () => {
    panel?.classList.toggle("hidden")
    search?.focus()
  })
  form?.querySelectorAll(".category-option").forEach(button => {
    button.onclick = () => {
      const rawSubcategory = button.dataset.subcategory
      const typed = String(search?.value || "").trim()
      const useCustom = button.dataset.categoryId === "custom" && rawSubcategory === "Tạo danh mục mới..."
      syncCategoryInputs(form, {
        categoryId: button.dataset.categoryId,
        subcategory: useCustom && typed ? typed : rawSubcategory,
        customCategory: useCustom ? "Tùy chỉnh" : ""
      })
      panel?.classList.add("hidden")
    }
  })
  search?.addEventListener("input", () => {
    const keyword = search.value.trim().toLowerCase()
    form.querySelectorAll("[data-category-group]").forEach(group => {
      let visible = false
      group.querySelectorAll(".category-option").forEach(option => {
        const match = !keyword || option.textContent.toLowerCase().includes(keyword)
        option.classList.toggle("hidden", !match)
        visible = visible || match
      })
      group.classList.toggle("hidden", !visible)
    })
  })
}

function bindChoiceFields(form) {
  form?.querySelectorAll("[data-choice-target]").forEach(group => {
    const input = document.getElementById(group.dataset.choiceTarget)
    group.querySelectorAll("[data-choice-value]").forEach(button => {
      button.onclick = () => {
        input.value = button.dataset.choiceValue
        group.querySelectorAll(".choice-card").forEach(item => item.classList.toggle("selected", item === button))
        input.dispatchEvent(new Event("change"))
      }
    })
  })
}

function openCategoryPickerModal(formId) {
  const rows = PAYMENT_CATEGORIES.map(category => `
    <div class="category-group" data-category-group>
      <div class="category-group-title">
        <span class="category-select-icon ${category.tone}">${category.icon}</span>
        <strong>${escapeHtml(category.label)}</strong>
      </div>
      <div class="category-options">
        ${category.items.map(item => `
          <button type="button" class="category-option" data-category-id="${category.id}" data-category-label="${escapeHtml(category.label)}" data-subcategory="${escapeHtml(item)}">
            <span>${escapeHtml(item)}</span>
            <small>${escapeHtml(category.label)}</small>
          </button>
        `).join("")}
      </div>
    </div>
  `).join("")

  openModal(`
    <h2>Loại khoản chi / khoản phải trả</h2>
    <div class="form">
      <div class="field">
        <label>Tìm hoặc tự nhập</label>
        <input id="categorySearch" placeholder="Ví dụ: tiền điện, trả góp laptop..." autocomplete="off" />
      </div>
      <div class="category-picker-list">${rows}</div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Hủy</button>
        <button type="button" class="primary" data-action="use-custom-category">Dùng nội dung nhập</button>
      </div>
    </div>
  `)

  const sourceForm = document.getElementById(formId)
  const search = document.getElementById("categorySearch")
  const choose = selection => {
    closeModal()
    syncCategoryInputs(sourceForm, selection)
  }
  document.querySelectorAll(".category-option").forEach(button => {
    button.onclick = () => {
      const categoryId = button.dataset.categoryId
      const subcategory = button.dataset.subcategory
      const customCategory = categoryId === "custom" && subcategory === "Tạo danh mục mới..." ? "" : ""
      choose({ categoryId, subcategory, customCategory })
    }
  })
  document.querySelector("[data-action='use-custom-category']").onclick = () => {
    const value = String(search.value || "").trim()
    if (!value) {
      showToast("Nhập tên khoản hoặc chọn trong danh sách")
      return
    }
    choose({ categoryId: "custom", subcategory: value, customCategory: "Tùy chỉnh" })
  }
  search.addEventListener("input", () => {
    const keyword = search.value.trim().toLowerCase()
    document.querySelectorAll("[data-category-group]").forEach(group => {
      let visible = false
      group.querySelectorAll(".category-option").forEach(option => {
        const match = !keyword || option.textContent.toLowerCase().includes(keyword)
        option.classList.toggle("hidden", !match)
        visible = visible || match
      })
      group.classList.toggle("hidden", !visible)
    })
  })
  search.focus()
}

function legacyCategoryFor(categoryId) {
  return {
    housing: "house",
    food: "other",
    transport: "other",
    tech: "laptop",
    credit_card: "card",
    loan: "loan",
    installment: "laptop",
    banking: "bank",
    saving: "other",
    investment: "other",
    health: "other",
    insurance: "other",
    work: "other",
    education: "other",
    shopping: "other",
    entertainment: "other",
    subscription: "card",
    family: "other",
    social: "other",
    pet: "other",
    tax: "other",
    emergency: "other",
    other_payable: "other",
    custom: "other"
  }[categoryId] || "other"
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

function isFlexibleSkippable(payment) {
  return payment.priority === "SKIPPABLE" && !isDebtPayment(payment)
}

function skippablePaidMonth(payment) {
  const paidMonths = payment.paidMonths && typeof payment.paidMonths === "object" ? payment.paidMonths : {}
  const months = Object.keys(paidMonths).filter(month => paidMonths[month]).sort()
  if (months.length) return months[0]
  if (payment.paid) return monthKey(payment.paidAt || payment.updatedAt || payment.dueDate || payment.createdAt)
  return ""
}

function paymentOccurrenceMonths(payment) {
  const baseDate = eventDate(payment.dueDate || payment.createdAt)
  if (!baseDate) return []

  const startMonth = payment.recurrence === "MONTHLY"
    ? (payment.monthlyStartMonth || monthKey(baseDate))
    : monthKey(baseDate)
  const recurrence = payment.recurrence || "ONCE"
  if (isFlexibleSkippable(payment)) {
    const paidMonth = skippablePaidMonth(payment)
    const endMonthNumber = paidMonth
      ? Math.max(monthNumber(startMonth), monthNumber(paidMonth))
      : Math.max(monthNumber(currentMonthKey()), monthNumber(viewingMonth()))
    const count = Math.max(0, endMonthNumber - monthNumber(startMonth) + 1)
    return Array.from({ length: count }, (_, index) => addMonths(startMonth, index))
  }
  if (recurrence === "ONCE") return [startMonth]

  const paidMonths = Object.keys(payment.paidMonths || {})
  const debtLike = isDebtPayment(payment)
  const endMonthNumber = Math.max(
    monthNumber(currentMonthKey()),
    monthNumber(viewingMonth()),
    ...paidMonths.map(monthNumber),
    ...(payment.debtPayments || []).map(record => monthNumber(record.paymentPeriod))
  )

  if (debtLike) {
    const snapshot = DebtEngine.snapshot(payment)
    const estimatedEndMonthNumber = monthNumber(startMonth) + Math.max(0, snapshot.paidPeriods.size + snapshot.estimatedRemainingPayments - 1)
    const cappedEndMonthNumber = snapshot.paidOff
      ? monthNumber(lastDebtPaymentPeriod(payment) || startMonth)
      : Math.max(endMonthNumber, estimatedEndMonthNumber)
    const count = Math.max(0, cappedEndMonthNumber - monthNumber(startMonth) + 1)
    return Array.from({ length: count }, (_, index) => addMonths(startMonth, index))
  }

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
  const debtLike = isDebtPayment(payment)
  const flexibleSkippable = isFlexibleSkippable(payment)
  const startMonth = recurrence === "MONTHLY"
    ? (payment.monthlyStartMonth || monthKey(baseDate))
    : monthKey(baseDate)
  const offset = monthOffset(startMonth, key)
  if (flexibleSkippable) {
    const paidMonth = skippablePaidMonth(payment)
    if (offset < 0 || (paidMonth && monthNumber(key) > monthNumber(paidMonth))) return null
  } else if (recurrence === "ONCE" && startMonth !== key) return null
  if (recurrence === "MONTHLY") {
    const endMonth = payment.monthlyEndMonth || addMonths(startMonth, 11)
    if (offset < 0 || monthNumber(key) > monthNumber(endMonth)) return null
  }
  if (recurrence === "INSTALLMENT" && !debtLike) {
    const count = Math.max(1, Number(payment.installmentCount || 12))
    if (offset < 0 || offset >= count) return null
  }
  if (debtLike && offset < 0) return null

  const paidMonths = payment.paidMonths || {}
  const debtSnapshot = debtLike ? DebtEngine.snapshot(payment) : null
  const debtPaidThisPeriod = debtLike ? debtSnapshot.records.some(record => record.paymentPeriod === key) : false
  if (debtLike && debtSnapshot.paidOff && !debtPaidThisPeriod && monthNumber(key) > monthNumber(lastDebtPaymentPeriod(payment) || startMonth)) return null

  const paid = debtLike
    ? debtPaidThisPeriod
    : flexibleSkippable
    ? skippablePaidMonth(payment) === key
    : recurrence === "ONCE"
    ? Boolean(payment.paid || payment.status === "PAID")
    : Boolean(paidMonths[key])
  const paidInstallmentCount = debtLike
    ? debtSnapshot.paidPeriods.size
    : recurrence === "INSTALLMENT"
    ? Object.keys(paidMonths).filter(month => paidMonths[month] && monthOffset(startMonth, month) >= 0 && monthOffset(startMonth, month) < Number(payment.installmentCount || 12)).length
    : Number(payment.paidInstallmentCount || 0)
  const originalPrincipal = Number(payment.originalPrincipal || Number(payment.amount || 0) * Number(payment.installmentCount || 12))
  const periodPaidAmount = debtLike
    ? debtSnapshot.records
      .filter(record => record.paymentPeriod === key)
      .reduce((sum, record) => sum + moneyInt(record.principalPaid || record.actualPaidAmount), 0)
    : 0
  const displayAmount = debtLike ? (debtPaidThisPeriod ? periodPaidAmount : debtSnapshot.nextPaymentAmount) : Number(payment.amount || 0)

  return {
    ...payment,
    baseId: payment.id,
    occurrenceKey: key,
    dueDate: flexibleSkippable ? "" : recurrence === "ONCE" ? baseDate : dueDateInMonth(baseDate, key),
    amount: displayAmount,
    paid,
    status: debtLike && debtSnapshot.paidOff ? "PAID_OFF" : paid ? "PAID" : (payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"),
    paidInstallmentCount,
    remainingPrincipal: debtLike
      ? debtSnapshot.remainingPrincipal
      : recurrence === "INSTALLMENT"
      ? Math.max(0, originalPrincipal - paidInstallmentCount * Number(payment.amount || 0))
      : Number(payment.remainingPrincipal || 0)
  }
}

function lastDebtPaymentPeriod(payment) {
  const records = Array.isArray(payment.debtPayments) ? payment.debtPayments : []
  return records.map(record => record.paymentPeriod).filter(Boolean).sort().at(-1) || ""
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

function isDebtPayment(payment) {
  return payment?.paymentType === "MONTHLY_DEBT" || payment?.paymentType === "INSTALLMENT" || payment?.recurrence === "INSTALLMENT"
}

function paymentTypeLabel(payment) {
  if (payment.paymentType === "MONTHLY_DEBT") return "Khoản nợ trả hàng tháng"
  if (payment.paymentType === "INSTALLMENT" || payment.recurrence === "INSTALLMENT") return "Trả góp"
  if (payment.recurrence === "MONTHLY") return "Định kỳ thông thường"
  return "Một lần"
}

function alertablePaymentsForViewingMonth() {
  const today = new Date().toISOString().slice(0, 10)
  return sortPayments(paymentsForViewingMonth().filter(payment => {
    if (payment.priority === "SKIPPABLE") return false
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
  if (payment.status === "PAID_OFF") return 0
  if (payment.paid || payment.status === "PAID") return 0
  return Number(payment.amount || 0)
}

function paidAmountForViewingMonth(payment) {
  if (isDebtPayment(payment)) {
    return (payment.debtPayments || [])
      .filter(record => record.paymentPeriod === viewingMonth())
      .reduce((sum, record) => sum + moneyInt(record.principalPaid || record.actualPaidAmount), 0)
  }
  return payment.paid ? Number(payment.amount || 0) : 0
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
  const paidMandatory = monthPayments
    .filter(payment => payment.priority === "MUST_PAY")
    .reduce((sum, payment) => sum + paidAmountForViewingMonth(payment), 0)
  const paidSkippable = monthPayments
    .filter(payment => payment.priority === "SKIPPABLE")
    .reduce((sum, payment) => sum + paidAmountForViewingMonth(payment), 0)
  const paidThisMonth = paidMandatory + paidSkippable
  const availableAfterMandatory = monthlyIncome - paidMandatory - remainingMandatory
  const availableAfterBills = monthlyIncome - paidThisMonth - remainingMandatory - remainingSkippable
  const debtSummary = debtPortfolioSummary()
  const totalOutstandingDebt = debtSummary.remaining

  return {
    monthlyIncome,
    monthSalary,
    mandatoryDue,
    skippableDue,
    paidMandatory,
    paidSkippable,
    paidThisMonth,
    remainingMandatory,
    remainingSkippable,
    availableAfterMandatory,
    targetSavings: Math.max(0, availableAfterBills),
    availableAfterSavings: availableAfterBills,
    totalOutstandingDebt,
    debtSummary
  }
}

function debtPayments() {
  return state.payments.filter(isDebtPayment)
}

function debtPortfolioSummary() {
  const debts = debtPayments()
  const original = debts.reduce((sum, payment) => sum + moneyInt(payment.originalPrincipal), 0)
  const paid = debts.reduce((sum, payment) => sum + DebtEngine.calculateTotalPaid(payment), 0)
  const remaining = debts.reduce((sum, payment) => sum + DebtEngine.calculateRemainingPrincipal(payment), 0)
  return {
    debts,
    original,
    paid,
    remaining,
    progress: original ? Math.min(100, paid / original * 100) : 0,
    dueThisMonth: paymentsForViewingMonth()
      .filter(payment => isDebtPayment(payment) && !payment.paid && payment.status !== "PAID_OFF")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
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
    if (state.paymentFilter === "installment") return isDebtPayment(payment)
    if (state.paymentFilter === "once") return payment.recurrence === "ONCE"
    if (state.paymentFilter === "paid") return payment.paid || payment.status === "PAID" || payment.status === "PAID_OFF"
    return true
  })
  return sortPayments(filtered)
}

function checklistPayments() {
  if (!isViewingCurrentMonth()) return sortPayments(paymentsForViewingMonth())

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
    if (payment.priority === "SKIPPABLE") return true
    const due = new Date(payment.dueDate || payment.createdAt || new Date())
    return due >= start && due < end
  }))
}

function iconSvg(name) {
  const paths = {
    bank: '<path d="M3 10h18L12 4 3 10Z"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M4 18h16M3 21h18"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    bolt: '<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>',
    calendar: '<path d="M8 2v4M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="m8 15 3-4 3 2 4-7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M9 10.2c0-1.2 1.2-2.2 3-2.2s3 1 3 2.2c0 2.8-6 1.4-6 4.2 0 1.3 1.2 2.3 3 2.3s3-1 3-2.3"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    house: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l2 2M14 9l2 2"/>',
    laptop: '<path d="M5 5h14v10H5z"/><path d="M3 19h18"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    piggy: '<path d="M5 12c0-3 3-5 7-5 3 0 5 1 6 3h2v5h-2c-.5 1-1.3 1.8-2.4 2.3L16 21h-3l-.5-2H9.8L9 21H6l.7-3.2A6.2 6.2 0 0 1 5 12Z"/><path d="M8 8 6 5M15 10h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    refresh: '<path d="M20 12a8 8 0 0 1-14 5"/><path d="M4 17h5v-5"/><path d="M4 12a8 8 0 0 1 14-5"/><path d="M20 7h-5v5"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6 1.8 1.8 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.8 1.8 0 0 0 8.6 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.09A1.8 1.8 0 0 0 4.6 8.6a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.09A1.8 1.8 0 0 0 15.4 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9c.3.4.8.7 1.6.8H21a2 2 0 1 1 0 4h-.09A1.8 1.8 0 0 0 19.4 15Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    wallet: '<path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13"/><path d="M16 13h5"/><path d="M18 13h.01"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>'
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.info}</svg>`
}

function categoryIcon(paymentOrCategory) {
  if (paymentOrCategory && typeof paymentOrCategory === "object") {
    const category = categoryForPayment(paymentOrCategory)
    return `<span class="category-emoji">${category.icon}</span>`
  }
  return {
    house: iconSvg("house"),
    laptop: iconSvg("laptop"),
    card: iconSvg("card"),
    bill: iconSvg("bolt"),
    wifi: iconSvg("wifi"),
    loan: iconSvg("bank"),
    bank: iconSvg("bank"),
    other: iconSvg("receipt")
  }[paymentOrCategory] || iconSvg("receipt")
}

function categoryTone(paymentOrCategory) {
  if (paymentOrCategory && typeof paymentOrCategory === "object") return categoryForPayment(paymentOrCategory).tone
  return {
    house: "green",
    laptop: "blue",
    card: "purple",
    bill: "orange",
    wifi: "orange",
    loan: "green",
    bank: "green",
    other: "neutral"
  }[paymentOrCategory] || "neutral"
}

function statusHtml(payment) {
  if (payment.status === "PAID_OFF") return `<span class="status paid">Đã tất toán</span>`
  if (payment.paid || payment.status === "PAID") return `<span class="status paid">Đã trả</span>`
  if (payment.priority === "SKIPPABLE") return `<span class="status skip">Có thể skip</span>`
  return `<span class="status must">Phải trả đúng hạn</span>`
}

function scrollScreenToTop() {
  const screen = document.querySelector(".screen")
  if (!screen) return
  screen.scrollTop = 0
  requestAnimationFrame(() => {
    screen.scrollTop = 0
  })
}

function render(options = {}) {
  saveState()
  const needsAuth = !isSupabaseSignedIn()
  const isOnboarding = !needsAuth && !state.profile?.name
  document.body.classList.toggle("is-auth", needsAuth)
  document.body.classList.toggle("is-onboarding", isOnboarding)
  renderTabIcons()
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === state.activeTab)
  })

  if (needsAuth) {
    document.getElementById("app").innerHTML = renderAuthScreen()
    bindAuthActions()
    if (options.resetScroll) scrollScreenToTop()
    return
  }

  if (isOnboarding) {
    document.getElementById("app").innerHTML = renderOnboarding()
    bindOnboardingActions()
    if (options.resetScroll) scrollScreenToTop()
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
  if (options.resetScroll) scrollScreenToTop()
}

function renderAuthScreen() {
  return `
    <section class="auth-screen">
      <div>
        <p class="eyebrow">QLCT</p>
        <h1 class="title">Đăng nhập</h1>
        <p class="subtitle">Dữ liệu khoản phải trả, lương và checklist sẽ đi theo username của bạn.</p>
      </div>
      <form id="authForm" class="card auth-card">
        <div class="field">
          <label>Username</label>
          <input name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Ví dụ: khanh" required />
        </div>
        <div class="field">
          <label>Mật khẩu</label>
          <input name="password" type="password" autocomplete="current-password" placeholder="Tối thiểu 6 ký tự" required />
        </div>
        <button class="primary" data-auth-submit="login">Đăng nhập</button>
        <button type="button" class="ghost" data-action="signup-auth">Tạo tài khoản mới</button>
      </form>
      <div class="auth-note">
        <strong>App trắng sau đăng ký</strong>
        <span>Sau khi đăng nhập, app tự tạo dữ liệu cloud riêng cho username nếu chưa có dữ liệu trước đó.</span>
      </div>
    </section>
  `
}

function bindAuthActions() {
  const form = document.getElementById("authForm")
  if (!form) return
  const values = () => ({
    username: normalizeUsername(form.elements.username.value),
    password: String(form.elements.password.value || "")
  })
  const submitAuth = async mode => {
    const { username, password } = values()
    if (username.length < 3 || password.length < 6) {
      showToast("Username từ 3 ký tự, mật khẩu từ 6 ký tự")
      return
    }
    try {
      if (mode === "signup") {
        const data = await signUpSupabase(username, password)
        if (!data?.session_token) {
          showToast("Không tạo được phiên đăng nhập")
          return
        }
      } else {
        await signInSupabase(username, password)
      }
      await pullCloudState(false)
      showToast(mode === "signup" ? "Đã tạo tài khoản" : "Đã đăng nhập")
      render()
    } catch (error) {
      setCloudSyncStatus("error", friendlySupabaseError(error))
      showToast(mode === "signup" ? "Không đăng ký được" : "Không đăng nhập được")
    }
  }
  form.onsubmit = event => {
    event.preventDefault()
    submitAuth("login")
  }
  form.querySelector("[data-action='signup-auth']").onclick = () => submitAuth("signup")
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
        <span class="month-current-icon">${iconSvg("calendar")}</span>
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

    ${f.debtSummary.debts.length ? `
      <section class="section">
        ${debtOverviewCard(f.debtSummary)}
      </section>
    ` : ""}

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

function debtOverviewCard(summary = debtPortfolioSummary()) {
  const progress = summary.progress.toFixed(1).replace(".", ",")
  return `
    <button type="button" class="debt-overview-card card" data-action="open-debt-overview">
      <div class="debt-card-head">
        <div class="list-icon purple">${iconSvg("chart")}</div>
        <div>
          <strong>Nợ hiện tại</strong>
          <div class="row-sub">Đã trả ${progress}% tổng dư nợ ban đầu</div>
        </div>
      </div>
      <div class="debt-card-grid">
        <div><span>Tổng dư nợ</span><strong>${money(summary.remaining)}</strong></div>
        <div><span>Đã trả</span><strong class="green">${money(summary.paid)}</strong></div>
        <div><span>Kỳ tháng này</span><strong>${money(summary.dueThisMonth)}</strong></div>
      </div>
      <div class="bar debt-bar"><span style="width:${Math.min(100, summary.progress)}%"></span></div>
    </button>
  `
}

function openDebtOverviewModal() {
  const summary = debtPortfolioSummary()
  openModal(`
    <h2>Kế hoạch trả nợ</h2>
    <div class="form">
      ${debtOverviewCard(summary)}
      <section class="section">
        <div class="section-head"><h2>Tiến độ từng khoản</h2></div>
        ${summary.debts.length ? `<div class="card list">${summary.debts.map(debtProgressRow).join("")}</div>` : `<div class="card empty-card"><div class="list-icon purple">${iconSvg("info")}</div><div><strong>Chưa có khoản nợ</strong><div class="desc">Tạo khoản nợ trả hàng tháng hoặc trả góp để theo dõi dư nợ giảm dần.</div></div></div>`}
      </section>
      <button type="button" class="primary" data-close>Đóng</button>
    </div>
  `)
  document.querySelectorAll("[data-debt-id]").forEach(button => {
    button.onclick = () => openDebtDetailModal(button.dataset.debtId)
  })
}

function debtProgressRow(payment) {
  const snapshot = DebtEngine.snapshot(payment)
  const progress = snapshot.progress.toFixed(1).replace(".", ",")
  return `
    <button type="button" class="debt-progress-row" data-debt-id="${payment.id}">
      <div class="list-icon ${categoryTone(payment)}">${categoryIcon(payment)}</div>
      <div class="row-main">
        <div class="row-line row-line-top">
          <strong class="row-title">${escapeHtml(payment.name)}</strong>
          <strong class="row-amount">${progress}%</strong>
        </div>
        <div class="bar debt-bar"><span style="width:${Math.min(100, snapshot.progress)}%"></span></div>
        <div class="row-sub">Đã trả ${money(snapshot.totalPaid)} / ${money(payment.originalPrincipal)}</div>
      </div>
    </button>
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
  const debt = isDebtPayment(payment)
  const debtSnapshot = debt ? DebtEngine.snapshot(payment) : null
  const dateText = payment.priority === "SKIPPABLE" ? "Linh hoạt, có thể dời" : `Hạn ${formatDate(payment.dueDate)}`
  const meta = debt
    ? `Đã trả ${debtSnapshot.progress.toFixed(1).replace(".", ",")}% · còn ${money(debtSnapshot.remainingPrincipal)}`
    : payment.recurrence === "INSTALLMENT"
    ? `Kỳ ${payment.paidInstallmentCount || 0}/${payment.installmentCount || 0}`
    : payment.recurrence === "ONCE" ? "Một lần" : monthLabel(monthKey(payment.dueDate))

  return `
    <div class="row-item" data-payment-id="${payment.id}">
      <div class="list-icon ${categoryTone(payment)}">${categoryIcon(payment)}</div>
      <div class="row-main">
        <div class="row-line row-line-top">
          <div class="row-title">${safeText(payment.name)}</div>
          <div class="row-amount">${money(payment.amount)}</div>
        </div>
        <div class="row-line row-line-bottom">
          <div class="row-date ${payment.priority === "SKIPPABLE" ? "orange" : ""}">${dateText}</div>
          <div class="row-sub">${meta}</div>
        </div>
        ${statusHtml(payment)}
      </div>
      <div class="chevron">${iconSvg("chevronRight")}</div>
    </div>
  `
}

function checklistRow(payment) {
  const debt = isDebtPayment(payment)
  const debtSnapshot = debt ? DebtEngine.snapshot(payment) : null
  const dateText = payment.priority === "SKIPPABLE" ? "Linh hoạt, có thể dời" : `Hạn ${formatDate(payment.dueDate)}`
  const meta = debt
    ? `${payment.paid ? "Đã ghi nhận" : `Còn nợ ${money(debtSnapshot.remainingPrincipal)}`}`
    : payment.recurrence === "INSTALLMENT"
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
          <div class="row-date ${payment.priority === "SKIPPABLE" ? "orange" : ""}">${dateText}</div>
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
  const currentMonth = isViewingCurrentMonth()
  return `
    ${header("Checklist thanh toán", `Quản lý các khoản phải trả đúng hạn, ${userName()}`)}
    ${monthSelector()}
    ${currentMonth ? `<div class="segmented section">
      <button class="segment ${state.checklistFilter === "today" ? "active" : ""}" data-filter="today">Hôm nay</button>
      <button class="segment ${state.checklistFilter === "week" ? "active" : ""}" data-filter="week">Tuần này</button>
      <button class="segment ${state.checklistFilter === "month" ? "active" : ""}" data-filter="month">Tháng này</button>
    </div>` : `<div class="section month-scope-note">Tất cả khoản cần trả trong ${monthLabel(viewingMonth())}</div>`}
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
    ${f.debtSummary.debts.length ? `
      <section class="section">
        <div class="section-head">
          <h2>Tiến độ trả nợ</h2>
          <button class="link icon-link" data-action="open-debt-overview"><span>Chi tiết</span>${iconSvg("chevronRight")}</button>
        </div>
        <div class="card debt-analytics">
          <div class="debt-card-grid">
            <div><span>Tổng nợ ban đầu</span><strong>${money(f.debtSummary.original)}</strong></div>
            <div><span>Tổng đã trả</span><strong class="green">${money(f.debtSummary.paid)}</strong></div>
            <div><span>Tổng dư nợ</span><strong>${money(f.debtSummary.remaining)}</strong></div>
          </div>
          <div class="bar debt-bar"><span style="width:${Math.min(100, f.debtSummary.progress)}%"></span></div>
          <div class="row-sub">Tiến độ tổng ${f.debtSummary.progress.toFixed(1).replace(".", ",")}%</div>
          <div class="list debt-progress-list">${f.debtSummary.debts.map(debtProgressRow).join("")}</div>
        </div>
      </section>
    ` : ""}
    <section class="section">
      <div class="section-head">
        <h2>Lịch sử theo tháng</h2>
        <span class="muted">${safeText(accountSettingsText())}</span>
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
        <span class="muted">Cloud sync</span>
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
  const synced = state.dataSafety?.supabaseLastSyncedAt ? `Sync ${formatDate(eventDate(state.dataSafety.supabaseLastSyncedAt))}` : "Chưa sync"
  return `${persistent} · ${synced}`
}

function renderSettings() {
  return `
    ${header("Cài đặt", "Dữ liệu và import")}
    <section class="section card">
      ${settingsRow(iconSvg("user"), "Tài khoản", accountSettingsText(), `<button class="link" data-action="open-account">Mở</button>`)}
      ${settingsRow(iconSvg("shield"), "Bảo vệ dữ liệu", dataSafetyText(), `<button class="link" data-action="protect-storage">Bật</button>`)}
      ${settingsRow(iconSvg("user"), "Hồ sơ", `${userName()} · App cá nhân`, `<button class="link" data-action="edit-profile">Sửa</button>`)}
      ${settingsRow(iconSvg("wallet"), "Nhập lương", "Nhập tay hoặc paste tin nhắn ngân hàng", `<button class="link" data-action="open-import">Mở</button>`)}
      ${settingsRow(iconSvg("bank"), "Danh mục ngân hàng", "Danh sách ngân hàng để chọn khi nhận diện lương", `<button class="link" data-action="open-bank-directory">Mở</button>`)}
      ${settingsRow(iconSvg("refresh"), "Load sample data", "Chỉ dùng để xem mockup/demo", `<button class="link" data-action="load-sample">Load</button>`)}
      ${settingsRow(iconSvg("trash"), "Đưa app về trắng", "Xóa dữ liệu trên máy này và chạy lại onboarding", `<button class="link red" data-action="reset-empty">Reset</button>`)}
    </section>
    <section class="section info-card card" style="grid-template-columns:54px 1fr">
      <div class="list-icon blue">${iconSvg("info")}</div>
      <div>
        <strong>Dữ liệu đi theo tài khoản</strong>
        <div class="desc">App lưu nhanh trên máy và tự đồng bộ lên Supabase theo tài khoản đang đăng nhập.</div>
      </div>
    </section>
  `
}

function accountSettingsText() {
  const username = accountDisplayName()
  if (state.dataSafety?.supabaseSyncStatus === "error") return `Lỗi sync: ${state.dataSafety.supabaseSyncError || "Không đồng bộ được"}`
  if (state.dataSafety?.supabaseSyncStatus === "syncing") return `${username || "Tài khoản"} · đang đồng bộ`
  if (state.dataSafety?.supabaseLastSyncedAt) return `${username || "Tài khoản"} · sync ${formatDate(eventDate(state.dataSafety.supabaseLastSyncedAt))}`
  return username || "Đã đăng nhập"
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

function openAccountModal() {
  const session = supabaseSession()
  openModal(`
    <h2>Tài khoản</h2>
    <div class="form">
      <div class="sync-state-card ${state.dataSafety?.supabaseSyncStatus === "error" ? "error" : ""}">
        <div class="list-icon green">${iconSvg("user")}</div>
        <div>
          <strong>${escapeHtml(session.username || accountDisplayName())}</strong>
          <div class="desc">${escapeHtml(accountSettingsText())}</div>
        </div>
      </div>
      ${state.dataSafety?.supabaseSyncError ? `<div class="bank-line error-line">${escapeHtml(state.dataSafety.supabaseSyncError)}</div>` : ""}
      <div class="form-actions stack-actions">
        <button type="button" class="primary" data-action="sync-account-now">Đồng bộ ngay</button>
        <button type="button" class="ghost red" data-action="logout-supabase">Đăng xuất</button>
        <button type="button" class="ghost" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelector("[data-action='sync-account-now']").onclick = async () => {
    await pushCloudState(false)
  }

  document.querySelector("[data-action='logout-supabase']").onclick = async () => {
    await signOutSupabase()
    showToast("Đã đăng xuất Supabase")
    closeModal()
    render()
  }
}

function bindScreenActions() {
  document.querySelectorAll("[data-tab-go]").forEach(button => {
    button.onclick = () => {
      state.activeTab = button.dataset.tabGo
      render({ resetScroll: true })
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

  document.querySelectorAll("[data-action='open-account']").forEach(button => {
    button.onclick = openAccountModal
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

  document.querySelectorAll("[data-action='open-debt-overview']").forEach(button => {
    button.onclick = openDebtOverviewModal
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
        <div class="time-field">
          <span class="time-field-icon">${iconSvg("calendar")}</span>
          <input name="month" type="month" value="${viewingMonth()}" required />
          <span class="time-field-caret">${iconSvg("chevronDown")}</span>
        </div>
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
  if (isDebtPayment(basePayment)) {
    openDebtDetailModal(basePayment.id)
    return
  }
  const payment = materializePaymentForMonth(basePayment, viewingMonth()) || basePayment
  const dateDetail = payment.priority === "SKIPPABLE"
    ? `<div class="detail-box"><span>Thời hạn</span><strong>Linh hoạt</strong></div>`
    : `<div class="detail-box"><span>Ngày đến hạn</span><strong>${formatDate(payment.dueDate)}</strong></div>`

  openModal(`
    <h2>${escapeHtml(payment.name)}</h2>
    <div class="form">
      <div class="detail-grid">
        <div class="detail-box"><span>Số tiền</span><strong>${money(payment.amount)}</strong></div>
        ${dateDetail}
        <div class="detail-box"><span>Loại</span><strong>${paymentTypeLabel(payment)}</strong></div>
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

function openDebtDetailModal(id) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return
  const snapshot = DebtEngine.snapshot(payment)
  const progress = snapshot.progress.toFixed(1).replace(".", ",")
  const nextDue = dueDateInMonth(payment.dueDate || dateForViewingMonth(), viewingMonth())
  const records = [...snapshot.records].sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)))

  openModal(`
    <h2>${escapeHtml(payment.name)}</h2>
    <div class="form">
      <section class="debt-detail-hero">
        <div class="debt-ring" style="--value:${snapshot.progress}%">
          <div><strong>${progress}%</strong><span>đã trả</span></div>
        </div>
        <div>
          <div class="row-sub">${escapeHtml(paymentTypeLabel(payment))}</div>
          <strong>${escapeHtml(payment.subcategory || categoryForPayment(payment).label)}</strong>
          <div class="bar debt-bar"><span style="width:${Math.min(100, snapshot.progress)}%"></span></div>
        </div>
      </section>
      <div class="detail-grid">
        <div class="detail-box"><span>Tổng nợ ban đầu</span><strong>${money(payment.originalPrincipal)}</strong></div>
        <div class="detail-box"><span>Đã trả</span><strong class="green">${money(snapshot.totalPaid)}</strong></div>
        <div class="detail-box"><span>Còn lại</span><strong>${money(snapshot.remainingPrincipal)}</strong></div>
        <div class="detail-box"><span>Dự kiến còn</span><strong>${snapshot.estimatedRemainingPayments} kỳ</strong></div>
      </div>
      <div class="debt-next-box">
        <div>
          <span>Kỳ tiếp theo</span>
          <strong>${snapshot.paidOff ? "Đã tất toán" : formatDate(nextDue)}</strong>
        </div>
        <div>
          <span>Số tiền kỳ này</span>
          <strong>${money(snapshot.nextPaymentAmount)}</strong>
        </div>
      </div>
      ${payment.notes ? `<div class="bank-line">${escapeHtml(payment.notes)}</div>` : ""}
      <section class="section">
        <div class="section-head">
          <h2>Lịch sử thanh toán</h2>
          <button type="button" class="link" data-action="debt-extra-payment">Trả thêm</button>
        </div>
        ${records.length ? `<div class="card list">${records.map(debtPaymentRecordRow).join("")}</div>` : `<div class="card empty-card"><div class="list-icon purple">${iconSvg("info")}</div><div><strong>Chưa có thanh toán</strong><div class="desc">Khi xác nhận đã trả, lịch sử sẽ xuất hiện ở đây.</div></div></div>`}
      </section>
      <div class="form-actions stack-actions">
        <button type="button" class="primary" data-action="debt-record-payment" ${snapshot.paidOff ? "disabled" : ""}>Ghi nhận thanh toán</button>
        <button type="button" class="ghost" data-action="debt-edit-payment">Chỉnh sửa</button>
        <button type="button" class="ghost red" data-action="detail-delete-payment">Xóa khoản</button>
        <button type="button" class="ghost" data-close>Đóng</button>
      </div>
    </div>
  `)

  document.querySelector("[data-action='debt-record-payment']")?.addEventListener("click", () => openDebtPaymentModal(id, viewingMonth()))
  document.querySelector("[data-action='debt-extra-payment']")?.addEventListener("click", () => openDebtPaymentModal(id, viewingMonth(), true))
  document.querySelector("[data-action='debt-edit-payment']").onclick = () => openEditPaymentModal(id)
  document.querySelector("[data-action='detail-delete-payment']").onclick = () => deletePayment(id)
  document.querySelectorAll("[data-action='undo-debt-record']").forEach(button => {
    button.onclick = () => undoDebtPaymentRecord(id, button.dataset.recordId)
  })
}

function debtPaymentRecordRow(record) {
  return `
    <div class="timeline-row">
      <div class="list-icon green">${iconSvg("check")}</div>
      <div class="row-main">
        <div class="row-line row-line-top">
          <strong class="row-title">${monthLabel(record.paymentPeriod)}</strong>
          <strong class="green row-amount">${money(record.principalPaid)}</strong>
        </div>
        <div class="row-line row-line-bottom">
          <div class="row-date">Trả ${formatDate(eventDate(record.paidAt) || record.dueDate)}</div>
          <button type="button" class="link compact-link" data-action="undo-debt-record" data-record-id="${record.id}">Undo</button>
        </div>
      </div>
    </div>
  `
}

function openEditPaymentModal(id) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return

  openModal(`
    <h2>Sửa khoản phải trả</h2>
    <form id="editPaymentForm" class="form">
      <div class="field">
        <label>Loại khoản chi / khoản phải trả</label>
        ${categorySelectButton(payment)}
      </div>
      <div class="field">
        <label>Tên khoản</label>
        <input name="name" value="${escapeHtml(payment.name)}" required />
      </div>
      <div class="field normal-amount-field">
        <label>Số tiền</label>
        <input name="amount" inputmode="numeric" value="${formatNumberInput(payment.amount)}" required />
      </div>
      <div class="field" id="editPaymentDueDateField">
        <label>Ngày đến hạn</label>
        <div class="time-field">
          <span class="time-field-icon">${iconSvg("calendar")}</span>
          <input name="dueDate" type="date" value="${payment.dueDate || ""}" />
          <span class="time-field-caret">${iconSvg("chevronDown")}</span>
        </div>
      </div>
      <div class="dual-field monthly-range ${payment.recurrence === "MONTHLY" ? "" : "hidden"}" id="editPaymentMonthlyRange">
        <div class="field">
          <label>Tháng bắt đầu</label>
          <div class="time-field compact">
            <span class="time-field-icon">${iconSvg("calendar")}</span>
            <input name="monthlyStartMonth" type="month" value="${payment.monthlyStartMonth || monthKey(payment.dueDate || payment.createdAt) || viewingMonth()}" />
            <span class="time-field-caret">${iconSvg("chevronDown")}</span>
          </div>
        </div>
        <div class="field">
          <label>Tháng kết thúc</label>
          <div class="time-field compact">
            <span class="time-field-icon">${iconSvg("calendar")}</span>
            <input name="monthlyEndMonth" type="month" value="${payment.monthlyEndMonth || addMonths(payment.monthlyStartMonth || monthKey(payment.dueDate || payment.createdAt) || viewingMonth(), 11)}" />
            <span class="time-field-caret">${iconSvg("chevronDown")}</span>
          </div>
        </div>
      </div>
      <div class="field">
        <label>Loại thanh toán</label>
        ${choiceField(
          "recurrence",
          "editPaymentRecurrence",
          payment.paymentType === "MONTHLY_DEBT" ? "MONTHLY_DEBT" : payment.paymentType === "INSTALLMENT" || payment.recurrence === "INSTALLMENT" ? "INSTALLMENT" : payment.recurrence === "MONTHLY" ? "MONTHLY" : "ONCE",
          paymentTypeOptions()
        )}
      </div>
      <section class="debt-form-section ${isDebtPayment(payment) ? "" : "hidden"}" id="editPaymentDebtSection">
        <div class="section-head compact-head"><h2>Thông tin khoản nợ</h2></div>
        <div class="field">
          <label>Tổng nợ ban đầu</label>
          <input name="originalPrincipal" inputmode="numeric" value="${formatNumberInput(payment.originalPrincipal)}" />
        </div>
        <div class="field">
          <label>Số tiền đã trả trước đó</label>
          <input name="initialPaidAmount" inputmode="numeric" value="${formatNumberInput(payment.initialPaidAmount)}" />
        </div>
        <div class="field">
          <label>Số tiền phải trả mỗi tháng</label>
          <input name="monthlyPayment" inputmode="numeric" value="${formatNumberInput(payment.monthlyPayment || payment.amount)}" />
        </div>
        <div class="field">
          <label>Ghi chú</label>
          <input name="notes" value="${escapeHtml(payment.notes || "")}" />
        </div>
        <div class="bank-line" id="editPaymentDebtEstimate">Dư nợ hiện tại: ${money(DebtEngine.calculateRemainingPrincipal(payment))}</div>
      </section>
      <div class="field ${isDebtPayment(payment) ? "" : "hidden"}" id="editPaymentInstallmentField">
        <label>Số kỳ dự kiến</label>
        <input name="installmentCount" inputmode="numeric" value="${payment.installmentCount || 12}" readonly />
      </div>
      <div class="field">
        <label>Trạng thái khoản</label>
        ${choiceField("priority", "editPaymentPriority", payment.priority || "MUST_PAY", priorityOptions(), true)}
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
    const recurrence = form.get("recurrence")
    const priority = form.get("priority")
    const debtLike = recurrence === "MONTHLY_DEBT" || recurrence === "INSTALLMENT"
    const skippable = priority === "SKIPPABLE" && !debtLike
    const name = String(form.get("name") || "").trim()
    const normalAmount = parseMoney(form.get("amount"))
    const originalPrincipal = parseMoney(form.get("originalPrincipal"))
    const initialPaidAmount = parseMoney(form.get("initialPaidAmount"))
    const monthlyPayment = parseMoney(form.get("monthlyPayment"))
    const amount = debtLike ? monthlyPayment : normalAmount
    if (!name) {
      showToast("Nhập tên khoản cần trả")
      return
    }
    if (!amount) {
      showToast("Nhập số tiền lớn hơn 0")
      return
    }
    if (debtLike && !originalPrincipal) {
      showToast("Nhập tổng nợ ban đầu")
      return
    }
    if (debtLike && initialPaidAmount > originalPrincipal) {
      showToast("Số tiền đã trả không được vượt tổng nợ")
      return
    }
    if (isDebtPayment(payment) && (payment.debtPayments || []).length && originalPrincipal !== moneyInt(payment.originalPrincipal)) {
      if (!confirm("Khoản nợ này đã có lịch sử thanh toán. Thay đổi tổng nợ ban đầu sẽ làm thay đổi số liệu thống kê.")) return
    }

    payment.name = name
    payment.amount = amount
    payment.monthlyPayment = debtLike ? monthlyPayment : 0
    payment.recurrence = recurrence === "MONTHLY_DEBT" ? "INSTALLMENT" : recurrence
    payment.paymentType = debtLike ? recurrence : (recurrence === "MONTHLY" ? "RECURRING" : "ONCE")
    const monthlyStartMonth = form.get("monthlyStartMonth") || monthKey(form.get("dueDate")) || viewingMonth()
    const monthlyEndMonth = form.get("monthlyEndMonth") || monthlyStartMonth
    if (recurrence === "MONTHLY" && monthNumber(monthlyEndMonth) < monthNumber(monthlyStartMonth)) {
      showToast("Tháng kết thúc phải sau tháng bắt đầu")
      return
    }
    payment.monthlyStartMonth = recurrence === "MONTHLY" ? monthlyStartMonth : ""
    payment.monthlyEndMonth = recurrence === "MONTHLY" ? monthlyEndMonth : ""
    payment.dueDate = skippable
      ? (form.get("dueDate") || dateForViewingMonth())
      : recurrence === "MONTHLY"
      ? dueDateInMonth(form.get("dueDate") || `${monthlyStartMonth}-01`, monthlyStartMonth)
      : (form.get("dueDate") || dateForViewingMonth())
    payment.priority = priority
    payment.category = legacyCategoryFor(form.get("categoryId"))
    payment.categoryId = form.get("categoryId")
    payment.subcategory = form.get("subcategory")
    payment.customCategory = form.get("customCategory")
    payment.notes = String(form.get("notes") || "").trim()
    payment.paidMonths = payment.paidMonths && typeof payment.paidMonths === "object" ? payment.paidMonths : {}
    if (debtLike) {
      payment.initialPaidAmount = initialPaidAmount
      payment.originalPrincipal = originalPrincipal
      payment.debtPayments = Array.isArray(payment.debtPayments) ? payment.debtPayments : []
      payment.installmentCount = Math.max(1, Math.ceil(originalPrincipal / monthlyPayment))
      applyDebtDerivedState(payment)
    } else {
      payment.installmentCount = 0
      payment.originalPrincipal = 0
      payment.initialPaidAmount = 0
      payment.remainingPrincipal = 0
      payment.debtPayments = []
      if (!payment.paid) payment.status = payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE"
    }
    closeModal()
    showToast("Đã lưu thay đổi")
    render()
  }
  const editForm = document.getElementById("editPaymentForm")
  bindCategoryPicker(editForm)
  bindChoiceFields(editForm)
  ;["amount", "originalPrincipal", "initialPaidAmount", "monthlyPayment"].forEach(name => bindMoneyInput(editForm.elements[name]))
  const recurrenceInput = document.getElementById("editPaymentRecurrence")
  const installmentField = document.getElementById("editPaymentInstallmentField")
  const monthlyRange = document.getElementById("editPaymentMonthlyRange")
  const debtSection = document.getElementById("editPaymentDebtSection")
  const normalAmountField = editForm.querySelector(".normal-amount-field")
  const dueDateField = document.getElementById("editPaymentDueDateField")
  const priorityInput = document.getElementById("editPaymentPriority")
  const estimate = document.getElementById("editPaymentDebtEstimate")
  const updateEditMode = () => {
    const debtLike = recurrenceInput.value === "MONTHLY_DEBT" || recurrenceInput.value === "INSTALLMENT"
    const skippable = priorityInput.value === "SKIPPABLE" && !debtLike
    installmentField.classList.toggle("hidden", !debtLike)
    debtSection.classList.toggle("hidden", !debtLike)
    normalAmountField.classList.toggle("hidden", debtLike)
    dueDateField.classList.toggle("hidden", skippable)
    editForm.elements.amount.required = !debtLike
    editForm.elements.originalPrincipal.required = debtLike
    editForm.elements.monthlyPayment.required = debtLike
    monthlyRange.classList.toggle("hidden", recurrenceInput.value !== "MONTHLY" || skippable)
    const original = parseMoney(editForm.elements.originalPrincipal.value)
    const monthly = parseMoney(editForm.elements.monthlyPayment.value)
    const paid = parseMoney(editForm.elements.initialPaidAmount.value) + (payment.debtPayments || []).reduce((sum, record) => sum + moneyInt(record.principalPaid || record.actualPaidAmount), 0)
    const count = original && monthly ? Math.ceil(Math.max(0, original - paid) / monthly) : 0
    if (debtLike && original && monthly) {
      editForm.elements.installmentCount.value = String(Math.max(1, Math.ceil(original / monthly)))
      estimate.textContent = `Dư nợ sau lịch sử hiện có: ${money(Math.max(0, original - paid))}. Dự kiến còn ${count} kỳ.`
    }
  }
  recurrenceInput.onchange = updateEditMode
  priorityInput.onchange = updateEditMode
  ;["originalPrincipal", "initialPaidAmount", "monthlyPayment"].forEach(name => editForm.elements[name].addEventListener("input", updateEditMode))
  updateEditMode()
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

  if (isDebtPayment(payment)) {
    const existing = (payment.debtPayments || []).find(record => record.paymentPeriod === key)
    if (existing) {
      undoDebtPaymentRecord(id, existing.id, true)
      return
    }
    openDebtPaymentModal(id, key)
    return
  }

  if (isFlexibleSkippable(payment)) {
    payment.paidMonths = payment.paidMonths && typeof payment.paidMonths === "object" ? payment.paidMonths : {}
    const nextPaid = !payment.paidMonths[key]
    payment.paidMonths = nextPaid ? { [key]: true } : {}
    payment.paid = nextPaid
    payment.paidAt = nextPaid ? new Date().toISOString() : ""
    payment.status = nextPaid ? "PAID" : "DEFERABLE"
  } else if (recurrence === "ONCE") {
    payment.paid = !payment.paid
    payment.paidAt = payment.paid ? new Date().toISOString() : ""
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

function openDebtPaymentModal(id, period = viewingMonth(), extra = false) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return
  const snapshot = DebtEngine.snapshot(payment)
  if (snapshot.paidOff) {
    showToast("Khoản nợ đã tất toán")
    return
  }
  const scheduledAmount = snapshot.nextPaymentAmount
  const dueDate = dueDateInMonth(payment.dueDate || dateForViewingMonth(), period)

  openModal(`
    <h2>${extra ? "Trả thêm" : "Xác nhận thanh toán"}</h2>
    <form id="debtPaymentForm" class="form">
      <div class="debt-next-box">
        <div>
          <span>Số tiền dự kiến</span>
          <strong>${money(scheduledAmount)}</strong>
        </div>
        <div>
          <span>Dư nợ còn lại</span>
          <strong>${money(snapshot.remainingPrincipal)}</strong>
        </div>
      </div>
      <div class="field">
        <label>Bạn thực tế đã trả bao nhiêu?</label>
        <input name="actualPaidAmount" inputmode="numeric" value="${formatNumberInput(scheduledAmount)}" required />
      </div>
      <div class="field">
        <label>Ghi chú</label>
        <input name="notes" placeholder="Ví dụ: trả thêm, trả thiếu, tất toán..." />
      </div>
      <div class="form-actions">
        <button type="button" class="ghost" data-close>Hủy</button>
        <button class="primary">Xác nhận đã trả</button>
      </div>
    </form>
  `)

  const amountInput = document.querySelector("#debtPaymentForm [name='actualPaidAmount']")
  bindMoneyInput(amountInput)
  document.getElementById("debtPaymentForm").onsubmit = event => {
    event.preventDefault()
    const form = new FormData(event.target)
    const requested = parseMoney(form.get("actualPaidAmount"))
    if (!requested) {
      showToast("Nhập số tiền đã trả")
      return
    }
    const principalPaid = Math.min(requested, snapshot.remainingPrincipal)
    if (requested > snapshot.remainingPrincipal) {
      showToast(`Dư nợ chỉ còn ${money(snapshot.remainingPrincipal)}`)
    }
    payment.debtPayments = Array.isArray(payment.debtPayments) ? payment.debtPayments : []
    payment.debtPayments.push({
      id: newId(),
      debtID: payment.id,
      scheduledAmount,
      actualPaidAmount: principalPaid,
      principalPaid,
      interestPaid: 0,
      feePaid: 0,
      paidAt: new Date().toISOString(),
      dueDate,
      paymentPeriod: period,
      notes: String(form.get("notes") || "").trim(),
      createdAt: new Date().toISOString()
    })
    applyDebtDerivedState(payment)
    closeModal()
    showToast(DebtEngine.isPaidOff(payment) ? "Đã tất toán khoản nợ" : "Đã ghi nhận thanh toán")
    render()
  }
}

function applyDebtDerivedState(payment) {
  const snapshot = DebtEngine.snapshot(payment)
  payment.remainingPrincipal = snapshot.remainingPrincipal
  payment.paidInstallmentCount = snapshot.paidPeriods.size
  payment.status = snapshot.paidOff ? "PAID_OFF" : (payment.priority === "SKIPPABLE" ? "DEFERABLE" : "DUE")
  payment.updatedAt = new Date().toISOString()
}

function undoDebtPaymentRecord(id, recordId, renderOnly = false) {
  const payment = state.payments.find(item => item.id === id)
  if (!payment) return
  payment.debtPayments = (payment.debtPayments || []).filter(record => record.id !== recordId)
  applyDebtDerivedState(payment)
  showToast("Đã undo thanh toán")
  if (renderOnly) {
    render()
  } else {
    saveState()
    openDebtDetailModal(id)
  }
}

function openPaymentModal() {
  const today = isViewingCurrentMonth() ? new Date().toISOString().slice(0, 10) : `${viewingMonth()}-01`
  openModal(`
    <h2>Thêm khoản phải trả</h2>
    <form id="paymentForm" class="form">
      <div class="field">
        <label>Loại khoản chi / khoản phải trả</label>
        ${categorySelectButton()}
      </div>
      <div class="field">
        <label>Tên khoản</label>
        <input name="name" placeholder="Ví dụ: Tiền nhà, Trả góp laptop" required />
      </div>
      <div class="field normal-amount-field">
        <label>Số tiền</label>
        <input name="amount" inputmode="numeric" placeholder="4,000,000" required />
      </div>
      <div class="field" id="paymentDueDateField">
        <label>Ngày đến hạn</label>
        <div class="time-field">
          <span class="time-field-icon">${iconSvg("calendar")}</span>
          <input name="dueDate" type="date" value="${today}" />
          <span class="time-field-caret">${iconSvg("chevronDown")}</span>
        </div>
      </div>
      <div class="dual-field monthly-range hidden" id="paymentMonthlyRange">
        <div class="field">
          <label>Tháng bắt đầu</label>
          <div class="time-field compact">
            <span class="time-field-icon">${iconSvg("calendar")}</span>
            <input name="monthlyStartMonth" type="month" value="${viewingMonth()}" />
            <span class="time-field-caret">${iconSvg("chevronDown")}</span>
          </div>
        </div>
        <div class="field">
          <label>Tháng kết thúc</label>
          <div class="time-field compact">
            <span class="time-field-icon">${iconSvg("calendar")}</span>
            <input name="monthlyEndMonth" type="month" value="${addMonths(viewingMonth(), 11)}" />
            <span class="time-field-caret">${iconSvg("chevronDown")}</span>
          </div>
        </div>
      </div>
      <div class="field">
        <label>Loại thanh toán</label>
        ${choiceField("recurrence", "paymentRecurrence", "ONCE", paymentTypeOptions())}
      </div>
      <section class="debt-form-section hidden" id="paymentDebtSection">
        <div class="section-head compact-head"><h2>Thông tin khoản nợ</h2></div>
        <div class="field">
          <label>Tổng nợ ban đầu</label>
          <input name="originalPrincipal" inputmode="numeric" placeholder="24,000,000" />
        </div>
        <div class="field">
          <label>Số tiền đã trả trước đó</label>
          <input name="initialPaidAmount" inputmode="numeric" placeholder="0" value="0" />
        </div>
        <div class="field">
          <label>Số tiền phải trả mỗi tháng</label>
          <input name="monthlyPayment" inputmode="numeric" placeholder="2,000,000" />
        </div>
        <div class="field">
          <label>Ghi chú</label>
          <input name="notes" placeholder="Optional" />
        </div>
        <div class="bank-line" id="paymentDebtEstimate">Nhập tổng nợ và số tiền hàng tháng để app tính số kỳ dự kiến.</div>
      </section>
      <div class="field hidden" id="paymentInstallmentField">
        <label>Số kỳ dự kiến</label>
        <input name="installmentCount" inputmode="numeric" placeholder="12" value="12" readonly />
      </div>
      <div class="field">
        <label>Trạng thái khoản</label>
        ${choiceField("priority", "paymentPriority", "MUST_PAY", priorityOptions(), true)}
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
    const priority = form.get("priority")
    const debtLike = recurrence === "MONTHLY_DEBT" || recurrence === "INSTALLMENT"
    const skippable = priority === "SKIPPABLE" && !debtLike
    const name = String(form.get("name") || "").trim()
    const normalAmount = parseMoney(form.get("amount"))
    const originalPrincipal = parseMoney(form.get("originalPrincipal"))
    const initialPaidAmount = parseMoney(form.get("initialPaidAmount"))
    const monthlyPayment = parseMoney(form.get("monthlyPayment"))
    const amount = debtLike ? monthlyPayment : normalAmount
    const installmentCount = debtLike && monthlyPayment ? Math.max(1, Math.ceil(originalPrincipal / monthlyPayment)) : 0
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
    if (debtLike && !originalPrincipal) {
      showToast("Nhập tổng nợ ban đầu")
      return
    }
    if (debtLike && initialPaidAmount > originalPrincipal) {
      showToast("Số tiền đã trả không được vượt tổng nợ")
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
      monthlyPayment: debtLike ? monthlyPayment : 0,
      initialPaidAmount: debtLike ? initialPaidAmount : 0,
      dueDate: skippable
        ? (form.get("dueDate") || dateForViewingMonth())
        : recurrence === "MONTHLY"
        ? dueDateInMonth(form.get("dueDate") || `${monthlyStartMonth}-01`, monthlyStartMonth)
        : (form.get("dueDate") || dateForViewingMonth()),
      createdAt: new Date().toISOString(),
      recurrence: recurrence === "MONTHLY_DEBT" ? "INSTALLMENT" : recurrence,
      paymentType: debtLike ? recurrence : (recurrence === "MONTHLY" ? "RECURRING" : "ONCE"),
      monthlyStartMonth: recurrence === "MONTHLY" ? monthlyStartMonth : "",
      monthlyEndMonth: recurrence === "MONTHLY" ? monthlyEndMonth : "",
      priority,
      category: legacyCategoryFor(form.get("categoryId")),
      categoryId: form.get("categoryId"),
      subcategory: form.get("subcategory"),
      customCategory: form.get("customCategory"),
      notes: String(form.get("notes") || "").trim(),
      status: priority === "SKIPPABLE" ? "DEFERABLE" : "DUE",
      paid: false,
      paidMonths: {},
      debtPayments: [],
      installmentCount,
      originalPrincipal: debtLike ? originalPrincipal : 0,
      remainingPrincipal: debtLike ? Math.max(0, originalPrincipal - initialPaidAmount) : 0
    }))
    closeModal()
    showToast("Đã thêm khoản phải trả")
    render()
  }
  const paymentForm = document.getElementById("paymentForm")
  bindCategoryPicker(paymentForm)
  bindChoiceFields(paymentForm)
  ;["amount", "originalPrincipal", "initialPaidAmount", "monthlyPayment"].forEach(name => bindMoneyInput(paymentForm.elements[name]))
  const recurrenceInput = document.getElementById("paymentRecurrence")
  const installmentField = document.getElementById("paymentInstallmentField")
  const monthlyRange = document.getElementById("paymentMonthlyRange")
  const debtSection = document.getElementById("paymentDebtSection")
  const normalAmountField = paymentForm.querySelector(".normal-amount-field")
  const dueDateField = document.getElementById("paymentDueDateField")
  const priorityInput = document.getElementById("paymentPriority")
  const estimate = document.getElementById("paymentDebtEstimate")
  const updatePaymentMode = () => {
    const debtLike = recurrenceInput.value === "MONTHLY_DEBT" || recurrenceInput.value === "INSTALLMENT"
    const skippable = priorityInput.value === "SKIPPABLE" && !debtLike
    installmentField.classList.toggle("hidden", !debtLike)
    debtSection.classList.toggle("hidden", !debtLike)
    normalAmountField.classList.toggle("hidden", debtLike)
    dueDateField.classList.toggle("hidden", skippable)
    paymentForm.elements.amount.required = !debtLike
    paymentForm.elements.originalPrincipal.required = debtLike
    paymentForm.elements.monthlyPayment.required = debtLike
    monthlyRange.classList.toggle("hidden", recurrenceInput.value !== "MONTHLY" || skippable)
    const original = parseMoney(paymentForm.elements.originalPrincipal.value)
    const monthly = parseMoney(paymentForm.elements.monthlyPayment.value)
    const count = original && monthly ? Math.ceil(original / monthly) : 0
    if (count) {
      paymentForm.elements.installmentCount.value = String(count)
      estimate.textContent = `Dự kiến ${count} kỳ. Kỳ cuối tối đa ${money(original - monthly * (count - 1))}.`
    } else {
      estimate.textContent = "Nhập tổng nợ và số tiền hàng tháng để app tính số kỳ dự kiến."
    }
  }
  recurrenceInput.onchange = updatePaymentMode
  priorityInput.onchange = updatePaymentMode
  ;["originalPrincipal", "monthlyPayment"].forEach(name => paymentForm.elements[name].addEventListener("input", updatePaymentMode))
  updatePaymentMode()
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
  const currentDataSafety = { ...emptyState.dataSafety, ...(state.dataSafety || {}) }
  state = normalizeState({
    ...clone(emptyState),
    activeTab: "dashboard",
    selectedMonth: currentMonthKey(),
    profile: {
      name: accountDisplayName(),
      createdAt: new Date().toISOString()
    },
    dataSafety: currentDataSafety
  })
  showToast("Đã đưa dữ liệu tài khoản về trắng")
  render()
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    const changedTab = state.activeTab !== tab.dataset.tab
    state.activeTab = tab.dataset.tab
    render({ resetScroll: changedTab })
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

  navigator.serviceWorker.register("sw.js?v=45").then(registration => {
    registration.update?.()
  }).catch(() => {})
}

installScrollGuard()
refreshStorageStatus()
render()
initCloudSync()


